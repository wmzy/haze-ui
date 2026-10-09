import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

import { useStrings } from '../LocaleProvider';

/**
 * Collapsed-long-content gate ("show more / less"). The content box is
 * height-capped while collapsed with a fade at the cut edge; the toggle
 * button flips the state. Controllable via ControlOrValue<boolean>.
 */
type SpoilerProps = {
  /** Collapsed/expanded state — see useControl (initial boolean). */
  expanded?: ControlOrValue<boolean>;
  /** Max height in px of the collapsed content preview. */
  maxHeight?: number;
  /** Toggle copy override (defaults to the spoiler locale strings). */
  showLabel?: string;
  hideLabel?: string;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

const root = css`
  display: block;
`;

const clip = css`
  overflow: hidden;
  position: relative;

  /* fade at the cut edge hints the truncation */
  &::after {
    content: '';
    position: absolute;
    inset-inline: 0;
    bottom: 0;
    height: var(--haze-space-8);
    /* Fade dissolves toward the host surface color. Defaults to the page
     * background; override --haze-spoiler-fade-bg when the spoiler sits on
     * a tinted surface (bg-subtle / bg-muted) or the dissolve mismatches. */
    background: linear-gradient(transparent, var(--haze-spoiler-fade-bg, var(--haze-color-bg)));
    pointer-events: none;

    @media (forced-colors: active) {
      background: none;
      border-top: 1px dotted GrayText;
    }
  }
`;

const toggle = css`
  appearance: none;
  background: none;
  border: none;
  padding: var(--haze-space-1) 0;
  margin-top: var(--haze-space-1);
  cursor: pointer;
  color: var(--haze-color-primary);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);

  &:hover {
    color: var(--haze-color-primary-hover);
    text-decoration: underline;
  }
`;

export default function Spoiler({
  expanded: expandedControl,
  maxHeight = 100,
  showLabel,
  hideLabel,
  className,
  children,
  ...rest
}: SpoilerProps) {
  const strings = useStrings('spoiler');
  const [expanded, setExpanded] = useControl(expandedControl, false);
  const toggleText = expanded
    ? (hideLabel ?? strings.showLess)
    : (showLabel ?? strings.showMore);

  return (
    <div data-slot='spoiler' x-class={[root, className]} {...rest}>
      <div
        data-slot='content'
        data-expanded={expanded || undefined}
        x-class={[!expanded && clip]}
        style={expanded ? undefined : { maxHeight }}
      >
        {children}
      </div>
      <button
        type='button'
        data-slot='toggle'
        x-class={[toggle]}
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
      >
        {toggleText}
      </button>
    </div>
  );
}

export type { SpoilerProps };
