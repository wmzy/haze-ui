import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { css } from '@linaria/core';

type StatusBarProps = {
  /** Items pinned to the leading edge of the bar. */
  left?: ReactNode;
  /** Items pinned to the trailing edge of the bar. */
  right?: ReactNode;
} & Omit<ComponentPropsWithoutRef<'footer'>, 'children'>;

type StatusItemProps = {
  children: ReactNode;
  /** Keeps the item visible below the mobile breakpoint where lesser items fold away. */
  priority?: boolean;
  /** Presence upgrades the item to a real button; called on activation (click, Enter, Space). */
  onSelect?: () => void;
} & Omit<ComponentPropsWithoutRef<'span'>, 'children' | 'onSelect'>;

/* Compact VSCode-style strip: one 24px row on a subtle background with a
 * hairline top border. Items inherit the bar's smallest text size. */

const bar = css`
  box-sizing: border-box;
  display: flex;
  align-items: stretch;
  gap: var(--haze-space-1);
  min-height: var(--haze-space-6);
  background: var(--haze-color-bg-subtle);
  border-block-start: 1px solid var(--haze-color-border);
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-xs);
  line-height: var(--haze-leading-tight);
`;

const group = css`
  display: flex;
  align-items: stretch;
  gap: var(--haze-space-1);
  min-width: 0;
`;

/* The auto inline-start margin keeps the trailing group glued to the end
 * edge even when the leading group is absent — justify-content alone
 * would strand a lone right group at the start of the bar. */
const groupEnd = css`
  margin-inline-start: auto;
`;

const item = css`
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: var(--haze-space-1);
  padding-inline: var(--haze-space-2);
  border: none;
  background: transparent;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  white-space: nowrap;
  transition:
    background var(--haze-duration-fast) var(--haze-ease),
    color var(--haze-duration-fast) var(--haze-ease);

  &:hover {
    background: var(--haze-color-bg-muted);
    color: var(--haze-color-text);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }

  /* Same mobile breakpoint as AppShell: informational items fold away,
   * priority items stay on screen. Attribute-driven so the rule needs no
   * class-order coordination between the two render branches. */
  @media (max-width: 768px) {
    &:not([data-priority]) {
      display: none;
    }
  }
`;

const itemAction = css`
  cursor: pointer;
`;

export default function StatusBar({
  left,
  right,
  className,
  ...rest
}: StatusBarProps) {
  return (
    <footer data-slot="status-bar" x-class={[bar, className]} {...rest}>
      {left != null && (
        <div data-slot="status-bar-left" x-class={group}>{left}</div>
      )}
      {right != null && (
        <div data-slot="status-bar-right" x-class={[group, groupEnd]}>{right}</div>
      )}
    </footer>
  );
}

function StatusItem({
  priority,
  onSelect,
  className,
  children,
  ...rest
}: StatusItemProps) {
  const classes = [item, onSelect != null && itemAction, className];
  const priorityAttr = priority ? 'true' : undefined;

  if (onSelect != null) {
    return (
      <button
        type="button"
        data-slot="status-item"
        data-priority={priorityAttr}
        x-class={classes}
        onClick={onSelect}
        {...rest}
      >
        {children}
      </button>
    );
  }

  return (
    <span
      data-slot="status-item"
      data-priority={priorityAttr}
      x-class={classes}
      {...rest}
    >
      {children}
    </span>
  );
}

export { StatusItem };
export type { StatusBarProps, StatusItemProps };
