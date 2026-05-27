import { css } from '@linaria/core';

type DividerProps = {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
};

const base = css`
  border: none;
  background: var(--haze-color-border);
`;

const horizontal = css`
  height: 1px;
  width: 100%;
`;

const vertical = css`
  width: 1px;
  height: 1em;
  align-self: stretch;
`;

export default function Divider({
  orientation = 'horizontal',
  className,
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        x-class={[base, vertical, className]}
      />
    );
  }
  return <hr role="separator" x-class={[base, horizontal, className]} />;
}

export type { DividerProps };
