import type { ComponentPropsWithoutRef } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useState, useRef, useEffect } from 'react';
import { useControl } from 'react-use-control';
import { css } from '@linaria/core';

import { useStrings } from '../LocaleProvider';
import { fieldChrome, fieldFocusRing, fieldSizes } from '../../utils/field-skin';

type InlineEditProps = {
  value?: ControlOrValue<string>;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
} & Omit<ComponentPropsWithoutRef<'input'>, 'value' | 'onChange'>;

const display = css`
  cursor: text;
  padding: var(--haze-space-1) var(--haze-space-2);
  border-radius: var(--haze-radius-md);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);
  /* Floors keep the empty/placeholder affordance clickable: 2rem is
   * exactly space-8; 1.75rem has no ladder step (there is no space-7),
   * so the literal stays. */
  min-height: 1.75rem;
  min-width: var(--haze-space-8);
  border: 1px solid transparent;
  transition: background var(--haze-duration-fast);

  &:hover {
    background: var(--haze-color-bg-muted);
  }
`;

/* The field surface (border/radius/fill) and the sm size tier
 * (padding/typography) come from utils/field-skin.ts — the local class
 * keeps only the inline-editor deltas (ink, the content floor, the
 * rest-state outline reset). The :focus skin (primary border + ring)
 * is field-skin's fieldFocusRing leaf, composed below: editing IS the
 * focused state (the input carries `autoFocus` so focus lands at
 * commit time — before the first paint — and blur commits), and its
 * pseudo specificity beats fieldChrome's border shorthand under any
 * stylesheet emission order. */
const editing = css`
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  outline: none;
  /* Content floor: an emptied draft keeps the field's footprint
   * (space-8 is the exact 2rem token). */
  min-width: var(--haze-space-8);
`;

const placeholderStyle = css`
  color: var(--haze-color-text-muted);
  font-style: italic;
`;

export default function InlineEdit({
  value: valueControl,
  onChange,
  placeholder,
  disabled,
  className,
  ...rest
}: InlineEditProps) {
  const [value, setValue] = useControl(valueControl, '');
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const strings = useStrings('inlineEdit');
  const placeholderLabel = placeholder ?? strings.placeholder;

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
        data-slot='inline-edit'
        {...rest}
        autoFocus
        x-class={[fieldChrome, fieldSizes.sm, fieldFocusRing, editing, className]}
        aria-label={placeholderLabel}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
      />
    );
  }

  return (
    <span
      data-slot='inline-edit'
      x-class={[display, !value && placeholderStyle, className]}
      onClick={startEditing}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') startEditing();
        // Space follows the native button contract: keydown only
        // swallows the page-scroll default (and the character insert),
        // activation fires on keyup — moving focus to the input
        // mid-keystroke would otherwise let the same Space land in
        // the draft.
        if (e.key === ' ') e.preventDefault();
      }}
      onKeyUp={(e) => {
        if (e.key === ' ') startEditing();
      }}
    >
      {value || placeholderLabel}
    </span>
  );
}

export type { InlineEditProps };
