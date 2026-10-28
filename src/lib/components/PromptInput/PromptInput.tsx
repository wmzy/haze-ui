import type {
  ChangeEvent,
  ComponentPropsWithoutRef,
  Dispatch,
  KeyboardEvent,
  SetStateAction,
  SyntheticEvent,
} from 'react';
import type { ControlOrValue } from 'react-use-control';
import type { VirtualListHandle } from '../VirtualList';
import type { SuggestMarker } from '../../utils/suggest-marker';

import { css } from '@linaria/core';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useControl } from 'react-use-control';

import { FloatingPanel, useFloating } from '../../utils/floating';
import { fieldChrome, focusWithinRing } from '../../utils/field-skin';
import { listWrap, tag as tagStyle, removeBtn } from '../../utils/tag-skin';
import { pickerPanelWidth } from '../../utils/picker-trigger';
import {
  suggestHintRow,
  suggestListbox,
  suggestOption,
  suggestOptionHighlighted,
} from '../../utils/suggest-list-skin';
import { spliceToken, suggestOptionId } from '../../utils/suggest-marker';
import { useTextareaSuggest } from '../../utils/use-textarea-suggest';
import { useHighlightScroll } from '../../utils/use-highlight-scroll';
import { useAutosizeTextarea } from '../../hooks/useAutosizeTextarea';
import { mergeRefs } from '../../utils/refs';
import { useStrings } from '../LocaleProvider';
import { formatString } from '../LocaleProvider/locale';

type PromptInputProps = {
  /** Free-form draft text. */
  value?: ControlOrValue<string>;
  /** Value callback fired on every text edit (same value the control gets). */
  onChange?: (value: string) => void;
  /**
   * Inline removable tags rendered before the text (context attachments
   * for the prompt). They are never consumed by submit — removal is the
   * only mutation the component performs.
   */
  tags?: ControlOrValue<string[]>;
  /** Value callback fired when a tag is removed. */
  onTagsChange?: (tags: string[]) => void;
  /**
   * Trigger characters that open the suggestion listbox while typing.
   * Defaults to `['@']`. Inert without `getSuggestions`.
   */
  triggers?: string[];
  /**
   * Suggestions for the token at the caret: called with the trigger
   * character and the text typed after it. Async responses are applied
   * in request order — a stale response is discarded once a newer
   * request has been issued.
   */
  getSuggestions?: (
    trigger: string,
    query: string
  ) => string[] | Promise<string[]>;
  /**
   * Fired when the submit key is pressed with non-empty text; the draft
   * clears afterwards (tags stay). Enter still commits a highlighted
   * suggestion first while the listbox is open.
   */
  onSubmit?: () => void;
  /**
   * `'enter'` (default): Enter submits, Shift+Enter inserts a newline.
   * `'mod-enter'`: only Ctrl/Cmd+Enter submits, plain Enter newlines.
   */
  submitKey?: 'enter' | 'mod-enter';
  placeholder?: string;
  disabled?: boolean;
  /** Auto-grow cap in text rows; beyond it the textarea scrolls. */
  maxRows?: number;
  className?: string;
} & Omit<
  ComponentPropsWithoutRef<'textarea'>,
  'value' | 'onChange' | 'placeholder' | 'className' | 'style' | 'rows'
>;

/* The field chrome (border/radius/fill, the :focus-within ring) and the
 * tag list/chip/remove-button skin are shared with TagInput — see
 * utils/field-skin.ts and utils/tag-skin.ts. The container below keeps
 * only what is PromptInput's own: the panel-anchoring wrapper, its flex
 * flow, typography and the disabled state. position:relative anchors
 * the fallback-tier suggestion panel; the always-2.25rem floor rides
 * the space scale (space-6 + space-3 = 36px). */
const container = css`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--haze-space-1);
  width: 100%;
  box-sizing: border-box;
  min-height: calc(var(--haze-space-6) + var(--haze-space-3));
  padding: var(--haze-space-2) var(--haze-space-3);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);
  transition:
    border-color var(--haze-duration-fast),
    box-shadow var(--haze-duration-fast);

  &:hover {
    border-color: var(--haze-color-border-hover);
  }
`;

const containerDisabled = css`
  opacity: 0.5;
  cursor: not-allowed;

  &:hover {
    border-color: var(--haze-color-border);
  }
`;

const textareaClass = css`
  flex: 1;
  min-width: 8rem;
  border: none;
  outline: none;
  background: none;
  resize: none;
  overflow-y: auto;
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  line-height: var(--haze-leading-relaxed);
  color: var(--haze-color-text);
  padding: 0;

  &::placeholder {
    color: var(--haze-color-text-muted);
  }
`;

/**
 * Height cap of the suggestion listbox — PromptInput's token-overridable
 * delta over the shared suggestion skin (utils/suggest-list-skin.ts),
 * which owns the rest of the panel chrome.
 */
const listMaxHeight = css`
  max-height: var(--haze-prompt-input-list-max-height, 200px);
`;

