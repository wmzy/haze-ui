import type { Ref } from 'react';

import { useState } from 'react';
import { css } from '@linaria/core';

import InputCore from '../Input/InputCore';
import { useStrings } from '../LocaleProvider';

type PasswordInputCoreProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Forwarded to the inner password `<input>` (not the wrapper div). */
  ref?: Ref<HTMLInputElement>;
};

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
  padding: var(--haze-space-1);
  min-width: var(--haze-space-6);
  min-height: var(--haze-space-6);
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
            {visible ? '🙈' : '👁'}
          </button>
        }
      />
    </div>
  );
}

export type { PasswordInputCoreProps };
