import { Highlight } from '@/lib';

import { DemoPage, DemoSection, PropsSection } from './shared';

// ─── Highlight ────────────────────────────────────────────────
export default function HighlightDemo() {
  return (
    <DemoPage
      title='Highlight'
      description={
        <>
          Search-result text highlighting: marks matching substrings inside
          a text run with <code>Mark</code> elements — needles are
          regex-escaped (no innerHTML, no injection surface), multiple
          needles supported in one pass.
        </>
      }
    >
      <DemoSection title='Basic'>
        <p>
          <Highlight highlight='highlight'>Search-result highlighting with Highlight.</Highlight>
        </p>
      </DemoSection>

      <DemoSection title='Multiple needles'>
        <p>
          <Highlight highlight={['marker', 'hits']}>Multiple needles: marker, hits, marker again.</Highlight>
        </p>
      </DemoSection>

      <DemoSection title='Tone'>
        <p>
          <Highlight color='danger' highlight='error'>network error — error code 500</Highlight>
        </p>
      </DemoSection>

      <PropsSection of='HighlightProps' />
    </DemoPage>
  );
}
