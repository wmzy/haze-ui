import type { ReactElement, ReactNode } from 'react';

import { Children, Fragment, cloneElement, isValidElement } from 'react';

import { reactNodeText } from '../../utils/text';

/**
 * Props of a `<CommandItem>` element as far as built-in filtering is
 * concerned. Structurally typed (not imported from Command.tsx) so the
 * helper stays free of the component-file import cycle.
 */
export type CommandItemLikeProps = {
  value?: string;
  keywords?: readonly string[];
  children?: ReactNode;
};

/** Result of one fuzzy probe: whether the query matched, and how well. */
export type FuzzyMatch = {
  matched: boolean;
  score: number;
};

// Fuzzy scoring weights. All integers, all additive — the exact values
// matter only in that they pin the documented orderings (prefix beats
// middle, contiguous beats scattered, word starts beat word middles,
// earlier beats later); ties fall back to source order at the call site.
/** Points per matched query character. */
const SCORE_MATCH = 16;
/** Bonus when a match directly continues the previous one. */
const SCORE_CONSECUTIVE = 12;
/**
 * Bonus when the matched character starts a word: text start, right
 * after a separator, or the uppercase hump of a camelCase identifier.
 */
const SCORE_WORD_START = 8;
/** Extra bonus when the query's first character hits the text's first. */
const SCORE_PREFIX = 12;
/** Penalty per character skipped between two matches. */
const PENALTY_GAP = 2;
/** Cap on the per-gap penalty so very long texts stay comparable. */
const PENALTY_GAP_MAX = 12;

/** Characters that end a word for the word-start bonus. */
const WORD_SEPARATORS = new Set([' ', '\t', '/', '-', '_', '.', ':']);

/**
 * Whether `text[index]` starts a word: position 0, right after a
 * separator, or an uppercase letter directly after a lowercase one
 * (camelCase boundary — case-sensitive, so it reads the original text).
 */
function isWordStart(text: string, index: number): boolean {
  if (index === 0) return true;
  const prev = text.charAt(index - 1);
  if (WORD_SEPARATORS.has(prev)) return true;
  const current = text.charAt(index);
  return current !== current.toLowerCase() && prev === prev.toLowerCase();
}

/**
 * Zero-dependency fuzzy match: every query character must appear in the
 * text, in order (case-insensitive subsequence — a superset of the old
 * substring match). The score ranks how well it appears:
 *
 * - prefix hits beat middle hits (`'sa'` → `Save` over `Mesa`),
 * - contiguous runs beat scattered singles (`'us'` → `User` over `Status`),
 * - word starts / camelCase humps beat word middles (`'fb'` → `fooBar`
 *   over `foobar`),
 * - earlier hits beat later ones (gap penalty between matches).
 *
 * Greedy leftmost matching: each query character binds to its next
 * occurrence after the previous one. Not globally optimal, but
 * deterministic, linear-time, and it ranks the cases above correctly.
 * An empty query matches everything with score 0.
 */
export function fuzzyMatch(query: string, text: string): FuzzyMatch {
  if (query === '') return { matched: true, score: 0 };
  const needle = query.toLowerCase();
  const haystack = text.toLowerCase();
  let score = 0;
  /** Next haystack index to scan from. */
  let cursor = 0;
  /** Haystack index of the previous matched character (-2: none yet). */
  let prev = -2;
  for (let qi = 0; qi < needle.length; qi++) {
    const found = haystack.indexOf(needle.charAt(qi), cursor);
    if (found === -1) return { matched: false, score: 0 };
    let charScore = SCORE_MATCH;
    if (found === prev + 1) charScore += SCORE_CONSECUTIVE;
    if (isWordStart(text, found)) charScore += SCORE_WORD_START;
    if (qi === 0 && found === 0) charScore += SCORE_PREFIX;
    const gap = found - cursor;
    if (gap > 0) charScore -= Math.min(PENALTY_GAP_MAX, gap * PENALTY_GAP);
    score += charScore;
    prev = found;
    cursor = found + 1;
  }
  return { matched: true, score };
}

/**
 * Concatenated text of an item's children — the default filter target
 * when no explicit `value` is given. Thin delegate to `reactNodeText`:
 * strings/numbers/booleans pass through, nested arrays and elements
 * are walked depth-first.
 */
