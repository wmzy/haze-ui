import type { Control } from 'react-use-control';

import { css } from '@linaria/core';
import { useState, useId, useRef, useEffect } from 'react';
import { useControl } from 'react-use-control';

import ComboboxOption from './ComboboxOption';

type ComboboxProps = {
  value?: Control<string> | string;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
};

const wrapper = css`
  position: relative;
  display: inline-block;
  width: 100%;
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

const listbox = css`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: var(--haze-space-1);
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  box-shadow: var(--haze-shadow-lg);
`;

const hidden = css`
  display: none;
`;

export default function Combobox({
  value: valueControl,
  options,
  placeholder,
  className,
}: ComboboxProps) {
  const [value, setValue] = useControl(valueControl as Control<string>, '');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setHighlightIndex(-1);
  }, [query]);

  const selectOption = (val: string) => {
    setValue(val);
    const label = options.find((o) => o.value === val)?.label ?? val;
    setQuery(label);
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (
      e.key === 'Enter' &&
      highlightIndex >= 0 &&
      filtered[highlightIndex]
    ) {
      e.preventDefault();
      selectOption(filtered[highlightIndex].value);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div x-class={[wrapper, className]}>
      <input
        ref={inputRef}
        role='combobox'
        aria-expanded={open}
        aria-controls={id}
        aria-autocomplete='list'
        className={input}
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      <div id={id} role='listbox' x-class={[listbox, !open && hidden]}>
        {filtered.map((o, i) => (
          <ComboboxOption
            key={o.value}
            value={o.value}
            highlighted={i === highlightIndex}
            selected={o.value === value}
            onSelect={selectOption}
          >
            {o.label}
          </ComboboxOption>
        ))}
      </div>
    </div>
  );
}

export type { ComboboxProps };
