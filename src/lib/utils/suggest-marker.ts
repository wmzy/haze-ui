/**
 * Shared trigger-token primitives for textarea suggestion panels — the
 * pure text math PromptInput (multi-trigger, async source) and Mentions
 * (single trigger, static options) both build their listbox on. Split
 * out of the two components as byte-identical copies; the stateful
 * machinery lives in utils/use-textarea-suggest.ts.
 */

/** The trigger token the caret currently sits in, if any. */
export type SuggestMarker = {
  /** The trigger character that opened the token. */
  trigger: string;
  /** Index of the trigger character. */
  start: number;
  /** Caret position when the marker was recorded — the token's end. */
  end: number;
  /** Text between the trigger and the caret; the suggestion query. */
  query: string;
};

/**
 * Finds the trigger token at the caret: a trigger character at the
 * start of the text or right after whitespace, with nothing but
 * non-whitespace between it and the caret. The word-boundary rule keeps
 * email-like text ("a@b") from opening the panel.
 */
export function findTokenAtCaret(
  text: string,
  caret: number,
  triggers: string[]
): SuggestMarker | null {
  const head = Math.min(caret, text.length);
  for (let i = head - 1; i >= 0; i -= 1) {
    const ch = text[i];
    // Unreachable (i < head <= length), but the checked index signature
    // says otherwise — treat it as end-of-text.
    if (ch === undefined) return null;
    if (/\s/.test(ch)) return null;
    // A trigger only opens a token at the start of the text or right
    // after whitespace; "a@b" stays plain text.
    const before = i > 0 ? text[i - 1] : undefined;
    if (triggers.includes(ch) && (before === undefined || /\s/.test(before))) {
      return {
        trigger: ch,
        start: i,
        end: head,
        query: text.slice(i + 1, head),
      };
    }
  }
  return null;
}

/**
 * Replaces the token (trigger through its recorded end, clamped to the
 * live text) with `insertion` — the site composes it as
 * trigger + suggestion + trailing space — and returns the next text
 * plus the caret offset that must land right after the insertion. The
 * DOM value is read at insert time and may have moved past the marker's
 * coordinates, hence the clamp.
 */
export function spliceToken(
  text: string,
  marker: SuggestMarker,
  insertion: string
): { text: string; caret: number } {
  const end = Math.min(marker.end, text.length);
  return {
    text: text.slice(0, marker.start) + insertion + text.slice(end),
    caret: marker.start + insertion.length,
  };
}

/**
 * Stable, SSR-safe DOM id per suggestion row: listbox id + index, both
 * deterministic across renders and re-opens (no random values). The
 * textarea's aria-activedescendant points here so screen readers
 * announce the keyboard highlight on rows that never receive DOM focus.
 */
export const suggestOptionId = (listboxId: string, index: number) =>
  `${listboxId}-option-${index}`;
