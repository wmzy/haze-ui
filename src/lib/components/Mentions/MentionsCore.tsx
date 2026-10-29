import type { ComponentPropsWithoutRef, KeyboardEvent, Ref } from 'react';

import { css } from '@linaria/core';
import { useCallback, useId, useRef } from 'react';
import { useControl } from 'react-use-control';

import { useFloating } from '../../utils/floating';
import {
  fieldChrome,
  fieldResizeHandle,
  fieldSizes,
  nativeFieldChrome,
} from '../../utils/field-skin';
import { suggestOptionId } from '../../utils/suggest-marker';
import { SuggestListbox, useSuggestField } from '../../utils/suggest-listbox';
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
 * same surface trio, native chrome arms, md size and resize handle
 * Input and Textarea wear. Mentions' own delta below keeps only the
 * box model (the shared chrome leaves it to consumers, and width:100%
 * plus border must stay inside the box). */
const borderBox = css`
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
  // Panel visibility is internal-only (never a prop), but rides the
  // family's state primitive — the same shape SelectFloating's open
  // uses, so a future control seam lands identically.
  const [open, setOpen] = useControl(undefined, false);
  const id = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const setTextareaRef = useCallback(
    (node: HTMLTextAreaElement | null) => mergeRefs(textareaRef, ref)(node),
    [textareaRef, ref]
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const activeRowRef = useRef<HTMLDivElement>(null);

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

  // Only while the popup is open — a closed listbox must not own the
  // textarea's active descendant. No highlight (or an out-of-range one
  // after the option list shrank) omits the attribute entirely. Row
  // ids come from suggestOptionId (utils/suggest-marker.ts), the same
  // scheme SuggestListbox stamps its rows with.
  const activeDescendant =
    open && filtered[highlightIndex] ? suggestOptionId(id, highlightIndex) : undefined;

  // Shared event pair (utils/suggest-listbox.tsx): the change/select
  // handlers that keep the token in step with the caret; the panel
  // write stays here (Mentions owns explicit open state).
  const { commit: commitMention, handleChange, handleSelect } = useSuggestField({
    suggest,
    textareaRef,
    value,
    onText: onChange,
    onSync: (next) => setOpen(next !== null),
  });

  const insertMention = (optionToInsert: MentionsOption) => {
    if (!marker) return;
    commitMention(optionToInsert.value);
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
        x-class={[fieldChrome, nativeFieldChrome, fieldSizes.md, fieldResizeHandle, borderBox]}
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onSelect={handleSelect}
        onPointerDown={floating.onTriggerPointerDown}
        onKeyDown={handleKeyDown}
        {...rest}
      />
      <SuggestListbox
        behavior={floating}
        panelRef={panelRef}
        id={id}
        rows={filtered}
        highlightIndex={highlightIndex}
        rowRef={activeRowRef}
        onCommit={(index) => {
          const selected = filtered[index];
          if (selected !== undefined) insertMention(selected);
        }}
        emptyText={strings.noMatch}
        heightCapClass={listMaxHeight}
      />
    </div>
  );
}

export type { MentionsCoreProps };
