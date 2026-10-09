import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { css } from '@linaria/core';

/**
 * A semantic `<fieldset>` + `<legend>` grouping for form sections —
 * the native grouping HTML was made for, skinned. Screen readers name
 * the group from the legend on focus entry into any control inside,
 * which is the whole point over a bare div+heading.
 */
type FieldsetProps = {
  /** The group's legend text/content — rendered inside `<legend>` so
   * assistive tech names the whole group from it. */
  legend?: ReactNode;
  /** Disables every form control inside (native fieldset semantics). */
  disabled?: boolean;
} & Omit<ComponentPropsWithoutRef<'fieldset'>, 'disabled'>;

const fieldset = css`
  margin: 0;
  padding: var(--haze-space-3) var(--haze-space-4) var(--haze-space-4);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  min-inline-size: 0;

  /* a disabled fieldset is a whole dimmed group */
  &:disabled {
    opacity: 0.6;
  }

  @media (forced-colors: active) {
    border-color: CanvasText;
  }
`;

const legend = css`
  padding-inline: var(--haze-space-1);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-medium);
  color: var(--haze-color-text);
`;

const body = css`
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-3);
`;

export default function Fieldset({
  legend: legendContent,
  disabled,
  className,
  children,
  ...rest
}: FieldsetProps) {
  return (
    <fieldset data-slot='fieldset' disabled={disabled} x-class={[fieldset, className]} {...rest}>
      {legendContent !== undefined && legendContent !== null && (
        <legend data-slot='legend' x-class={[legend]}>{legendContent}</legend>
      )}
      <div data-slot='content' x-class={[body]}>
        {children}
      </div>
    </fieldset>
  );
}

export type { FieldsetProps };
