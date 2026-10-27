import type { ComponentPropsWithoutRef, Ref } from 'react';

import { css } from '@linaria/core';

import { choiceBase, choiceLabel } from '../../utils/choice-skin';

import { useRadioContext } from './RadioContext';

type RadioProps = {
  value: string;
  /** Forwarded to the radio `<input>` (not the label wrapper) — form
   * bridges and `ref.current.focus()` reach. */
  ref?: Ref<HTMLInputElement>;
} & Omit<
  ComponentPropsWithoutRef<'input'>,
  'type' | 'value' | 'name' | 'checked' | 'onChange'
>;

/* Radio-specific skin on top of the shared choice base
 * (utils/choice-skin.ts): the round radius and every :checked
 * decoration — the primary ring + dot and their forced-colors arms. */
const radioSkin = css`
  border-radius: var(--haze-radius-full);

  &:checked {
    border-color: var(--haze-color-primary);
  }

  &:checked::after {
    content: '';
    position: absolute;
    top: 5px;
    inset-inline-start: 5px;
    width: 12px;
    height: 12px;
    border-radius: var(--haze-radius-full);
    background: var(--haze-color-primary);
  }

  /* Forced-colors: the UA flattens the checked dot onto Canvas — the
     selection would vanish. The checked dot renders CanvasText and the
     disabled dot GrayText (Windows-native radio rendering). */
  @media (forced-colors: active) {
    &:checked::after {
      background: CanvasText;
    }

    &:disabled::after {
      background: GrayText;
    }
  }
`;

/* Radio label extra on top of the shared choice label base: the sm
 * text chrome. */
const radioLabel = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);
`;

export default function Radio({
  value,
  className,
  children,
  ref,
  ...rest
}: RadioProps & { children?: React.ReactNode }) {
  const ctx = useRadioContext();

  return (
    <label data-slot='label' x-class={[choiceLabel, radioLabel, className]}>
      <input
        ref={ref}
        type='radio'
        data-slot='radio'
        x-class={[choiceBase, radioSkin]}
        name={ctx?.name}
        value={value}
        checked={ctx ? ctx.value === value : undefined}
        onChange={() => ctx?.setValue(value)}
        {...rest}
      />
      {children}
    </label>
  );
}

export type { RadioProps };
