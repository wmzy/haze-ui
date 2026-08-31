import { css } from '@linaria/core';
import { useRef, useEffect } from 'react';

import Calendar from './Calendar';

type DatepickerCoreProps = {
  value: string;
  onChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  className?: string;
};

const wrapper = css`
  position: relative;
  display: inline-block;
`;

const input = css`
  display: block;
  width: 100%;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  padding: var(--haze-space-2) var(--haze-space-3);
  line-height: var(--haze-leading-normal);
  cursor: pointer;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--haze-color-primary);
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

const dropdown = css`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  margin-top: var(--haze-space-1);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-lg);
  background: var(--haze-color-bg);
  box-shadow: var(--haze-shadow-lg);
`;

const hiddenStyle = css`
  display: none;
`;

export default function DatepickerCore({
  value,
  onChange,
  open,
  onOpenChange,
  min,
  max,
  placeholder = 'Select date',
  className,
}: DatepickerCoreProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        onOpenChange(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onOpenChange]);

  return (
    <div ref={ref} x-class={[wrapper, className]}>
      <input
        readOnly
        className={input}
        value={value}
        placeholder={placeholder}
        onClick={() => onOpenChange(!open)}
        aria-haspopup='dialog'
        aria-expanded={open}
      />
      <div x-class={[dropdown, !open && hiddenStyle]}>
        <Calendar
          value={value}
          min={min}
          max={max}
          onSelect={(date) => {
            onChange(date);
            onOpenChange(false);
          }}
        />
      </div>
    </div>
  );
}

export type { DatepickerCoreProps };
