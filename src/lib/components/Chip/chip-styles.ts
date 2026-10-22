import {css} from '@linaria/core';

/**
 * Shared Chip skin — the base, color and close-button classes the
 * `Chip` component wears. Living in their own module keeps the
 * component file free of style internals (react-refresh boundary) and
 * lets the per-variant color maps ship as a public constant
 * (`chipVariants`, the shadcn `buttonVariants` precedent) for
 * consumers composing custom elements with the same skin; split-css
 * groups the emitted CSS into `haze-ui/css/chip.css` with them.
 */

export const base = css`
  display: inline-flex;
  align-items: center;
  gap: var(--haze-space-1);
  border-radius: var(--haze-radius-full);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-xs);
  font-weight: var(--haze-weight-medium);
  white-space: nowrap;
  line-height: 1;
  padding: var(--haze-space-1) var(--haze-space-3);
`;

export const solidColors = {
  default: css`background: var(--haze-color-bg-muted); color: var(--haze-color-text-secondary);`,
  primary: css`background: var(--haze-color-primary-subtle); color: var(--haze-color-primary);`,
  success: css`background: var(--haze-color-success-subtle); color: var(--haze-color-success);`,
  warning: css`background: var(--haze-color-warning-subtle); color: var(--haze-color-warning);`,
  danger: css`background: var(--haze-color-danger-subtle); color: var(--haze-color-danger);`,
} as const;

export const outlineColors = {
  default: css`border: 1px solid var(--haze-color-border); color: var(--haze-color-text-secondary);`,
  primary: css`border: 1px solid var(--haze-color-primary); color: var(--haze-color-primary);`,
  success: css`border: 1px solid var(--haze-color-success); color: var(--haze-color-success);`,
  warning: css`border: 1px solid var(--haze-color-warning); color: var(--haze-color-warning);`,
  danger: css`border: 1px solid var(--haze-color-danger); color: var(--haze-color-danger);`,
} as const;

/**
 * The full variant × color skin matrix in the `ChipProps` shape —
 * `chipVariants.solid.primary` is the class a solid primary chip wears
 * (the same lookup the component itself performs).
 */
export const chipVariants = {
  solid: solidColors,
  outline: outlineColors,
} as const;

export const iconStyle = css`
  display: inline-flex;
  align-items: center;
`;

export const closeBtn = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: none;
  border-radius: var(--haze-radius-full);
  background: transparent;
  color: inherit;
  cursor: pointer;
  padding: 0;
  opacity: 0.6;
  transition: opacity var(--haze-duration-fast);
  margin-inline-start: var(--haze-space-1);

  &:hover {
    opacity: 1;
  }
`;
