import type { ComponentPropsWithoutRef, Ref, ReactNode } from 'react';

import { css } from '@linaria/core';

import { choiceBase, choiceLabel } from '../../utils/choice-skin';

type CheckboxCoreProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Native change event passthrough — invoked with the DOM event after
   * `onChange`, so a spread can never override the controlled callback. */
  onNativeChange?: ComponentPropsWithoutRef<'input'>['onChange'];
  label?: ReactNode;
  className?: string;
  /** Forwarded to the checkbox `<input>` element. */
  ref?: Ref<HTMLInputElement>;
} & Omit<ComponentPropsWithoutRef<'input'>, 'checked' | 'onChange' | 'type'>;

/* Checkbox-specific skin on top of the shared choice base
 * (utils/choice-skin.ts): the square radius and every :checked
 * decoration — the primary fill + drawn checkmark and their
 * forced-colors arms. */
const checkboxSkin = css`
  border-radius: var(--haze-radius-sm);

  &:checked {
    background: var(--haze-color-primary);
    border-color: var(--haze-color-primary);
  }

  &:checked::after {
    content: '';
    position: absolute;
    top: 5px;
    /* physical: the checkmark is drawn from physical borders + rotate(45)
       and stays unmirrored under RTL by industry convention. */
    left: 8px;
    width: 5px;
    height: 9px;
    border: solid var(--haze-color-text-inverse);
    /* physical: drawing primitive of the same unmirrored checkmark. */
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  /* Forced-colors: the UA flattens the checked fill onto Canvas, so
     the on/off signal would vanish. The checked box goes Highlight +
     HighlightText checkmark (the Windows-native checkbox rendering);
     disabled checked boxes render GrayText. */
  @media (forced-colors: active) {
    &:checked {
      background: Highlight;
      border-color: Highlight;

      &::after {
        border-color: HighlightText;
      }
    }

    &:disabled:checked {
      background: GrayText;
      border-color: GrayText;
    }
  }
`;

/* CheckboxCore label extra on top of the shared choice label base. */
const checkboxLabel = css`
  user-select: none;
`;

export default function CheckboxCore({
  checked,
  onChange,
  onNativeChange,
  className,
  label,
  ref,
  ...rest
}: CheckboxCoreProps) {
  const input = (
    <input
      ref={ref}
      type='checkbox'
      data-slot='checkbox'
      x-class={[choiceBase, checkboxSkin, className]}
      checked={checked}
      onChange={(e) => {
        onChange(e.target.checked);
        onNativeChange?.(e);
      }}
      {...rest}
    />
  );

  if (label === undefined) {
    return input;
  }

  return (
    <label data-slot='label' x-class={[choiceLabel, checkboxLabel]}>
      {input}
      {label}
    </label>
  );
}

export type { CheckboxCoreProps };
