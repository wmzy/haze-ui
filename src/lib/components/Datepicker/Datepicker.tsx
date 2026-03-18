import type {Control} from 'react-use-control';

import {css} from '@linaria/core';
import {useState, useRef, useEffect} from 'react';
import {useControl} from 'react-use-control';

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
  border: 1px solid var(--pbl-color-border);
  border-radius: var(--pbl-radius-md);
  background: var(--pbl-color-bg);
  color: var(--pbl-color-text);
  font-family: var(--pbl-font-sans);
  font-size: var(--pbl-text-sm);
  padding: var(--pbl-space-2) var(--pbl-space-3);
  line-height: var(--pbl-leading-normal);
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--pbl-color-primary);
    box-shadow: 0 0 0 3px var(--pbl-color-focus-ring);
  }
`;

const dropdown = css`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  margin-top: var(--pbl-space-1);
  border: 1px solid var(--pbl-color-border);
  border-radius: var(--pbl-radius-lg);
  background: var(--pbl-color-bg);
  box-shadow: var(--pbl-shadow-lg);
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
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
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

export type {DatepickerProps};