export function commandItemText(node: ReactNode): string {
  return reactNodeText(node);
}

/**
 * Best fuzzy score of an item against the query, over its explicit
 * `value` (falling back to the concatenated children text) plus every
 * `keywords` entry. `null` when nothing matches; `0` for the empty
 * query (everything matches, no ranking signal).
 */
export function commandItemScore(
  props: CommandItemLikeProps,
  query: string
): number | null {
  if (query === '') return 0;
  let best: number | null = null;
  const candidates = [props.value ?? commandItemText(props.children)];
  for (const keyword of props.keywords ?? []) candidates.push(keyword);
  for (const candidate of candidates) {
    const { matched, score } = fuzzyMatch(query, candidate);
    if (matched && (best === null || score > best)) best = score;
  }
  return best;
}

/**
 * Whether an item matches the query at all (fuzzy subsequence over the
 * `value`/children text and `keywords`). Boolean view of
 * `commandItemScore` for callers that do not rank.
 */
export function commandItemMatches(
  props: CommandItemLikeProps,
  query: string
): boolean {
  return commandItemScore(props, query) !== null;
}

/**
 * Whether a child node is an element of the given item component (the
 * component reference is passed in — the identity check keeps the walk
 * precise without importing the component, which would cycle).
 */
export function isCommandItemElement(
  node: ReactNode,
  itemComponent: unknown
): node is ReactElement<CommandItemLikeProps> {
  return isValidElement(node) && node.type === itemComponent;
}

/**
 * Flattens command children one conceptual level: nested arrays and
 * null/booleans dissolve (Children.toArray) and fragments are
 * transparent — their descendants participate as if direct, so a
 * `<>{cond && <CommandItem/>}{items.map(...)}</>` composition behaves
 * like a flat item run. Fragment descendants get their keys prefixed
 * with the fragment's key so merged positional keys cannot collide.
 */
export function flattenCommandChildren(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) => {
    if (isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment) {
      const prefix = child.key ?? '';
      return flattenCommandChildren(child.props.children).map((descendant) =>
        isValidElement(descendant)
          ? cloneElement(descendant, { key: `${prefix}/${descendant.key ?? ''}` })
          : descendant
      );
    }
    return [child];
  });
}

/**
 * Reorders a flattened child list so matching items come first, best
 * fuzzy score first (ties keep source order — the sort is stable).
 * Non-item children (groups, wrappers, text) keep their slots: item
 * positions are refilled from the ranked queue, so interleaved
 * non-item content never jumps around. Non-matching items drop out
 * (they would render nothing anyway). With filtering off or an empty
 * query the flattened input is returned verbatim.
 */
export function orderCommandChildren(
  flatChildren: ReactNode[],
  itemComponent: unknown,
  shouldFilter: boolean,
  query: string
): ReactNode[] {
  if (!shouldFilter || query === '') return flatChildren;
  const ranked: { child: ReactNode; score: number; index: number }[] = [];
  flatChildren.forEach((child, index) => {
    if (!isCommandItemElement(child, itemComponent)) return;
    const score = commandItemScore(child.props, query);
    if (score !== null) ranked.push({ child, score, index });
  });
  ranked.sort((a, b) => b.score - a.score || a.index - b.index);
  let cursor = 0;
  return flatChildren.map((child) =>
    isCommandItemElement(child, itemComponent)
      ? ranked[cursor++]?.child ?? null
      : child
  );
}

/**
 * Collects every `<CommandItem>` element in the subtree at any nesting
 * depth (directly under the list, inside `<CommandGroup>` wrappers, or
 * behind plain layout elements/fragments). The component reference is
 * passed in by the caller — the identity check is what keeps the walk
 * precise without importing the component (import cycle).
 */
export function collectCommandItems(
  children: ReactNode,
  itemComponent: unknown
): ReactElement<CommandItemLikeProps>[] {
  // Children.toArray already flattens nested arrays and drops null/booleans.
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement<CommandItemLikeProps>(child)) return [];
    if (child.type === itemComponent) return [child];
    return collectCommandItems(child.props.children, itemComponent);
  });
}
