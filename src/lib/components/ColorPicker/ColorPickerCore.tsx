import type { Ref } from 'react';

import { css } from '@linaria/core';

import { useStrings } from '../LocaleProvider';

import { fieldChrome, fieldSizes, nativeFieldChrome } from '../../utils/field-skin';

type ColorPickerCoreProps = {
  value: string;
  onChange: (value: string) => void;
  presets?: string[];
  className?: string;
  /**
   * Forwarded to the color swatch `<input type='color'>` (not the root
   * div).
   */
  ref?: Ref<HTMLInputElement>;
};

const container = css`
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-3);
  font-family: var(--haze-font-sans);
`;

const previewRow = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-3);
`;

const colorInput = css`
  /* Square with the field height next to it (space-10 = 40px). */
  width: var(--haze-space-10);
  height: var(--haze-space-10);
  border: 2px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  padding: 0;
  cursor: pointer;
  background: none;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: var(--haze-radius-sm);
  }
`;

/* The hex field's surface, native chrome (hover/:focus/:disabled,
 * forced-colors) and md size are the shared field skin — see
 * utils/field-skin.ts. Local: the flex share, the fixed height keeping
 * the field as tall as the swatch input beside it, and the mono font.
 * The font override rides a `&[data-slot]` compound because it must
 * beat the chrome's sans in any cascade order — dev-server injection
 * order and dist split-css order disagree (Banner's closeBtnSize
 * precedent). */
const textInput = css`
  flex: 1;
  height: var(--haze-space-10);

  &[data-slot='text-input'] {
    font-family: var(--haze-font-mono);
  }
`;

const presetsRow = css`
  display: flex;
  flex-wrap: wrap;
  gap: var(--haze-space-2);
`;

const presetBtn = css`
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--haze-radius-full);
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color var(--haze-duration-fast), transform var(--haze-duration-fast);

  &:hover {
    transform: scale(1.1);
  }
`;

const activePreset = css`
  border-color: var(--haze-color-text);
  box-shadow: 0 0 0 2px var(--haze-color-bg);
`;

export default function ColorPickerCore({
  value,
  onChange,
  presets,
  className,
  ref,
}: ColorPickerCoreProps) {
  const strings = useStrings('colorPicker');
  return (
    <div data-slot="color-picker" x-class={[container, className]}>
      <div data-slot="preview" x-class={[previewRow]}>
        <input
          ref={ref}
          type="color"
          data-slot="color-input"
          x-class={[colorInput]}
          value={value}
          aria-label={strings.pickColor}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          type="text"
          data-slot="text-input"
          x-class={[fieldChrome, nativeFieldChrome, fieldSizes.md, textInput]}
          value={value}
          aria-label={strings.hexColor}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {presets && presets.length > 0 && (
        <div data-slot="swatch-row" x-class={[presetsRow]}>
          {presets.map((color) => (
            <button
              key={color}
              type="button"
              data-slot="swatch-item"
              x-class={[presetBtn, value === color && activePreset]}
              style={{ background: color }}
              aria-label={color}
              onClick={() => onChange(color)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export type { ColorPickerCoreProps };
