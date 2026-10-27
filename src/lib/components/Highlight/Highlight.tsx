import type { ComponentPropsWithoutRef } from 'react';

import { findMatchRanges, splitMatchSegments } from '../../utils/text-match';

import Mark from '../Mark/Mark';

type HighlightProps = {
  /** The text to scan. Rendering stays text-level: only matched
   * substrings become `<mark>` children, everything else stays text
   * nodes — no innerHTML, no injection surface. */
  children: string;
  /** One or more substrings to mark (empty strings are ignored). */
  highlight: string | string[];
  /**
   * Case sensitivity of the match. Default `false` (the search-box
   * convention: queries match regardless of letter case).
   */
  caseSensitive?: boolean;
  /** Mark tone applied to every matched run. */
  color?: 'warning' | 'primary' | 'success' | 'danger';
} & Omit<ComponentPropsWithoutRef<'mark'>, 'children' | 'color'>;

/**
 * Highlights matching substrings inside a text run by wrapping them in
 * {@link Mark} elements — the search-results affordance. Pure text in,
 * text + marks out; non-string children are rejected by the type.
 *
 * Renders plain text (no wrapper DOM of its own): the outer container
 * is a fragment and each match is a `<Mark data-slot="mark">`, so the
 * data-slot namespace stays the shared `mark` slot.
 */
export default function Highlight({
  children,
  highlight,
  caseSensitive = false,
  color,
  ...rest
}: HighlightProps) {
  const ranges = findMatchRanges(children, highlight, { caseSensitive });
  if (ranges.length === 0) {
    return <>{children}</>;
  }

  return (
    <>
      {splitMatchSegments(children, ranges).map((segment, index) =>
        segment.match ? (
          <Mark key={index} data-slot='highlight' color={color} {...rest}>
            {segment.text}
          </Mark>
        ) : (
          segment.text
        )
      )}
    </>
  );
}

export type { HighlightProps };
