/**
 * Pure mask engine for MaskedInput — parsing, formatting and edit
 * application are plain functions so the caret algebra is testable
 * without a DOM.
 *
 * Mask syntax: `9` digit, `a` letter, `A` letter (uppercased on
 * accept), `*` alphanumeric. Any other character is a literal;
 * `\\` escapes the character after it (a literal `9` is written `\\9`).
 *
 * Values are *progressive*: literals render only while a filled slot
 * still follows them, so a half-typed `(999) 999-9999` field holds
 * `'(123'`, not `'(123) ____'` — the value string is always exactly
 * what the user has committed.
 */

/** The pattern token kinds; everything else in a mask is a literal. */
type MaskKind = '9' | 'a' | 'A' | '*';

export type MaskToken =
  | { type: 'literal'; char: string }
  | { type: 'slot'; kind: MaskKind };

/**
 * Outcome of applying a browser edit to a masked value. `reject` means
 * the engine ignored the edit entirely (e.g. a letter into a digit
 * slot) and the caret should be restored to `caret`; `skip` keeps the
 * value but moves the caret (typing a literal the mask itself
 * supplies jumps over it); `edit` produces the next masked value with
 * the caret placed after the edited character.
 */
export type MaskEdit =
  | { type: 'reject'; caret: number }
  | { type: 'skip'; caret: number }
  | { type: 'edit'; value: string; caret: number };

/** Which delete key produced an edit, when the Core could observe it. */
export type MaskEditDirection = 'backward' | 'forward' | null;

const LETTER = /\p{L}/u;

function charFits(char: string, kind: MaskKind): boolean {
  switch (kind) {
    case '9':
      return char >= '0' && char <= '9';
    case 'a':
    case 'A':
      return LETTER.test(char);
    default:
      return LETTER.test(char) || (char >= '0' && char <= '9');
  }
}

function transform(char: string, kind: MaskKind): string {
  return kind === 'A' ? char.toUpperCase() : char;
}

/** Tokenizes a mask pattern; a trailing lone `\\` is a literal backslash. */
export function parseMask(mask: string): MaskToken[] {
  const tokens: MaskToken[] = [];
  let escaped = false;
  for (const char of mask) {
    if (escaped) {
      tokens.push({ type: 'literal', char });
      escaped = false;
    } else if (char === '\\') {
      escaped = true;
    } else if (char === '9' || char === 'a' || char === 'A' || char === '*') {
      tokens.push({ type: 'slot', kind: char });
    } else {
      tokens.push({ type: 'literal', char });
    }
  }
  if (escaped) tokens.push({ type: 'literal', char: '\\' });
  return tokens;
}

type SlotLayout = {
  kinds: MaskKind[];
  /** Literal chars (in order) sitting before each slot, if any. */
  literalsBefore: (string[] | undefined)[];
};

function slotLayout(tokens: MaskToken[]): SlotLayout {
  const kinds: MaskKind[] = [];
  const literalsBefore: (string[] | undefined)[] = [];
  let run: string[] | undefined;
  for (const token of tokens) {
    if (token.type === 'literal') {
      (run ??= []).push(token.char);
    } else {
      kinds.push(token.kind);
      literalsBefore.push(run);
      run = undefined;
    }
  }
  return { kinds, literalsBefore };
}

/**
 * Places slot content under the tokens (dropping chars that do not fit
 * their slot) and renders the progressive-literal value, recording the
 * index of every filled slot's character inside it.
 */
function formatWithPositions(content: string, tokens: MaskToken[]) {
  const { kinds } = slotLayout(tokens);
  const placed: string[] = [];
  let ci = 0;
  for (const kind of kinds) {
    while (ci < content.length && !charFits(content.charAt(ci), kind)) ci++;
    if (ci >= content.length) break;
    placed.push(transform(content.charAt(ci), kind));
    ci++;
  }
  let value = '';
  const slotPositions: number[] = [];
  let si = 0;
  for (const token of tokens) {
    if (token.type === 'literal') {
      // Progressive literals: only the ones a filled slot still follows
      if (si < placed.length) value += token.char;
      continue;
    }
    if (si >= placed.length) break;
    slotPositions.push(value.length);
    value += placed[si]!;
    si++;
  }
  return { value, slotPositions };
}

/**
 * Formats raw slot content into its masked display string. Chars that
 * do not fit their slot kind are dropped, so formatting a foreign
 * string (a value set from outside, content from an older mask)
 * converges to the nearest legal rendering.
 */
export function formatMask(content: string, mask: string): string {
  return formatWithPositions(content, parseMask(mask)).value;
}

/**
 * Extracts the raw slot content of a masked value — the inverse of
 * {@link formatMask}. Literals are skipped where present (progressive
 * values may lack their trailing ones); whatever char sits at a slot
 * position is taken as that slot's content.
 */
