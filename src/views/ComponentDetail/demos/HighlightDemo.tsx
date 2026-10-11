import { Highlight } from '@/lib';

import PropsTable from '../PropsTable';

import { intro, section } from '../styles';

// ─── Highlight ────────────────────────────────────────────────
export default function HighlightDemo() {
  return (
    <>
      <h1>Highlight</h1>
      <p className={intro}>
        Search-result text highlighting: marks matching substrings inside
        a text run with <code>Mark</code> elements — needles are
        regex-escaped (no innerHTML, no injection surface), multiple
        needles supported in one pass.
      </p>

      <div className={section}>
        <h2>Basic</h2>
        <p>
          <Highlight highlight='highlight'>Search-result highlighting with Highlight.</Highlight>
        </p>
      </div>

      <div className={section}>
        <h2>Multiple needles</h2>
        <p>
          <Highlight highlight={['marker', 'hits']}>Multiple needles: marker, hits, marker again.</Highlight>
        </p>
      </div>

      <div className={section}>
        <h2>Tone</h2>
        <p>
          <Highlight color='danger' highlight='error'>network error — error code 500</Highlight>
        </p>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of='HighlightProps' />
      </div>
    </>
  );
}
