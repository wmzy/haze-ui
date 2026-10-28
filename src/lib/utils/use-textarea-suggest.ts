import type { KeyboardEvent, RefObject } from 'react';
import type { SuggestMarker } from './suggest-marker';

import { useEffect, useRef, useState } from 'react';

import { findTokenAtCaret } from './suggest-marker';

/**
 * Shared state machine for a textarea-driven suggestion listbox — the
 * token marker, the keyboard highlight, and the post-insert caret
 * restore PromptInput and Mentions each hand-rolled identically. The
 * site keeps owning panel visibility (PromptInput derives it from the
 * token plus its Escape dismissal key; Mentions drives explicit open
 * state) and the suggestion source; this hook never touches the DOM
 * beyond the textarea's caret.
 */

/** Per-keydown edges the site composes over the shared skeleton. */
type SuggestListKeys = {
  /** Whether the listbox is currently shown — gates all handling. */
  open: boolean;
  /**
   * Number of selectable rows — clamps arrow navigation and gates
   * Enter/Tab commit.
   */
  optionCount: number;
  /**
   * Enter/Tab while open: commit the row at the given index (the
   * highlighted one, or the first when nothing was navigated — the
   * AntD Mentions / GitHub convention: no explicit highlight still
   * means "top suggestion").
   */
  onCommit: (index: number) => void;
  /** Escape while open — close/dismiss per the site's panel model. */
  onEscape: () => void;
};

type UseTextareaSuggestOptions = {
  /**
   * Whether trigger-token completion is armed at all — a site without a
   * suggestion source (PromptInput without `getSuggestions`) stays a
   * plain textarea and never records a marker.
   */
  enabled: boolean;
  /** Trigger characters that open a token. */
  triggers: string[];
  /** The textarea whose token the caret walk reads and whose caret the restore drives. */
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  /** The committed value the caret restore waits on (effect key). */
  value: string;
};

export function useTextareaSuggest({
  enabled,
  triggers,
  textareaRef,
  value,
}: UseTextareaSuggestOptions) {
  const [marker, setMarker] = useState<SuggestMarker | null>(null);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  // Token identity for the highlight reset below and the site's
  // dismissal bookkeeping: trigger + position + query together
  // distinguish every token the caret can sit in.
  const markerKey = marker
    ? `${marker.trigger}:${marker.start}:${marker.query}`
    : '';

  // Editing the token invalidates the highlight — adjust during render
  // (React-endorsed reset) so the first filtered frame already drops a
  // stale highlight. Caret moves that recompute the same token keep it.
  const [prevMarkerKey, setPrevMarkerKey] = useState(markerKey);
  if (markerKey !== prevMarkerKey) {
    setPrevMarkerKey(markerKey);
    setHighlightIndex(-1);
  }

  // After an insertion the caret must land right after the inserted
  // token, but the DOM value re-renders from the committed `value` —
  // stash the offset and apply it once that commit lands.
  const pendingCaretRef = useRef<number | null>(null);
  useEffect(() => {
    const caret = pendingCaretRef.current;
    if (caret === null) return;
    pendingCaretRef.current = null;
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(caret, caret);
  }, [value, textareaRef]);

  /**
   * Recomputes the token from the live caret and returns it, so the
   * site can update its own panel-visibility state in the same breath.
   */
  const syncFromCaret = (
    text: string,
    caret: number
  ): SuggestMarker | null => {
    const next = enabled ? findTokenAtCaret(text, caret, triggers) : null;
    setMarker(next);
    return next;
  };

  /** Stages the post-insert caret offset; applied once `value` commits. */
  const stageCaretRestore = (caret: number) => {
    pendingCaretRef.current = caret;
  };

  /**
   * Listbox keyboard handling. Returns whether the event was consumed —
   * the site's own keydown stops there instead of falling through to
   * its remaining keys.
   */
  const handleListKeyDown = (
    e: KeyboardEvent<HTMLTextAreaElement>,
    { open, optionCount, onCommit, onEscape }: SuggestListKeys
  ): boolean => {
    // The panel is typing-driven; without an open panel every key keeps
    // its native textarea behavior (newlines, caret moves, tabbing away).
    if (!open) return false;
    if (e.key === 'ArrowDown') {
      // Keep the caret put while navigating the suggestion list.
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, optionCount - 1));
      return true;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
      return true;
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      // Enter/Tab with the panel open commits a suggestion — the
      // highlighted row when the user navigated, otherwise the first
      // one. With nothing selectable the key keeps its native
      // behavior: mid-token Enter is a newline, not a submit.
      if (optionCount > 0) {
        const index =
          highlightIndex >= 0 && highlightIndex < optionCount
            ? highlightIndex
            : 0;
        // No newline / focus move — the suggestion replaces the token.
        e.preventDefault();
        onCommit(index);
      }
      return true;
    }
    if (e.key === 'Escape') {
      // Close the panel but keep the text (and the token) intact.
      onEscape();
      return true;
    }
    return false;
  };

  return {
    marker,
    markerKey,
    setMarker,
    highlightIndex,
    syncFromCaret,
    stageCaretRestore,
    handleListKeyDown,
  };
}
