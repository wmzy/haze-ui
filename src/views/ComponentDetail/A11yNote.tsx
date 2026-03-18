import type {ReactNode} from 'react';

import {css} from '@linaria/core';

const wrapper = css`
  padding: var(--pbl-space-3) var(--pbl-space-4);
  border-radius: var(--pbl-radius-md);
  background: var(--pbl-color-bg-subtle);
  font-family: var(--pbl-font-sans);
  font-size: var(--pbl-text-sm);
  line-height: var(--pbl-leading-relaxed);
  color: var(--pbl-color-text-secondary);
  margin-bottom: var(--pbl-space-6);

  ul {
    margin: var(--pbl-space-2) 0 0;
    padding-left: var(--pbl-space-5);
  }

  li {
    margin-bottom: var(--pbl-space-1);
  }

  strong {
    color: var(--pbl-color-text);
  }
`;

export default function A11yNote({children}: {children: ReactNode}) {
  return <div className={wrapper}>{children}</div>;
}
