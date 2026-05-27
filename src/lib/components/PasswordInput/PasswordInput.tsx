import type { Control } from 'react-use-control';

import { useState } from 'react';
import { useControl } from 'react-use-control';
import { css } from '@linaria/core';

type PasswordInputProps = {
  value?: Control<string> | string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

const wrapper = css`
  position: relative;
  display: inline-flex;
  width: 100%;
  font-family: var(--haze-font-sans);
`;

const input = css`
  width: 100%;
  padding: var(--haze-space-2) var(--haze-space-3);
  padding-right: var(--haze-space-10);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-size: var(--haze-text-sm);
  font-family: var(--haze-font-sans);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: var(--haze-color-primary);
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const toggle = css`
  position: absolute;
  right: var(--haze-space-2);
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--haze-space-2);
  min-width: 2.5rem;
  min-height: 2.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-sm);

  &:hover {
    color: var(--haze-color-text);
  }
`;

export default function PasswordInput({
  value: valueControl,
  onChange,
  placeholder,
  disabled,
  className,
}: PasswordInputProps) {
  const [value, setValue] = useControl(valueControl as Control<string>, '');
  const [visible, setVisible] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onChange?.(e.target.value);
  };

  return (
    <div x-class={[wrapper, className]}>
      <input
        x-class={[input]}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
      />
      <button
        x-class={[toggle]}
        type="button"
        onClick={() => setVisible(!visible)}
        tabIndex={-1}
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? '🙈' : '👁'}
      </button>
    </div>
  );
}

export type { PasswordInputProps };
