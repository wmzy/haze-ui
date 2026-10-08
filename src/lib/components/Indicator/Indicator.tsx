import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { css } from '@linaria/core';

/**
 * Corner badge attached to a host element (avatar, icon button, tab) —
 * the notification-dot affordance. Render without `label` for a plain
 * dot; pass `label` for a count badge.
 */
type IndicatorProps = {
  /**
   * Badge content. Omitted/undefined renders a dot (a bare status
   * marker); a value renders a count badge. Strings longer than
   * `max`-formatted are the caller's concern (e.g. pass "99+").
   */
  label?: ReactNode;
  /** Zero/out semantics: number 0 shows by default in badge mode. */
  showZero?: boolean;
  /** Badge tone. */
  color?: 'primary' | 'danger' | 'success' | 'warning';
  /** Corner placement of the badge. */
  position?: 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<'span'>, 'color' | 'content'>;

const host = css`
  position: relative;
  display: inline-flex;
`;

const badge = css`
  position: absolute;
  top: 0;
  inset-inline-end: 0;
  translate: 50% -50%;
  min-width: var(--haze-space-4);
  height: var(--haze-space-4);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-inline: var(--haze-space-1);
  border-radius: var(--haze-radius-full);
  border: 2px solid var(--haze-color-bg);
  background: var(--haze-color-danger);
  color: var(--haze-color-text-inverse);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-xs);
  font-weight: var(--haze-weight-medium);
  line-height: 1;
  pointer-events: none;

  @media (forced-colors: active) {
    border-color: Canvas;
    background: Mark;
    color: MarkText;
  }
`;

const dot = css`
  min-width: var(--haze-space-2);
  height: var(--haze-space-2);
  padding-inline: 0;
  border-radius: var(--haze-radius-full);
`;

const positions = {
  'top-start': css`
    inset-inline-end: auto;
    inset-inline-start: 0;
    translate: -50% -50%;
  `,
  'top-end': css`
    /* base */
  `,
  'bottom-start': css`
    top: auto;
    bottom: 0;
    inset-inline-end: auto;
    inset-inline-start: 0;
    translate: -50% 50%;
  `,
  'bottom-end': css`
    top: auto;
    bottom: 0;
    translate: 50% 50%;
  `,
} as const;

const tones = {
  primary: css`
    background: var(--haze-color-primary);
  `,
  danger: css`
    background: var(--haze-color-danger);
  `,
  success: css`
    background: var(--haze-color-success);
  `,
  warning: css`
    background: var(--haze-color-warning);
    color: var(--haze-color-text);
  `,
} as const;

export default function Indicator({
  label,
  showZero = false,
  color = 'danger',
  position = 'top-end',
  className,
  children,
  ...rest
}: IndicatorProps) {
  const isDot = label === undefined || label === null;
  const hidden = !isDot && !showZero && label === 0;
  return (
    <span data-slot='indicator' x-class={[host, className]} {...rest}>
      {children}
      {!hidden && (
        <span
          data-slot={isDot ? 'dot' : 'badge'}
          /* badge text is a visual counter; the host carries the a11y
           * name (consumers add aria-label on the host) */
          aria-hidden='true'
          x-class={[badge, isDot && dot, tones[color], positions[position]]}
        >
          {isDot ? '' : label}
        </span>
      )}
    </span>
  );
}

export type { IndicatorProps };
