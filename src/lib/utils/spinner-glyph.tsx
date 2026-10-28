import type { SVGProps } from 'react';

import { css } from '@linaria/core';

/**
 * The spinner glyph single-source: the ring-plus-arc svg and the spin
 * animation the Spinner component and Toast's `loading` variant both
 * render (the pair used to be duplicated byte-identically in both
 * files). The glyph is aria-hidden art by default — Toast inlines it
 * next to the message because the toast root is already the live
 * region, so a nested role="status" would announce the message twice;
 * Spinner wraps it in its own role="status" + aria-label span.
 *
 * The css rides with the spinner and toast families via sharedLayers
 * (split-css.mjs).
 */
export function SpinnerGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden='true'
      {...props}
    >
      <circle
        cx='12'
        cy='12'
        r='10'
        stroke='var(--haze-color-border)'
        strokeWidth='3'
      />
      <path
        d='M12 2a10 10 0 0 1 10 10'
        stroke='var(--haze-color-primary)'
        strokeWidth='3'
        strokeLinecap='round'
      />
    </svg>
  );
}

/** The shared spin loop. Geometry owners size it locally (Spinner's
 * sm/md/lg boxes, Toast's text-base glyph). */
// eslint-disable-next-line react-refresh/only-export-components -- spin 动画类与 SpinnerGlyph 必须同文件（Toast/Spinner 一站式取用，拆分会让两个消费家族多背一个共享 css 模块登记）；与 Card/ToastContainer 的 suppression 同款。
export const spinAnimation = css`
  animation: spin 0.8s linear infinite;

  /* WCAG 2.3.3: the loop period is a literal on purpose — the motion
     tokens model transition durations (120/200/300ms), not multi-second
     cycles — so reduced-motion needs this explicit collapse. A single
     0.01ms iteration parks the arc at its rest frame: the border circle
     plus primary arc stay visible, so the glyph still reads as loading
     (Spinner keeps its role="status" + aria-label; Toast's live region
     carries the announcement). */
  @media (prefers-reduced-motion: reduce) {
    animation-duration: 0.01ms;
    animation-iteration-count: 1;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;
