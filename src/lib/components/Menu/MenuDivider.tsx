import { css } from '@linaria/core';

import { useMenuClassNames } from './MenuContext';

const divider = css`
  height: 1px;
  margin: var(--haze-space-1) 0;
  background: var(--haze-color-border);
`;

export default function MenuDivider() {
  const classNames = useMenuClassNames();
  return (
    <div
      data-slot='separator'
      x-class={[divider, classNames?.divider]}
      role='separator'
    />
  );
}
