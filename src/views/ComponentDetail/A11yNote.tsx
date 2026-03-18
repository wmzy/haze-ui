import type { ReactNode } from 'react';

import { css } from '@linaria/core';

const wrapper = css`
  padding: var(--haze-space-3) var(--haze-space-4);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg-subtle);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  line-height: var(--haze-leading-relaxed);
  color: var(--haze-color-text-secondary);
  margin-bottom: var(--haze-space-6);

  ul {
    margin: var(--haze-space-2) 0 0;
    padding-left: var(--haze-space-5);
  }

  li {
    margin-bottom: var(--haze-space-1);
  }

  strong {
    color: var(--haze-color-text);
  }
`;

export default function A11yNote({ children }: { children: ReactNode }) {
  return <div className={wrapper}>{children}</div>;
}
