import type { Control } from 'react-use-control';

import { css } from '@linaria/core';
import { useState, useRef, useEffect } from 'react';
import { useControl } from 'react-use-control';

import Calendar from './Calendar';

type DatepickerProps = {
  value?: Control<string> | string;
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

export default function Datepicker({
  value: valueControl,
  min,
  max,
  placeholder = 'Select date',
  className,
}: DatepickerProps) {
  const [value, setValue] = useControl(valueControl as Control<string>, '');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} x-class={[wrapper, className]}>
      <input
        readOnly
        className={input}
        value={value}
        placeholder={placeholder}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup='dialog'
        aria-expanded={open}
      />
      <div x-class={[dropdown, !open && hiddenStyle]}>
        <Calendar
          value={value}
          min={min}
          max={max}
          onSelect={(date) => {
            setValue(date);
            setOpen(false);
          }}
        />
      </div>
    </div>
  );
}

export type { DatepickerProps };
