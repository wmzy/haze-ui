/**
 * Shared text-match helpers — the one substring search the search-style
 * consumers delegate to (Highlight's marked ranges, Tree's query filter
 * and title marking). Pure functions, zero imports: no hooks, no DOM
 * access (RSC-safe; see scripts/rsc-safe.mjs).
 */

/** A matched run: `[start, end)` offsets into the scanned text. */
export type MatchRange = [number, number];

/** One slice of a match-split text: matched runs alternating with the
 *  untouched text between them. */
export type MatchSegment = {
  /** Literal slice of the source text (original casing preserved). */
  text: string;
  /** True when the slice matched the query. */
  match: boolean;
};

/** Options of {@link findMatchRanges}. */
export type FindMatchRangesOptions = {
  /** Case sensitivity of the match. Default `false` (the search-box
   * convention: queries match regardless of letter case). */
  caseSensitive?: boolean;
};

/**
 * Non-overlapping `[start, end)` ranges of every occurrence of `query`
 * inside `text`, scanned left to right. `query` is one needle or a list;
 * empty needles are ignored, needles are matched literally (regex
 * metacharacters carry no meaning), and when several needles can match
 * at the same position the longest one wins (['cat','cats'] marks
 * "cats", not "cat" plus a stray "s"). Empty when the query is empty or
 * absent — callers render the text untouched.
 */
export function findMatchRanges(
  text: string,
  query: string | string[],
  { caseSensitive = false }: FindMatchRangesOptions = {}
): MatchRange[] {
  // Longest-first so overlapping needles resolve to the long one at a
  // given position (RegExp alternation is leftmost-alternative, not
  // longest-match: without the sort ['cat','cats'] tags "cat" in "cats"
  // and leaves a stray "s").
  const needles = (Array.isArray(query) ? query : [query])
    .map((needle) => (caseSensitive ? needle : needle.toLowerCase()))
    .filter((needle) => needle.length > 0)
    .sort((a, b) => b.length - a.length);
  if (needles.length === 0) return [];

  const haystack = caseSensitive ? text : text.toLowerCase();
  const ranges: MatchRange[] = [];

  if (needles.length === 1) {
    // Single needle: the native indexOf scan, advancing past each hit.
    const needle = needles[0]!;
    let index = haystack.indexOf(needle);
    while (index !== -1) {
      ranges.push([index, index + needle.length]);
      index = haystack.indexOf(needle, index + needle.length);
    }
    return ranges;
  }

  // Several needles: scan positions left to right, trying needles
  // longest-first at each one — the leftmost-longest match.
  const findFrom = (from: number): MatchRange | null => {
    for (let position = from; position < haystack.length; position += 1) {
      const hit = needles.find((needle) =>
        haystack.startsWith(needle, position)
      );
      if (hit !== undefined) return [position, position + hit.length];
    }
    return null;
  };

  let hit = findFrom(0);
  while (hit !== null) {
    ranges.push(hit);
    hit = findFrom(hit[1]);
  }
  return ranges;
}

/**
 * Interleave match ranges back into ordered segments: the matched runs
 * with the untouched text between them, sliced from the original text
 * so casing is preserved. Consumers map `match` runs onto their marker
 * element and render the rest as plain text nodes.
 */
export function splitMatchSegments(
  text: string,
  ranges: readonly MatchRange[]
): MatchSegment[] {
  const segments: MatchSegment[] = [];
  let cursor = 0;
  for (const [start, end] of ranges) {
    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start), match: false });
    }
    segments.push({ text: text.slice(start, end), match: true });
    cursor = end;
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), match: false });
  }
  return segments;
}
