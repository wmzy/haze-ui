import type { ComponentPropsWithoutRef, Ref } from 'react';

import { useState } from 'react';
import { css } from '@linaria/core';

import InputCore from '../Input/InputCore';
import { useStrings } from '../LocaleProvider';
import { Eye, EyeOff } from '../../icons';

type PasswordInputCoreProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Forwarded to the inner password `<input>` (not the wrapper div). */
  ref?: Ref<HTMLInputElement>;
} & Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'value' | 'onChange' | 'size'>;

const wrapper = css`
  display: block;
  width: 100%;
  font-family: var(--haze-font-sans);
`;

const toggle = css`
  /* InputCore sections are pointer-events: none by default; this is an
   * interactive child, so it opts back in */
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /* 40px hit area (space-10) — matches InputCore's padEnd section slot;
   * the WCAG 2.5.8 floor is space-6, but shrinking a 40px target to the
   * floor is a UX regression, not a fix. */
  padding: var(--haze-space-2);
  min-width: var(--haze-space-10);
  min-height: var(--haze-space-10);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-sm);

  &:hover {
    color: var(--haze-color-text);
  }
`;

export default function PasswordInputCore({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  ref,
  ...rest
}: PasswordInputCoreProps) {
  const [visible, setVisible] = useState(false);
  const strings = useStrings('passwordInput');

  return (
    <div data-slot="password-input" x-class={[wrapper, className]}>
      <InputCore
        ref={ref}
        value={value}
        onChange={onChange}
        type={visible ? 'text' : 'password'}
        aria-label={strings.label}
        placeholder={placeholder}
        disabled={disabled}
        {...rest}
        rightSection={
          <button
            data-slot="toggle-visibility"
            data-section-pointer="auto"
            x-class={[toggle]}
            type="button"
            onClick={() => setVisible(!visible)}
            tabIndex={-1}
            aria-label={visible ? strings.hide : strings.show}
          >
            {/* 16px lucide glyph at the default stroke-2 — the in-field
               affordance convention (CopyGlyph's Check is the 14px
               compact-button tier); tinted through currentColor so the
               text-muted/hover-text pair above stays the single source. */}
            {visible ? (
              <EyeOff size={16} aria-hidden='true' focusable='false' />
            ) : (
              <Eye size={16} aria-hidden='true' focusable='false' />
            )}
          </button>
        }
      />
    </div>
  );
}

export type { PasswordInputCoreProps };
