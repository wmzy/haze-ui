import { Button, VisuallyHidden } from '@/lib';

import { row } from '../styles';

import { DemoPage, DemoSection, PropsSection } from './shared';

// ─── VisuallyHidden ───────────────────────────────────────────
export default function VisuallyHiddenDemo() {
  return (
    <DemoPage
      title='VisuallyHidden'
      description={
        <>
          Screen-reader-only content primitive: clipped off every visual
          axis while staying in the accessibility tree — the icon-only
          button label soup, live-region text, anything AT must read but
          the eye shouldn't see.
        </>
      }
    >
      <DemoSection title='Icon-only button pattern'>
        <div className={row}>
          <Button square aria-label={undefined}>
            <span aria-hidden>⚙</span>
            <VisuallyHidden>Open settings</VisuallyHidden>
          </Button>
          <Button square>
            <span aria-hidden>🔍</span>
            <VisuallyHidden>Search</VisuallyHidden>
          </Button>
        </div>
        <p>
          Tab to the buttons — the accessible name comes from the hidden
          text, not the emoji glyph.
        </p>
      </DemoSection>

      <PropsSection of='VisuallyHiddenProps' />
    </DemoPage>
  );
}
