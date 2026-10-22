import { css } from '@linaria/core';

import { useDropdownMenuContext } from './DropdownMenuContext';

type DropdownMenuSeparatorProps = {
  className?: string;
};

const separator = css`
  height: 1px;
  margin: var(--haze-space-1) 0;
  background: var(--haze-color-border);
`;

export default function DropdownMenuSeparator({ className }: DropdownMenuSeparatorProps) {
  const classNames = useDropdownMenuContext().classNames;
  return (
    <div
      data-slot='separator'
      x-class={[separator, classNames?.separator, className]}
      role="separator"
    />
  );
}

export type { DropdownMenuSeparatorProps };
