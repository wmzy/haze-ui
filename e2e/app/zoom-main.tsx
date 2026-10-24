/**
 * Text-zoom harness for e2e/text-zoom.spec.ts: two sibling islands with
 * identical content — the baseline island inherits the shell's px token
 * scales, the rem island re-declares spacing/typography next to the
 * remScale preset so every metric re-resolves at a 16px = 1rem base (the
 * compact-island pattern from the Density guide).
 *
 * The spec flips the root font size 16px → 32px (200% text zoom, WCAG
 * 1.4.4) and asserts computed paddings, font sizes, radii and gaps double
 * inside the rem island and stay fixed in the baseline island.
 */
import { css } from '@linaria/core';
import { createRoot } from 'react-dom/client';

import { Button } from '../../src/lib/components/Button';
import { lightTheme } from '../../src/lib/tokens/colors';
import { motion } from '../../src/lib/tokens/motion';
import { spacing } from '../../src/lib/tokens/spacing';
import { typography } from '../../src/lib/tokens/typography';
// Imported last on purpose: remScale re-declares the --haze-text-* /
// --haze-radius-* names that spacing/typography also declare, so its rule
// must follow theirs in the dev-server style injection (= module import
// order; see the tokens/zoom.ts header for the full contract).
import { remScale } from '../../src/lib/tokens/zoom';

const shell = css`
  min-height: 100vh;
  box-sizing: border-box;
  margin: 0;
  padding: 32px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 32px;
  font-family: var(--haze-font-sans);
  color: var(--haze-color-text);
`;

const island = css`
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  padding: var(--haze-space-4);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--haze-space-3);
  min-width: 240px;
`;

const islandTitle = css`
  margin: 0;
  font-size: var(--haze-text-lg);
  font-weight: var(--haze-weight-semibold);
`;

/* A plain element whose every metric is token-driven, so the spec can
 * read padding / font-size / border-radius straight off computed styles. */
const probe = css`
  margin: 0;
  padding: var(--haze-space-4);
  font-size: var(--haze-text-base);
  border-radius: var(--haze-radius-lg);
  border: 1px solid var(--haze-color-border);
`;

function Island({ title, rem }: { title: string; rem: boolean }) {
  return (
    <section
      className={rem ? `${island} ${spacing} ${typography} ${remScale}` : island}
      data-zoom-region={rem ? 'rem' : 'baseline'}
    >
      <h2 className={islandTitle}>{title}</h2>
      <p className={probe} data-slot="zoom-probe">
        token-driven probe
      </p>
      <Button>Button</Button>
    </section>
  );
}

createRoot(document.getElementById('root')!).render(
  <div
    className={`${shell} ${lightTheme} ${spacing} ${typography} ${motion}`}
  >
    <Island title="px tokens (baseline)" rem={false} />
    <Island title="remScale preset" rem={true} />
  </div>
);
