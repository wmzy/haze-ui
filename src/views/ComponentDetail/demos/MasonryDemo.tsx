import { css } from '@linaria/core';

import { Masonry } from '@/lib/components/Masonry';

import { AccessibilitySection, DemoPage, DemoSection } from './shared';

// ─── Masonry ───────────────────────────────────────────────────
const card = css`
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  padding: var(--haze-space-4);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);
`;

const heights = [6, 14, 9, 4, 11, 7, 12, 5, 10, 8, 13, 6];

function Wall({ label }: { label: string }) {
  return (
    <div className={card} style={{ height: `${heights[label.charCodeAt(0) % heights.length]}rem` }}>
      {label}
    </div>
  );
}

export default function MasonryDemo() {
  return (
    <DemoPage
      title='Masonry'
      description={
        <>
          Pinterest-style column layout: children flow into equal-width columns and stack
          independently, so tall cards never stretch short ones. Unlike Grid there is no row
          alignment — each column is its own stack. Distribution happens in JS in source
          order (greedy shortest-column), so cards read left-to-right.
        </>
      }
    >
      <DemoSection title='Basic'>
        <Masonry>
          {Array.from({ length: 12 }, (_, i) => (
            <Wall key={String.fromCharCode(65 + i)} label={String.fromCharCode(65 + i)} />
          ))}
        </Masonry>
      </DemoSection>

      <DemoSection title='Four columns, tighter gap'>
        <Masonry columns={4} gap={2}>
          {Array.from({ length: 12 }, (_, i) => (
            <Wall key={String.fromCharCode(65 + i)} label={String.fromCharCode(65 + i)} />
          ))}
        </Masonry>
      </DemoSection>

      <AccessibilitySection>
        <ul>
          <li>
            Purely presentational — plain <strong>&lt;div&gt;</strong> columns, no
            semantic role. Announce structure with an external label when the wall
            conveys meaning.
          </li>
          <li>
            Reading order follows source order (row-major), unlike CSS multicolumn which
            fills column-major.
          </li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
