import type { ReactNode } from 'react';

import { css } from '@linaria/core';
import { createContext, useContext, useState, useMemo } from 'react';

type CommandContextValue = {
  query: string;
  setQuery: (q: string) => void;
};

const CommandContext = createContext<CommandContextValue | undefined>(undefined);

function useCommandContext() {
  const ctx = useContext(CommandContext);
  if (!ctx) throw new Error('Command sub-components must be used within <Command>');
  return ctx;
}

type CommandProps = {
  children: ReactNode;
  className?: string;
};

const base = css`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-lg);
  background: var(--haze-color-bg);
  font-family: var(--haze-font-sans);
  overflow: hidden;
  width: 100%;
  max-width: 400px;
`;

export default function Command({ children, className }: CommandProps) {
  const [query, setQuery] = useState('');
  const value = useMemo(() => ({ query, setQuery }), [query]);

  return (
    <CommandContext.Provider value={value}>
      <div x-class={[base, className]} role="combobox">
        {children}
      </div>
    </CommandContext.Provider>
  );
}

// CommandInput
type CommandInputProps = {
  placeholder?: string;
  className?: string;
};

const inputStyle = css`
  width: 100%;
  padding: var(--haze-space-3) var(--haze-space-4);
  border: none;
  border-bottom: 1px solid var(--haze-color-border);
  background: transparent;
  color: var(--haze-color-text);
  font-size: var(--haze-text-sm);
  font-family: var(--haze-font-sans);
  outline: none;

  &::placeholder {
    color: var(--haze-color-text-muted);
  }
`;

export function CommandInput({ placeholder, className }: CommandInputProps) {
  const { query, setQuery } = useCommandContext();
  return (
    <input
      x-class={[inputStyle, className]}
      type="text"
      placeholder={placeholder}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

// CommandList
type CommandListProps = {
  children: ReactNode;
  className?: string;
};

const listStyle = css`
  max-height: 300px;
  overflow-y: auto;
  padding: var(--haze-space-1);
`;

export function CommandList({ children, className }: CommandListProps) {
  return (
    <div x-class={[listStyle, className]} role="listbox">
      {children}
    </div>
  );
}

// CommandItem
type CommandItemProps = {
  children: ReactNode;
  className?: string;
  onSelect?: () => void;
};

const itemStyle = css`
  padding: var(--haze-space-2) var(--haze-space-3);
  border-radius: var(--haze-radius-md);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: var(--haze-color-bg-subtle);
  }
`;

export function CommandItem({ children, className, onSelect }: CommandItemProps) {
  const { query } = useCommandContext();
  const text = typeof children === 'string' ? children : '';
  const visible = !query || text.toLowerCase().includes(query.toLowerCase());

  if (!visible) return null;

  return (
    <div
      x-class={[itemStyle, className]}
      role="option"
      onClick={onSelect}
    >
      {children}
    </div>
  );
}

export type { CommandProps, CommandInputProps, CommandListProps, CommandItemProps };
