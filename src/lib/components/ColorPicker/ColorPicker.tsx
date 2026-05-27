import type { Control } from 'react-use-control';

import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

type ColorPickerProps = {
  value?: Control<string> | string;
  presets?: string[];
  onChange?: (color: string) => void;
  className?: string;
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
  width: 40px;
  height: 40px;
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

const textInput = css`
  flex: 1;
  height: 40px;
  padding: 0 var(--haze-space-3);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-size: var(--haze-text-sm);
  font-family: var(--haze-font-mono);
  outline: none;

  &:focus {
    border-color: var(--haze-color-primary);
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

const presetsRow = css`
  display: flex;
  flex-wrap: wrap;
  gap: var(--haze-space-2);
`;

const presetBtn = css`
  width: 24px;
  height: 24px;
  border-radius: var(--haze-radius-full);
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.15s;

  &:hover {
    transform: scale(1.1);
  }
`;

const activePreset = css`
  border-color: var(--haze-color-text);
  box-shadow: 0 0 0 2px var(--haze-color-bg);
`;

export default function ColorPicker({
  value: valueControl,
  presets,
  onChange,
  className,
}: ColorPickerProps) {
  const [value, setValue] = useControl(valueControl as Control<string>, '#000000');

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    onChange?.(v);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    onChange?.(v);
  };

  const handlePreset = (color: string) => {
    setValue(color);
    onChange?.(color);
  };

  return (
    <div x-class={[container, className]}>
      <div x-class={[previewRow]}>
        <input
          type="color"
          x-class={[colorInput]}
          value={value}
          onChange={handleColorChange}
        />
        <input
          type="text"
          x-class={[textInput]}
          value={value}
          onChange={handleTextChange}
        />
      </div>
      {presets && presets.length > 0 && (
        <div x-class={[presetsRow]}>
          {presets.map((color) => (
            <button
              key={color}
              type="button"
              x-class={[presetBtn, value === color && activePreset]}
              style={{ background: color }}
              aria-label={color}
              onClick={() => handlePreset(color)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export type { ColorPickerProps };
