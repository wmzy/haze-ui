import { css } from '@linaria/core';

import { useContextMenuContext } from './ContextMenuContext';

type ContextMenuSeparatorProps = {
  className?: string;
};

const separator = css`
  height: 1px;
  margin: var(--haze-space-1) 0;
  background: var(--haze-color-border);
`;

export default function ContextMenuSeparator({ className }: ContextMenuSeparatorProps) {
  const classNames = useContextMenuContext().classNames;
  return (
    <div
      data-slot='separator'
      x-class={[separator, classNames?.separator, className]}
      role="separator"
    />
  );
}

export type { ContextMenuSeparatorProps };
