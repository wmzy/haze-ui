import type { CSSProperties } from 'react';

import { Grid, GridItem, ResizableGroup, ResizableHandle, ResizablePanel } from '@/lib';

import PropsTable from '../PropsTable';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
} from './shared';

/** The numbered placeholder tile in the grid demos. */
const cellStyle: CSSProperties = {
  background: 'var(--haze-color-bg-subtle)',
  padding: 'var(--haze-space-4)',
  borderRadius: 'var(--haze-radius-md)',
  textAlign: 'center',
};

// ─── Grid ──────────────────────────────────────────────────────
export default function GridDemo() {
  return (
    <DemoPage
      title='Grid'
      description='CSS Grid layout with configurable columns and gap.'
    >
      <DemoSection title='Basic'>
        <Grid columns={3} gap={3}>
          <GridItem span={1}>
            <div style={cellStyle}>1</div>
          </GridItem>
          <GridItem span={1}>
            <div style={cellStyle}>2</div>
          </GridItem>
          <GridItem span={1}>
            <div style={cellStyle}>3</div>
          </GridItem>
        </Grid>
      </DemoSection>

      <DemoSection title='Spanning Columns'>
        <Grid columns={4} gap={3}>
          <GridItem span={2}>
            <div style={{ background: 'var(--haze-color-primary-subtle)', padding: 'var(--haze-space-4)', borderRadius: 'var(--haze-radius-md)', textAlign: 'center' }}>span 2</div>
          </GridItem>
          <GridItem span={1}>
            <div style={cellStyle}>1</div>
          </GridItem>
          <GridItem span={1}>
            <div style={cellStyle}>1</div>
          </GridItem>
          <GridItem span={1} start={1}>
            <div style={{ background: 'var(--haze-color-bg-muted)', padding: 'var(--haze-space-4)', borderRadius: 'var(--haze-radius-md)', textAlign: 'center' }}>start 1</div>
          </GridItem>
        </Grid>
      </DemoSection>

      <DemoSection title='Container-query Responsive'>
        <p>
          With <code>responsive</code>, the grid becomes a container-query context and
          GridItem <code>sm</code>/<code>md</code>/<code>lg</code> spans react to the grid's
          own width — not the viewport. Breakpoints (container width):{' '}
          <code>sm</code> ≥ 384px, <code>md</code> ≥ 576px, <code>lg</code> ≥ 768px.
          Each card asks for <code>span 12 / sm 6 / md 4 / lg 3</code>: stacked
          full-width below 384px, 2 per row at sm, 3 per row at md, 4 per row at lg.
          Drag the handle to resize the grid and watch the cards reflow.
        </p>
        <div style={{ height: 280, border: '1px solid var(--haze-color-border)', borderRadius: 'var(--haze-radius-md)' }}>
          <ResizableGroup>
            <ResizablePanel id='grid-demo' defaultSize={420} minSize={200}>
              <Grid responsive columns={12} gap={3}>
                {[1, 2, 3, 4].map((n) => (
                  <GridItem key={n} span={12} sm={6} md={4} lg={3}>
                    <div style={{ background: 'var(--haze-color-primary-subtle)', padding: 'var(--haze-space-3)', borderRadius: 'var(--haze-radius-md)', textAlign: 'center', fontSize: 'var(--haze-text-sm)' }}>
                      {n} · span 12 / sm 6 / md 4 / lg 3
                    </div>
                  </GridItem>
                ))}
              </Grid>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel id='grid-hint'>
              <div style={{ padding: 'var(--haze-space-3)', height: '100%', fontSize: 'var(--haze-text-sm)', color: 'var(--haze-color-text-muted)' }}>
                Drag the separator ←→ to change the grid container's width. The
                layout is driven by container queries, so the same Grid responds
                to its own box — sidebar, panel, or card — regardless of the
                viewport.
              </div>
            </ResizablePanel>
          </ResizableGroup>
        </div>
      </DemoSection>

      <DemoSection title='Grid Props'>
        <PropsTable of='GridProps' />
      </DemoSection>

      <DemoSection title='GridItem Props'>
        <PropsTable of='GridItemProps' />
      </DemoSection>

      <AccessibilitySection>
        <ul>
          <li>
            Purely presentational — uses plain <strong>&lt;div&gt;</strong> elements
          </li>
          <li>
            No semantic meaning; add <strong>role</strong> if the grid conveys structure
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='grid' />
    </DemoPage>
  );
}
