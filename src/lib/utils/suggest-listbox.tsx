import type { ChangeEvent, Ref, RefObject, SyntheticEvent } from 'react';
import type { FloatingBehavior } from './floating';
import type { SuggestMarker } from './suggest-marker';
import type { useTextareaSuggest } from './use-textarea-suggest';

import { FloatingPanel } from './floating';
import { pickerPanelWidth } from './picker-trigger';
import {
  suggestHintRow,
  suggestListbox,
  suggestOption,
  suggestOptionHighlighted,
} from './suggest-list-skin';
import { spliceToken, suggestOptionId } from './suggest-marker';

/**
 * Shared suggestion listbox — the anchored panel PromptInput and
 * Mentions render under their textarea. Owns the two halves the
 * components had as byte-identical copies:
 *
 *  - `SuggestListbox`: the FloatingPanel wiring (bottom-span placement,
 *    listbox role, the tier-aware width cascade plus the shared panel
 *    skin and the per-site height cap) and the option/hint rows with
 *    their aria contract (ids off the listbox id, setsize/posinset,
 *    aria-disabled hint rows).
 *  - `useSuggestField`: the insert-commit sequence and the change/
 *    select event pair (below).
 *
 * The css classes come from utils/suggest-list-skin.ts and
 * utils/picker-trigger.tsx (both already registered for the two
 * families in split-css.mjs sharedLayers), so this module emits no css
 * of its own and rides no sharedLayers entry. It renders DOM — no
 * rsc-safe entry either.
 */

/** One suggestion row: what clicking inserts and what the row shows. */
export type SuggestRow = {
  /** Text inserted after the trigger character when picked. */
  value: string;
  /** Display text; falls back to `value` when omitted. */
  label?: string;
};

type SuggestListboxProps = {
  /** Behavior record produced by `useFloating` at the textarea root. */
  behavior: FloatingBehavior;
  /** Panel element ref — the positioning target `useFloating` measures. */
  panelRef: Ref<HTMLDivElement>;
  /** Listbox DOM id; the rows' ids derive from it (`suggestOptionId`). */
  id: string;
  /** Suggestion rows in list order. */
  rows: SuggestRow[];
  /** Flat index of the keyboard-highlighted row. */
  highlightIndex: number;
  /**
   * Ref onto the highlighted row element — the plain-path target of
   * utils/use-highlight-scroll (the rows never receive DOM focus, so
   * the browser does not scroll to them on its own).
   */
  rowRef: Ref<HTMLDivElement>;
  /**
   * Commits the row at the given index (row click; Enter/Tab arrive
   * through the site's keydown via `useTextareaSuggest`).
   */
  onCommit: (index: number) => void;
  /**
   * No-match hint — rendered as a non-selectable option so the
   * listbox's required owned elements stay satisfied.
   */
  emptyText: string;
  /** Loading hint; when set it replaces the rows and the no-match hint. */
  loadingText?: string;
  /** Per-site height cap class composed next to the shared panel chrome. */
  heightCapClass?: string;
};

export function SuggestListbox({
  behavior,
  panelRef,
  id,
  rows,
  highlightIndex,
  rowRef,
  onCommit,
  emptyText,
  loadingText,
  heightCapClass,
}: SuggestListboxProps) {
  return (
    <FloatingPanel
      ref={panelRef}
      behavior={behavior}
      placement="bottom-span"
      id={id}
      role="listbox"
      visualClass={[pickerPanelWidth, suggestListbox, heightCapClass]
        .filter(Boolean)
        .join(' ')}
    >
      {loadingText !== undefined ? (
        <div
          role="option"
          data-slot="loading"
          aria-selected="false"
          aria-disabled="true"
          x-class={[suggestHintRow]}
        >
          {loadingText}
        </div>
      ) : rows.length === 0 ? (
        // An aria-disabled option keeps the listbox's required owned
        // elements satisfied while nothing is actually selectable.
        <div
          role="option"
          data-slot="empty"
          aria-selected="false"
          aria-disabled="true"
          x-class={[suggestHintRow]}
        >
          {emptyText}
        </div>
      ) : (
        rows.map((row, i) => (
          <div
            key={`${row.value}:${i}`}
            role="option"
            data-slot="option"
            id={suggestOptionId(id, i)}
            aria-selected={i === highlightIndex}
            aria-setsize={rows.length}
            aria-posinset={i + 1}
            ref={i === highlightIndex ? rowRef : undefined}
            x-class={[suggestOption, i === highlightIndex && suggestOptionHighlighted]}
            onClick={() => onCommit(i)}
          >
            {row.label ?? row.value}
          </div>
        ))
      )}
    </FloatingPanel>
  );
}

/** The shared token machinery utils/use-textarea-suggest.ts returns. */
type SuggestController = ReturnType<typeof useTextareaSuggest>;

type UseSuggestFieldOptions = {
  /** Shared token machinery (utils/use-textarea-suggest.ts). */
  suggest: SuggestController;
  /** The textarea whose live DOM value the splice reads. */
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  /** Committed value — the splice fallback when the DOM is gone. */
  value: string;
  /** Applies a new text — the controlled write plus the site's callbacks. */
  onText: (text: string) => void;
  /**
   * Panel-side reaction to every caret re-evaluation, handed the
   * freshly resolved marker (PromptInput fetches suggestions with it;
   * Mentions writes its open state).
   */
  onSync: (marker: SuggestMarker | null) => void;
};

/**
 * The event half of the textarea-suggest pair: the insert-commit
 * sequence (splice the token, apply the text, stage the caret restore,
 * drop the marker) and the change/select handlers that keep the token
 * in step with edits and caret moves. The site keeps its panel model —
 * closing after a commit and reacting to syncs is `onSync`'s job, not
 * this hook's.
 */
// eslint-disable-next-line react-refresh/only-export-components -- hook 与 SuggestListbox 同文件是 floating.tsx / ToastContainer 同款 suppression：事件半边与渲染半边共享 SuggestRow/私有类型，拆文件会迫使类型公开或复制。
export function useSuggestField({
  suggest,
  textareaRef,
  value,
  onText,
  onSync,
}: UseSuggestFieldOptions) {
  /** Splices the token at the caret into trigger + `word` + space. */
  const commit = (word: string) => {
    const { marker } = suggest;
    if (!marker) return;
    const text = textareaRef.current?.value ?? value;
    // The token (trigger + query) is replaced by trigger + word + space.
    const spliced = spliceToken(text, marker, `${marker.trigger}${word} `);
    onText(spliced.text);
    suggest.stageCaretRestore(spliced.caret);
    suggest.setMarker(null);
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onText(e.target.value);
    onSync(suggest.syncFromCaret(e.target.value, e.target.selectionStart));
  };

  // Caret moves without edits (clicks, arrow keys) re-evaluate the token
  // too, so the panel follows the caret in and out of trigger tokens.
  const handleSelect = (e: SyntheticEvent<HTMLTextAreaElement>) => {
    onSync(
      suggest.syncFromCaret(e.currentTarget.value, e.currentTarget.selectionStart)
    );
  };

  return { commit, handleChange, handleSelect };
}
