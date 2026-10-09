import { Button, VisuallyHidden } from '@/lib';

import PropsTable from '../PropsTable';

import { intro, section, row } from '../styles';

// ─── VisuallyHidden ───────────────────────────────────────────
export default function VisuallyHiddenDemo() {
  return (
    <>
      <h1>VisuallyHidden</h1>
      <p className={intro}>
        Screen-reader-only content primitive: clipped off every visual
        axis while staying in the accessibility tree — the icon-only
        button label soup, live-region text, anything AT must read but
        the eye shouldn't see.
      </p>

      <div className={section}>
        <h2>Icon-only button pattern</h2>
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
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of='VisuallyHiddenProps' />
      </div>
    </>
  );
}
