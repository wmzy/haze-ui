import type { ControlOrValue } from 'react-use-control';

import { useControl } from 'react-use-control';
import { css } from '@linaria/core';

import { PickerCaret, pickerNativeCaret } from '../../utils/picker-trigger';
import { useStrings } from '../LocaleProvider';

type ModelOption = {
  value: string;
  label: string;
  description?: string;
  contextLength?: string;
};

type ModelPickerProps = {
  value?: ControlOrValue<string>;
  onChange?: (value: string) => void;
  options: ModelOption[];
  disabled?: boolean;
  className?: string;
};

const wrapper = css`
  position: relative;
  font-family: var(--haze-font-sans);
`;

const select = css`
  width: 100%;
  padding: var(--haze-space-2) var(--haze-space-3);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-size: var(--haze-text-sm);
  font-family: var(--haze-font-sans);
  outline: none;
  cursor: pointer;
  transition: border-color var(--haze-duration-fast), box-shadow var(--haze-duration-fast);
  appearance: none;
  padding-inline-end: var(--haze-space-8);

  &:focus {
    border-color: var(--haze-color-primary);
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default function ModelPicker({
  value: valueControl,
  onChange,
  options,
  disabled,
  className,
}: ModelPickerProps) {
  const [value, setValue] = useControl(valueControl, '');
  const strings = useStrings('modelPicker');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(e.target.value);
    onChange?.(e.target.value);
  };

  return (
    <div data-slot='model-picker' x-class={[wrapper, className]}>
      <select data-slot='trigger' x-class={[select]} aria-label={strings.label} value={value} onChange={handleChange} disabled={disabled}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} data-slot='option'>
            {opt.label}{opt.contextLength ? ` (${opt.contextLength})` : ''}
          </option>
        ))}
      </select>
      <PickerCaret x-class={pickerNativeCaret} />
    </div>
  );
}

export type { ModelPickerProps, ModelOption };
