import { useRef, useCallback } from 'react';
import type { Control } from 'react-use-control';
import { useControl } from 'react-use-control';
import { css } from '@linaria/core';

type OTPInputProps = {
  length?: number;
  value?: Control<string> | string;
  onChange?: (value: string) => void;
  className?: string;
};

const container = css`
  display: inline-flex;
  gap: var(--haze-space-2);
  font-family: var(--haze-font-sans);
`;

const cell = css`
  width: 2.5rem;
  height: 2.75rem;
  text-align: center;
  font-size: var(--haze-text-lg);
  font-family: var(--haze-font-mono);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus {
    border-color: var(--haze-color-primary);
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

export default function OTPInput({
  length = 6,
  value: valueControl,
  onChange,
  className,
}: OTPInputProps) {
  const [value, setValue] = useControl(valueControl as Control<string>, '');
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = useCallback(
    (index: number, char: string) => {
      const next = value.split('');
      next[index] = char.slice(-1);
      const joined = next.join('').slice(0, length);
      setValue(joined);
      onChange?.(joined);

      if (char && index < length - 1) {
        refs.current[index + 1]?.focus();
      }
    },
    [value, length, setValue, onChange],
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !value[index] && index > 0) {
        refs.current[index - 1]?.focus();
      }
    },
    [value],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').slice(0, length);
      setValue(pasted);
      onChange?.(pasted);
      const nextIndex = Math.min(pasted.length, length - 1);
      refs.current[nextIndex]?.focus();
    },
    [length, setValue, onChange],
  );

  return (
    <div x-class={[container, className]}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          x-class={[cell]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}

export type { OTPInputProps };
