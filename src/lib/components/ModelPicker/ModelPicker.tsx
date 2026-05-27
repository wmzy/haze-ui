import type { Control } from 'react-use-control';

import { useControl } from 'react-use-control';
import { css } from '@linaria/core';

type ModelOption = {
  value: string;
  label: string;
  description?: string;
  contextLength?: string;
};

type ModelPickerProps = {
  value?: Control<string> | string;
  onChange?: (value: string) => void;
  options: ModelOption[];
  disabled?: boolean;
  className?: string;
};

const wrapper = css`
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
  transition: border-color 0.15s, box-shadow 0.15s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M2 4l4 4 4-4'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: var(--haze-space-8);

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
  const [value, setValue] = useControl(valueControl as Control<string>, '');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(e.target.value);
    onChange?.(e.target.value);
  };

  return (
    <div x-class={[wrapper, className]}>
      <select x-class={[select]} value={value} onChange={handleChange} disabled={disabled}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}{opt.contextLength ? ` (${opt.contextLength})` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}

export type { ModelPickerProps, ModelOption };
