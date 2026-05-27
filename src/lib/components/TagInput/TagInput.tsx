import { useState, useCallback } from 'react';
import type { Control } from 'react-use-control';
import { useControl } from 'react-use-control';
import { css } from '@linaria/core';

type TagInputProps = {
  value?: Control<string[]> | string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  disabled?: boolean;
  className?: string;
};

const container = css`
  display: flex;
  flex-wrap: wrap;
  gap: var(--haze-space-1);
  padding: var(--haze-space-2) var(--haze-space-3);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  font-family: var(--haze-font-sans);
  min-height: 2.25rem;
  align-items: center;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus-within {
    border-color: var(--haze-color-primary);
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }
`;

const tag = css`
  display: inline-flex;
  align-items: center;
  gap: var(--haze-space-1);
  padding: var(--haze-space-0) var(--haze-space-2);
  background: var(--haze-color-muted);
  border-radius: var(--haze-radius-sm);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);
  line-height: var(--haze-leading-relaxed);
`;

const removeBtn = css`
  display: inline-flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-xs);
  padding: 0;

  &:hover {
    color: var(--haze-color-text);
  }
`;

const inputEl = css`
  flex: 1;
  min-width: 4rem;
  border: none;
  outline: none;
  background: none;
  font-size: var(--haze-text-sm);
  font-family: var(--haze-font-sans);
  color: var(--haze-color-text);
  padding: 0;
`;

export default function TagInput({
  value: valueControl,
  onChange,
  placeholder,
  maxTags,
  disabled,
  className,
}: TagInputProps) {
  const [tags, setTags] = useControl(valueControl as Control<string[]>, []);
  const [inputValue, setInputValue] = useState('');

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim();
      if (!trimmed || tags.includes(trimmed)) return;
      if (maxTags && tags.length >= maxTags) return;
      const next = [...tags, trimmed];
      setTags(next);
      onChange?.(next);
      setInputValue('');
    },
    [tags, maxTags, setTags, onChange],
  );

  const removeTag = useCallback(
    (index: number) => {
      const next = tags.filter((_, i) => i !== index);
      setTags(next);
      onChange?.(next);
    },
    [tags, setTags, onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div x-class={[container, className]}>
      {tags.map((t, i) => (
        <span key={i} x-class={[tag]}>
          {t}
          <button x-class={[removeBtn]} type="button" onClick={() => removeTag(i)} disabled={disabled}>
            x
          </button>
        </span>
      ))}
      <input
        x-class={[inputEl]}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : undefined}
        disabled={disabled}
      />
    </div>
  );
}

export type { TagInputProps };
