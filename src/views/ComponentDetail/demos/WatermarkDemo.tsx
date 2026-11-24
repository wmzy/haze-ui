import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

import { Button, Watermark } from '@/lib';

import {
  AccessibilitySection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';


// ─── Watermark ──────────────────────────────────────────────────
const surface = css`
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-lg);
  background: var(--haze-color-bg);
  padding: var(--haze-space-6);
  max-width: 560px;
`;

const surfaceText = css`
  margin: 0 0 var(--haze-space-3);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-secondary);
  line-height: var(--haze-leading-normal);
`;

const row = css`
  display: flex;
  gap: var(--haze-space-3);
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: var(--haze-space-4);
`;

export default function WatermarkDemo() {
  const [fullscreenOn, setFullscreenOn] = useControl(undefined, false);

  return (
    <DemoPage
      title='Watermark'
      description={
        <>
          Tiled canvas watermark rendered as a repeating background layer —
          pointer-transparent, hidden from assistive tech, and theme-aware (the
          default color reads the text-muted token at draw time).
        </>
      }
    >
      <DemoSection title='Over content'>
        <Watermark content="haze-ui">
          <div className={surface}>
            <p className={surfaceText}>
              With children the component becomes their container: the tile
              layer stretches over this whole card. Everything underneath
              stays clickable — the overlay is pointer-events: none.
            </p>
            <Button variant="outline">Still clickable</Button>
          </div>
        </Watermark>
      </DemoSection>

      <DemoSection title='Multi-line, rotation, gap'>
        <Watermark
          content={['Haze UI', 'do not distribute']}
          font={{ size: 16, weight: 600 }}
          rotate={-12}
          gap={[120, 60]}
        >
          <div className={surface}>
            <p className={surfaceText}>
              An array renders stacked lines. `font` controls size / color /
              weight / family of the drawn text; `rotate` and `gap` shape the
              tile grid.
            </p>
          </div>
        </Watermark>
      </DemoSection>

      <DemoSection title='Fullscreen'>
        <div className={row}>
          <Button
            onClick={() => setFullscreenOn((prev) => !prev)}
            variant={fullscreenOn ? 'solid' : 'outline'}
          >
            {fullscreenOn ? 'Hide fullscreen watermark' : 'Show fullscreen watermark'}
          </Button>
          <span className={surfaceText}>
            The fixed layer never blocks the page underneath.
          </span>
        </div>
        {fullscreenOn && <Watermark content="haze-ui · internal" fullscreen zIndex={50} />}
      </DemoSection>

      <PropsSection of='WatermarkProps' />

      <AccessibilitySection>
        <ul>
          <li>
            The overlay is <strong>aria-hidden</strong> and never intercepts
            pointer events
          </li>
          <li>
            Text stays real content — only the decoration is duplicated into
            canvas
          </li>
          <li>
            Degrades to no watermark when the canvas 2d context is
            unavailable
          </li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
