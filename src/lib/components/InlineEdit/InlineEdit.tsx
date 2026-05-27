import type { Control } from 'react-use-control';

import { useState, useRef, useEffect } from 'react';
import { useControl } from 'react-use-control';
import { css } from '@linaria/core';

type InlineEditProps = {
  value?: Control<string> | string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

const display = css`
  cursor: text;
  padding: var(--haze-space-1) var(--haze-space-2);
  border-radius: var(--haze-radius-md);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);
  min-height: 1.75rem;
  min-width: 2rem;
  border: 1px solid transparent;
  transition: background 0.15s;

  &:hover {
    background: var(--haze-color-muted);
  }
`;

const editing = css`
  padding: var(--haze-space-1) var(--haze-space-2);
  border: 1px solid var(--haze-color-primary);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-size: var(--haze-text-sm);
  font-family: var(--haze-font-sans);
  outline: none;
  box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  min-width: 2rem;
`;

const placeholderStyle = css`
  color: var(--haze-color-text-muted);
  font-style: italic;
`;

export default function InlineEdit({
  value: valueControl,
  onChange,
  placeholder = 'Click to edit',
  disabled,
  className,
}: InlineEditProps) {
  const [value, setValue] = useControl(valueControl as Control<string>, '');
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const startEditing = () => {
    if (disabled) return;
    setDraft(value);
    setIsEditing(true);
  };

  const commit = () => {
    setIsEditing(false);
    if (draft !== value) {
      setValue(draft);
      onChange?.(draft);
    }
  };

  const cancel = () => {
    setIsEditing(false);
    setDraft(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') cancel();
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        x-class={[editing, className]}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
      />
    );
  }

  return (
    <span
      x-class={[display, !value && placeholderStyle, className]}
      onClick={startEditing}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') startEditing(); }}
    >
      {value || placeholder}
    </span>
  );
}

export type { InlineEditProps };
