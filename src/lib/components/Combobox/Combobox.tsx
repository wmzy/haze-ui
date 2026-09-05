import type { ControlOrValue } from 'react-use-control';

import { css } from '@linaria/core';
import { useId, useRef, useState, useEffect } from 'react';
import { useControl } from 'react-use-control';

import { FloatingPanel, useFloating } from '../../utils/floating';

import ComboboxOption from './ComboboxOption';

type ComboboxProps = {
  value?: ControlOrValue<string>;
  open?: ControlOrValue<boolean>;
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

/**
 * min-width keeps the fallback/absolute tier as wide as the input, the
 * way the anchored tier's `span-left` area does for free.
 */
const listbox = css`
  min-width: 100%;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  box-shadow: var(--haze-shadow-lg);
`;

export default function Combobox({
  value: valueControl,
  open: openControl,
  options,
  placeholder,
  className,
}: ComboboxProps) {
  const [value, setValue] = useControl(valueControl, '');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useControl(openControl, false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const floating = useFloating({
    open,
    setOpen,
    triggerRef: inputRef,
    panelRef,
    animated: true,
  });

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
        role="combobox"
        style={floating.triggerStyle}
        aria-expanded={open}
        aria-controls={id}
        aria-autocomplete="list"
        className={input}
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        // A click on an already-focused input light-dismisses the panel
        // without refiring focus — reopen explicitly so the list stays up.
        onClick={() => setOpen(true)}
        onKeyDown={handleKeyDown}
      />
      <FloatingPanel
        ref={panelRef}
        behavior={floating}
        placement="bottom-span"
        id={id}
        role="listbox"
        visualClass={listbox}
      >
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
      </FloatingPanel>
    </div>
  );
}

export type { ComboboxProps };