export default function PromptInput({
  value: valueControl,
  onChange,
  tags: tagsControl,
  onTagsChange,
  triggers = ['@'],
  getSuggestions,
  onSubmit,
  submitKey = 'enter',
  placeholder,
  disabled,
  maxRows,
  className,
  'aria-label': ariaLabel,
  ...rest
}: PromptInputProps) {
  const strings = useStrings('promptInput');
  const [value, setValue] = useControl(valueControl, '');
  const [tags, setTags] = useControl(tagsControl, []);

  // The token an Escape dismissed — the panel stays closed for it until
  // the caret re-enters or the token changes (null = nothing dismissed).
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const id = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const activeRowRef = useRef<HTMLDivElement>(null);
  // The listbox is never virtualized; useHighlightScroll still takes the
  // handle (same call shape as Combobox/SelectFloating).
  const listRef = useRef<VirtualListHandle>(null);
  // Request sequence for async getSuggestions: only the newest request's
  // response may land — stale ones are dropped on arrival.
  const requestSeqRef = useRef(0);

  const completionEnabled = Boolean(getSuggestions && triggers.length > 0);

  // Shared token machinery (utils/use-textarea-suggest.ts): the marker
  // state, the keyboard highlight and the post-insert caret restore.
  const suggest = useTextareaSuggest({
    enabled: completionEnabled,
    triggers,
    textareaRef,
    value,
  });
  const { marker, markerKey, highlightIndex } = suggest;

  const open =
    completionEnabled && marker !== null && dismissedKey !== markerKey;

  // Any caret re-entry into a token re-arms the panel after Escape —
  // the dismissed key belongs to the previous caret visit only.
  const [prevMarker, setPrevMarker] = useState(marker);
  if (marker !== prevMarker) {
    setPrevMarker(marker);
    setDismissedKey(null);
  }

  const setOpen = useCallback<Dispatch<SetStateAction<boolean>>>(
    (next) => {
      if (next === false) setDismissedKey(markerKey);
    },
    [markerKey]
  );

  const floating = useFloating({
    open,
    setOpen,
    triggerRef: textareaRef,
    panelRef,
    animated: true,
  });

  // The keyboard highlight must follow into view — its rows are
  // aria-activedescendant targets that never receive DOM focus, so the
  // browser does not scroll to them on its own.
  useHighlightScroll({
    shown: floating.shown,
    highlightIndex,
    virtualized: false,
    listRef,
    rowRef: activeRowRef,
  });

  // Auto-grow: one row tall, expanding with the content up to maxRows
  // (beyond it the textarea scrolls — overflow-y lives in its class).
  // External control writes land here too, so the height always tracks
  // the committed value.
  const { ref: autosizeRef, resize } = useAutosizeTextarea({ maxRows });
  // Stable merged ref: the autosize node plus every textareaRef consumer
  // (floating trigger, caret restore, live-value reads).
  const textareaRefs = useCallback(
    (node: HTMLTextAreaElement | null) => mergeRefs(textareaRef, autosizeRef)(node),
    [autosizeRef]
  );
  useEffect(() => {
    resize();
  }, [value, maxRows, disabled, resize]);

  const label = ariaLabel ?? placeholder ?? strings.label;

  // Stable, SSR-safe DOM id per option row: listbox id + index. The
  // textarea's aria-activedescendant points here so screen readers
  // announce the keyboard highlight on rows that never receive focus.
  const optionId = (index: number) => suggestOptionId(id, index);
  const current = suggestions[highlightIndex];
  // Only while the popup is open — a closed listbox must not own the
  // textarea's active descendant.
  const activeDescendant =
    open && current !== undefined ? optionId(highlightIndex) : undefined;

  /** Fetches suggestions for the token at the caret, guarding races. */
  const fetchSuggestions = (atMarker: SuggestMarker | null) => {
    const seq = ++requestSeqRef.current;
    if (!atMarker || !getSuggestions) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    const result = getSuggestions(atMarker.trigger, atMarker.query);
    if (Array.isArray(result)) {
      setSuggestions(result);
      setLoading(false);
      return;
    }
    setLoading(true);
    void result.then(
      (list) => {
        // A newer request has been issued since — drop the stale list.
        if (requestSeqRef.current !== seq) return;
        setSuggestions(list);
        setLoading(false);
      },
      () => {
        if (requestSeqRef.current !== seq) return;
        setSuggestions([]);
        setLoading(false);
      }
    );
  };

  /** Recomputes the token (and panel visibility) from the live caret. */
  const syncFromCaret = (text: string, caret: number) => {
    fetchSuggestions(suggest.syncFromCaret(text, caret));
  };

  const updateText = (next: string) => {
    setValue(next);
    onChange?.(next);
  };

  const updateTags = (next: string[]) => {
    setTags(next);
    onTagsChange?.(next);
  };

  const insertSuggestion = (suggestion: string) => {
    if (!marker) return;
    const text = textareaRef.current?.value ?? value;
    // The token (trigger + query) is replaced by trigger + word + space.
    const spliced = spliceToken(
      text,
      marker,
      `${marker.trigger}${suggestion} `
    );
    updateText(spliced.text);
    suggest.stageCaretRestore(spliced.caret);
    suggest.setMarker(null);
    fetchSuggestions(null);
    setDismissedKey(null);
  };

  const submit = () => {
    if (disabled || !value.trim()) return;
    onSubmit?.();
    setValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Shared listbox keys first (arrows / Enter / Tab / Escape while the
    // panel is open); consumed events never reach the composer keys.
    const consumed = suggest.handleListKeyDown(e, {
      open,
      optionCount: suggestions.length,
      onCommit: (index) => {
        const selected = suggestions[index];
        if (selected !== undefined) insertSuggestion(selected);
      },
      onEscape: () => setDismissedKey(markerKey),
    });
    if (consumed) return;
    // Backspace on empty text removes the last tag (composer habit —
    // focus and caret stay in the textarea).
    if (e.key === 'Backspace' && value === '' && tags.length > 0) {
      e.preventDefault();
      updateTags(tags.slice(0, -1));
      return;
    }
    const mod = e.metaKey || e.ctrlKey;
    const wantsSubmit =
      submitKey === 'mod-enter'
        ? mod && e.key === 'Enter'
        : e.key === 'Enter' && !mod && !e.shiftKey;
    if (wantsSubmit) {
      e.preventDefault();
      submit();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    updateText(e.target.value);
    syncFromCaret(e.target.value, e.target.selectionStart);
  };

  // Caret moves without edits (clicks, arrow keys) re-evaluate the token
  // too, so the panel follows the caret in and out of trigger tokens.
  const handleSelect = (e: SyntheticEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    syncFromCaret(el.value, el.selectionStart);
  };

  return (
    <div
      // Combobox semantics live on the wrapper, not the textarea
      // (html-aria forbids role overrides on textarea, and axe flags
      // aria-expanded on a plain textbox) — and only when completion is
      // enabled; without getSuggestions the component is a plain
      // auto-growing textbox.
      data-slot='prompt-input'
      role={completionEnabled ? 'combobox' : undefined}
      aria-expanded={completionEnabled ? open : undefined}
      aria-haspopup={completionEnabled ? 'listbox' : undefined}
      aria-controls={completionEnabled ? id : undefined}
      aria-label={label}
      x-class={[fieldChrome, focusWithinRing, container, disabled && containerDisabled, className]}
    >
      {tags.length > 0 && (
        <ul data-slot='list' x-class={[listWrap]}>
          {tags.map((tag, i) => (
            <li key={`${tag}:${i}`} data-slot='tag' x-class={[tagStyle]}>
              {tag}
              <button
                type="button"
                data-slot='remove-button'
                x-class={[removeBtn]}
                aria-label={formatString(strings.removeTag, { tag })}
                disabled={disabled}
                onClick={() => updateTags(tags.filter((_, j) => j !== i))}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <textarea
        ref={textareaRefs}
        data-slot='input'
        rows={1}
        style={completionEnabled ? floating.triggerStyle : undefined}
        x-class={[textareaClass]}
        value={value}
        placeholder={placeholder}
        aria-label={label}
        aria-autocomplete={completionEnabled ? 'list' : undefined}
        aria-controls={completionEnabled ? id : undefined}
        aria-activedescendant={activeDescendant}
        disabled={disabled}
        onChange={handleChange}
        onSelect={handleSelect}
        onKeyDown={handleKeyDown}
        onPointerDown={
          completionEnabled ? floating.onTriggerPointerDown : undefined
        }
        {...rest}
      />
      {completionEnabled && (
        <FloatingPanel
          ref={panelRef}
          behavior={floating}
          placement="bottom-span"
          id={id}
          role="listbox"
          visualClass={`${pickerPanelWidth} ${suggestListbox} ${listMaxHeight}`}
        >
          {loading ? (
            // An aria-disabled option keeps the listbox's required owned
            // elements satisfied while nothing is actually selectable.
            <div
              role="option"
              data-slot='loading'
              aria-selected="false"
              aria-disabled="true"
              x-class={[suggestHintRow]}
            >
              {strings.loading}
            </div>
          ) : suggestions.length === 0 ? (
            <div
              role="option"
              data-slot='empty'
              aria-selected="false"
              aria-disabled="true"
              x-class={[suggestHintRow]}
            >
              {strings.noMatch}
            </div>
          ) : (
            suggestions.map((suggestion, i) => (
              <div
                key={`${suggestion}:${i}`}
                role="option"
                data-slot='option'
                id={optionId(i)}
                aria-selected={i === highlightIndex}
                aria-setsize={suggestions.length}
                aria-posinset={i + 1}
                ref={i === highlightIndex ? activeRowRef : undefined}
                x-class={[suggestOption, i === highlightIndex && suggestOptionHighlighted]}
                onClick={() => insertSuggestion(suggestion)}
              >
                {suggestion}
              </div>
            ))
          )}
        </FloatingPanel>
      )}
    </div>
  );
}

export type { PromptInputProps };
