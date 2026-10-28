import type {
  ChangeEvent,
  ComponentPropsWithoutRef,
  KeyboardEvent,
  Ref,
  SyntheticEvent,
} from 'react';
import type { VirtualListHandle } from '../VirtualList';

import { css } from '@linaria/core';
import { useCallback, useId, useRef, useState } from 'react';

import { FloatingPanel, useFloating } from '../../utils/floating';
import { fieldChrome, fieldSizes, nativeFieldChrome } from '../../utils/field-skin';
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
import { mergeRefs } from '../../utils/refs';
import { useStrings } from '../LocaleProvider';

export type MentionsOption = {
  /** Text inserted after the trigger character when picked. */
  value: string;
  /** Display text; falls back to `value` when omitted. */
  label?: string;
};

type MentionsCoreProps = {
  value: string;
  onChange: (value: string) => void;
  options: MentionsOption[];
  /**
   * Single character that opens the suggestion panel while typing.
   * Defaults to '@'.
   */
  trigger?: string;
  placeholder?: string;
  className?: string;
  /** Forwarded to the `<textarea>` element. */
  ref?: Ref<HTMLTextAreaElement>;
} & Omit<
  ComponentPropsWithoutRef<'textarea'>,
  'value' | 'onChange' | 'placeholder' | 'className' | 'style'
>;

const wrapper = css`
  position: relative;
  display: inline-block;
  width: 100%;
`;

/* The field base is the shared field skin (utils/field-skin.ts) — the
 * same surface trio, native chrome arms and md size Input and Textarea
 * wear. Mentions' own deltas stay here: the drag handle and border-box
 * sizing (the shared chrome leaves the box model to consumers, and
 * width:100% plus border must stay inside the box). */
const textareaDeltas = css`
  resize: vertical;
  box-sizing: border-box;
`;

/**
 * Height cap of the suggestion listbox — Mentions' fixed-cap delta over
 * the shared suggestion skin (utils/suggest-list-skin.ts), which owns
 * the rest of the panel chrome.
 */
const listMaxHeight = css`
  max-height: 200px;
`;

export default function MentionsCore({
  value,
  onChange,
  options,
  trigger = '@',
  placeholder,
  className,
  'aria-label': ariaLabel,
  ref,
  ...rest
}: MentionsCoreProps) {
  const strings = useStrings('mentions');
  const [open, setOpen] = useState(false);
  const id = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const setTextareaRef = useCallback(
    (node: HTMLTextAreaElement | null) => mergeRefs(textareaRef, ref)(node),
    [textareaRef, ref]
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const activeRowRef = useRef<HTMLDivElement>(null);
  // The listbox is never virtualized; useHighlightScroll still takes the
  // handle (same call shape as Combobox/SelectFloating).
  const listRef = useRef<VirtualListHandle>(null);

  // Shared token machinery (utils/use-textarea-suggest.ts): the marker
  // state, the keyboard highlight and the post-insert caret restore.
  const suggest = useTextareaSuggest({
    enabled: true,
    triggers: [trigger],
    textareaRef,
    value,
  });
  const { marker, highlightIndex } = suggest;

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

  // Case-insensitive prefix match against both the insertion value and
  // the display label, per the typing that followed the trigger.
  const filtered = marker
    ? options.filter((o) => {
        const q = marker.query.toLowerCase();
        return (
          o.value.toLowerCase().startsWith(q) ||
          (o.label?.toLowerCase().startsWith(q) ?? false)
        );
      })
    : [];

  // Stable, SSR-safe DOM id per option row: listbox id + index, both
  // deterministic across renders and re-opens (no random values). The
  // textarea's aria-activedescendant points here so screen readers
  // announce the keyboard highlight on rows that never receive DOM focus.
  const optionId = (index: number) => suggestOptionId(id, index);

  // Only while the popup is open — a closed listbox must not own the
  // textarea's active descendant. No highlight (or an out-of-range one
  // after the option list shrank) omits the attribute entirely.
  const activeDescendant =
    open && filtered[highlightIndex] ? optionId(highlightIndex) : undefined;

  /** Recomputes the token (and panel visibility) from the live caret. */
  const syncFromCaret = (text: string, caret: number) => {
    setOpen(suggest.syncFromCaret(text, caret) !== null);
  };

  const insertMention = (optionToInsert: MentionsOption) => {
    if (!marker) return;
    const text = textareaRef.current?.value ?? value;
    const spliced = spliceToken(
      text,
      marker,
      `${marker.trigger}${optionToInsert.value} `
    );
    onChange(spliced.text);
    suggest.stageCaretRestore(spliced.caret);
    suggest.setMarker(null);
    setOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // The panel is typing-driven; without an open panel every key keeps
    // its native textarea behavior (newlines, caret moves, tabbing away).
    suggest.handleListKeyDown(e, {
      open,
      optionCount: filtered.length,
      onCommit: (index) => {
        const selected = filtered[index];
        if (selected !== undefined) insertMention(selected);
      },
      onEscape: () => setOpen(false),
    });
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    syncFromCaret(e.target.value, e.target.selectionStart);
  };

  // Caret moves without edits (clicks, arrow keys) re-evaluate the token
  // too, so the panel follows the caret in and out of mention tokens.
  const handleSelect = (e: SyntheticEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    syncFromCaret(el.value, el.selectionStart);
  };

  return (
    <div
      // Combobox semantics live on the wrapper, not the textarea:
      // html-aria forbids role overrides on textarea (unlike input), and
      // axe flags aria-expanded on a plain textbox — the focused textarea
      // below still carries the APG combobox attrs that are legal there
      // (aria-autocomplete/controls/activedescendant).
      role="combobox"
      data-slot="mentions"
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-controls={id}
      aria-label={ariaLabel ?? placeholder ?? strings.label}
      x-class={[wrapper, className]}
    >
      <textarea
        ref={setTextareaRef}
        data-slot="input"
        style={floating.triggerStyle}
        aria-label={ariaLabel ?? placeholder ?? strings.label}
        aria-autocomplete="list"
        aria-controls={id}
        aria-activedescendant={activeDescendant}
        x-class={[fieldChrome, nativeFieldChrome, fieldSizes.md, textareaDeltas]}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onSelect={handleSelect}
        onPointerDown={floating.onTriggerPointerDown}
        onKeyDown={handleKeyDown}
        {...rest}
      />
      <FloatingPanel
        ref={panelRef}
        behavior={floating}
        placement="bottom-span"
        id={id}
        role="listbox"
        visualClass={`${pickerPanelWidth} ${suggestListbox} ${listMaxHeight}`}
      >
        {filtered.length === 0 ? (
          // An aria-disabled option keeps the listbox's required owned
          // elements satisfied while nothing is actually selectable.
          <div
            role="option"
            data-slot="empty"
            aria-selected="false"
            aria-disabled="true"
            className={suggestHintRow}
          >
            {strings.noMatch}
          </div>
        ) : (
          filtered.map((o, i) => (
            <div
              key={o.value}
              role="option"
              data-slot="item"
              id={optionId(i)}
              aria-selected={i === highlightIndex}
              aria-setsize={filtered.length}
              aria-posinset={i + 1}
              ref={i === highlightIndex ? activeRowRef : undefined}
              x-class={[suggestOption, i === highlightIndex && suggestOptionHighlighted]}
              onClick={() => insertMention(o)}
            >
              {o.label ?? o.value}
            </div>
          ))
        )}
      </FloatingPanel>
    </div>
  );
}

export type { MentionsCoreProps };
