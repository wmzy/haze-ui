import {css} from '@linaria/core';

const divider = css`
  height: 1px;
  margin: var(--pbl-space-1) 0;
  background: var(--pbl-color-border);
`;

export default function MenuDivider() {
  return <div className={divider} role='separator' />;
}