export function unmask(value: string, mask: string): string {
  const tokens = parseMask(mask);
  let out = '';
  let vi = 0;
  for (const token of tokens) {
    if (token.type === 'literal') {
      if (value.charAt(vi) === token.char) vi++;
      continue;
    }
    if (vi >= value.length) break;
    out += value.charAt(vi);
    vi++;
  }
  return out;
}

/** Slot count whose characters sit before `limit` in a masked value. */
function slotsWithin(
  tokens: MaskToken[],
  value: string,
  limit: number
): number {
  let vi = 0;
  let count = 0;
  for (const token of tokens) {
    if (token.type === 'literal') {
      if (vi < limit && value.charAt(vi) === token.char) vi++;
      continue;
    }
    if (vi >= limit || vi >= value.length) break;
    count++;
    vi++;
  }
  return count;
}

/**
 * Applies one browser edit to a masked value.
 *
 * `prev` is the committed masked value, `raw` the string now sitting
 * in the DOM after the browser applied the user's edit, `caret` the
 * DOM caret (`selectionStart`) after that edit, and `direction` the
 * delete key behind a pure-literal deletion (Backspace deletes the
 * nearest preceding slot char — the react-input-mask convention —
 * while Delete/Cut restore untouched).
 *
 * Inserted chars that fit the next slot are accepted in order (a paste
 * of several chars fills several slots); chars equal to an upcoming
 * mask literal skip over it; anything else is dropped as noise. The
 * returned caret lands after the last edited character.
 */
export function applyEdit(
  prev: string,
  raw: string,
  caret: number,
  mask: string,
  direction: MaskEditDirection = null
): MaskEdit {
  if (raw === prev) return { type: 'reject', caret };

  const tokens = parseMask(mask);
  const { kinds, literalsBefore } = slotLayout(tokens);

  // What the browser changed between prev and raw.
  let start = 0;
  const maxCommon = Math.min(prev.length, raw.length);
  while (start < maxCommon && prev.charAt(start) === raw.charAt(start)) {
    start++;
  }
  let endPrev = prev.length;
  let endRaw = raw.length;
  while (
    endPrev > start &&
    endRaw > start &&
    prev.charAt(endPrev - 1) === raw.charAt(endRaw - 1)
  ) {
    endPrev--;
    endRaw--;
  }
  const removed = prev.slice(start, endPrev);
  const inserted = raw.slice(start, endRaw);

  const prevContent = unmask(prev, mask);
  const at = slotsWithin(tokens, prev, start);
  const removedSlots = slotsWithin(tokens, prev, endPrev) - at;

  if (inserted.length > 0) {
    const accepted: string[] = [];
    let skipped = false;
    for (const char of inserted) {
      if (at + accepted.length >= kinds.length) break; // mask already full
      const kind = kinds[at + accepted.length]!;
      if (charFits(char, kind)) {
        accepted.push(transform(char, kind));
        continue;
      }
      const literals = literalsBefore[at + accepted.length];
      if (literals?.includes(char)) {
        skipped = true; // typed a literal the mask supplies — jump it
        continue;
      }
      // Noise (pasted separators the mask does not supply): dropped.
    }
    if (accepted.length === 0 && removedSlots === 0) {
      if (skipped) {
        // Caret jumps to the next slot without touching the value.
        const pos = formatWithPositions(prevContent, tokens);
        const next =
          at < pos.slotPositions.length
            ? (pos.slotPositions[at]!)
            : pos.value.length;
        return { type: 'skip', caret: next };
      }
      return { type: 'reject', caret: start };
    }
    const content =
      prevContent.slice(0, at) +
      accepted.join('') +
      prevContent.slice(at + removedSlots);
    const pos = formatWithPositions(content, tokens);
    const lastAccepted = at + accepted.length - 1;
    const next =
      accepted.length > 0
        ? (pos.slotPositions[lastAccepted]!) + 1
        : at < pos.slotPositions.length
          ? (pos.slotPositions[at]!)
          : pos.value.length;
    return { type: 'edit', value: pos.value, caret: next };
  }

  // Deletion of slot chars: splice them out, caret at the edit point.
  if (removedSlots > 0) {
    const content = prevContent.slice(0, at) + prevContent.slice(at + removedSlots);
    const pos = formatWithPositions(content, tokens);
    const next =
      at < pos.slotPositions.length
        ? (pos.slotPositions[at]!)
        : pos.value.length;
    return { type: 'edit', value: pos.value, caret: next };
  }

  // Pure-literal deletion: only Backspace acts, on the nearest
  // preceding slot char; Delete and Cut leave the value alone.
  if (direction === 'backward' && at > 0) {
    const content = prevContent.slice(0, at - 1) + prevContent.slice(at);
    const pos = formatWithPositions(content, tokens);
    const next =
      at - 1 < pos.slotPositions.length
        ? (pos.slotPositions[at - 1]!)
        : pos.value.length;
    return { type: 'edit', value: pos.value, caret: next };
  }
  return {
    type: 'reject',
    caret: direction === 'backward' ? start + removed.length : start,
  };
}
