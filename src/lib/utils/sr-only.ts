import { css } from '@linaria/core';

/**
 * Visually hidden but exposed to assistive tech — the clip pattern from
 * the WCAG tutorials. Deliberately token-free: this is not a visual
 * surface, it only has to be removed from the layout entirely.
 *
 * Shared shape for every `srOnly` site; consumers needing extra
 * declarations keep them local and compose via `x-class`.
 */
export const srOnly = css`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
`;
