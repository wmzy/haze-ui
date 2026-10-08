import type { ComponentPropsWithoutRef, ReactNode } from 'react';

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

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
  const needles = (Array.isArray(highlight) ? highlight : [highlight]).filter(
    (h) => h.length > 0
  );

  if (needles.length === 0) {
    return <>{children}</>;
  }

  const pattern = new RegExp(
    `(${needles.map(escapeRegExp).join('|')})`,
    caseSensitive ? 'g' : 'gi'
  );
  const parts = children.split(pattern);
  // With a capture group, split interleaves matched segments between
  // unmatched ones: even indexes are unmatched text, odd are matches.
  // Match-group membership is the safe test (capture positions survive
  // even when a needle equals adjacent text).
  const isMatch = (index: number) => index % 2 === 1;

  const out: ReactNode[] = [];
  parts.forEach((part, i) => {
    if (part === '') return;
    if (isMatch(i)) {
      out.push(
        <Mark key={`${i}-${part}`} data-slot='highlight' color={color} {...rest}>
          {part}
        </Mark>
      );
    } else {
      out.push(part);
    }
  });
  return <>{out}</>;
}

export type { HighlightProps };
