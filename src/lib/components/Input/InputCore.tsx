import type {ComponentPropsWithoutRef, ReactNode, Ref} from 'react';

import {css} from '@linaria/core';

type InputCoreProps = {
  value: string;
  onChange: (value: string) => void;
  /** Native change event passthrough — invoked with the DOM event after
   * `onChange`. Kept out of `rest` on purpose so the controlled `onChange`
   * callback above can never be overridden by a spread. */
  onNativeChange?: ComponentPropsWithoutRef<'input'>['onChange'];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Content rendered inside the field, before the text — an icon, a
   * currency glyph, a search marker. Layout sits in a flex row with the
   * input; the field keeps its border and focus ring (the box stays
   * one visual unit). Interactive children must re-enable pointer
   * events themselves (see PasswordInput's visibility toggle). */
  leftSection?: ReactNode;
  /** Same as {@link InputCoreProps.leftSection}, at the trailing edge —
   * the conventional home of clear buttons and visibility toggles. */
  rightSection?: ReactNode;
  /** Forwarded to the `<input>` element. */
  ref?: Ref<HTMLInputElement>;
} & Omit<ComponentPropsWithoutRef<'input'>, 'value' | 'onChange' | 'size'>;

const base = css`
  display: block;
  width: 100%;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  line-height: var(--haze-leading-normal);
  transition:
    border-color var(--haze-duration-fast),
    box-shadow var(--haze-duration-fast);

  &::placeholder {
    color: var(--haze-color-text-muted);
  }

  &:hover {
    border-color: var(--haze-color-border-hover);
  }

  &:focus {
    outline: none;
    border-color: var(--haze-color-primary);
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Forced-colors: the UA keeps the author border visible by forcing
     its color to CanvasText — restated for determinism. The box-shadow
     focus ring is dropped by the UA, so focus moves to a Highlight
     outline. Disabled inputs render GrayText at full opacity. */
  @media (forced-colors: active) {
    border-color: CanvasText;

    &:focus {
      outline: 2px solid Highlight;
    }

    &:disabled {
      opacity: 1;
      color: GrayText;
    }
  }
`;

const sizes = {
  sm: css`
    padding: var(--haze-space-1) var(--haze-space-2);
    font-size: var(--haze-text-sm);
  `,
  md: css`
    padding: var(--haze-space-2) var(--haze-space-3);
    font-size: var(--haze-text-sm);
  `,
  lg: css`
    padding: var(--haze-space-3) var(--haze-space-4);
    font-size: var(--haze-text-base);
  `,
} as const;

/* The wrapper only exists when sections are present (sections render
 * as absolute overlays inside it). Bare inputs match the pre-section
 * DOM exactly — one `<input>` with the field classes on it. */
const wrapper = css`
  position: relative;
  display: block;
  width: 100%;
`;

const section = css`
  position: absolute;
  top: 0;
  bottom: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--haze-space-8);
  /* sections are visual furniture by default; interactive children
   * (PasswordInput's toggle) opt back in with pointer-events: auto */
  pointer-events: none;

  & > *[data-section-pointer='auto'] {
    pointer-events: auto;
  }
`;

const sectionStart = css`
  inset-inline-start: var(--haze-space-1);
`;

const sectionEnd = css`
  inset-inline-end: var(--haze-space-1);
`;

/* With a section docked at an edge the input's own padding has to
 * clear it, otherwise text renders under the icon. space-10 (40px)
 * covers the default 32px section plus its 4px inset and keeps the
 * |*|centred look when the section is narrower. */
const padStart = css`
  padding-inline-start: var(--haze-space-10);
`;

const padEnd = css`
  padding-inline-end: var(--haze-space-10);
`;

export default function InputCore({
  value,
  onChange,
  onNativeChange,
  size = 'md',
  className,
  leftSection,
  rightSection,
  ref,
  ...rest
}: InputCoreProps) {
  const input = (
    <input
      ref={ref}
      data-slot='input'
      x-class={[
        base,
        sizes[size],
        leftSection !== undefined && padStart,
        rightSection !== undefined && padEnd,
        className,
      ]}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        onNativeChange?.(e);
      }}
      {...rest}
    />
  );

  if (leftSection === undefined && rightSection === undefined) {
    return input;
  }

  return (
    <span data-slot='field' x-class={[wrapper]}>
      {leftSection !== undefined && (
        <span data-slot='left-section' x-class={[section, sectionStart]}>
          {leftSection}
        </span>
      )}
      {input}
      {rightSection !== undefined && (
        <span data-slot='right-section' x-class={[section, sectionEnd]}>
          {rightSection}
        </span>
      )}
    </span>
  );
}

export type {InputCoreProps};
