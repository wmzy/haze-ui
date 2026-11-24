import { ScrollArea, Scrollbar, ScrollViewport } from '@/lib';

import {
  AccessibilitySection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

const itemStyle = { margin: '0 0 var(--haze-space-2)' } as const;

function Items({ count }: { count: number }) {
  return (
    <div style={{ padding: 'var(--haze-space-2)' }}>
      {Array.from({ length: count }, (_, i) => (
        <p key={i} style={itemStyle}>Scrollable item {i + 1}</p>
      ))}
    </div>
  );
}

// ─── ScrollArea ─────────────────────────────────────────────────
export default function ScrollAreaDemo() {
  return (
    <DemoPage
      title='ScrollArea'
      description={
        <>
          Scrollable region with overlay scrollbar thumbs: sugar one-liner or
          compound Viewport/Scrollbar composition, hover/always/scroll
          visibility modes, keyboard-focusable viewport.
        </>
      }
    >
      <DemoSection title='Sugar — maxHeight one-liner'>
        <p>Plain content is wrapped in a viewport with overlay scrollbars.</p>
        <ScrollArea maxHeight={200} label='Item list'>
          <Items count={30} />
        </ScrollArea>
      </DemoSection>

      <DemoSection title='Compound composition'>
        <p>
          Compose <code>ScrollViewport</code> and <code>Scrollbar</code>{' '}
          explicitly (an explicit scrollbar suppresses the auto-appended
          pair).
        </p>
        <ScrollArea style={{ height: 200 }}>
          <ScrollViewport aria-label='Composable item list'>
            <Items count={30} />
          </ScrollViewport>
          <Scrollbar orientation='vertical' />
        </ScrollArea>
      </DemoSection>

      <DemoSection title='Scrollbar modes — type hover / always / scroll'>
        <p>
          <code>type</code> (default <code>hover</code>) controls when the
          thumbs appear.
        </p>
        <div style={{ display: 'grid', gap: 'var(--haze-space-3)' }}>
          <ScrollArea maxHeight={160} type='hover' label='Hover mode list'>
            <Items count={20} />
          </ScrollArea>
          <ScrollArea maxHeight={160} type='always' label='Always-visible list'>
            <Items count={20} />
          </ScrollArea>
          <ScrollArea maxHeight={160} type='scroll' label='Flash-on-scroll list'>
            <Items count={20} />
          </ScrollArea>
        </div>
      </DemoSection>

      <DemoSection title='Keyboard'>
        <p>
          The viewport becomes focusable while its content overflows — Tab
          into it, then scroll with arrow keys, Space, PageUp/PageDown, Home
          and End (native scrolling, no custom key handling). Give it an
          accessible name via <code>label</code> or{' '}
          <code>aria-label</code>.
        </p>
        <ScrollArea maxHeight={160} label='Keyboard-scrollable list'>
          <Items count={20} />
        </ScrollArea>
      </DemoSection>

      <PropsSection of='ScrollAreaProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Viewport gains <code>tabindex=0</code> and{' '}
            <code>data-scrollable</code> while content overflows — native
            keyboard scrolling for free
          </li>
          <li>
            Thumbs are draggable with pointer capture; tracks page toward
            the press and hand focus to the viewport
          </li>
          <li>
            Forced-colors mode paints visible thumbs with the Highlight
            system color
          </li>
          <li>
            Horizontal thumb geometry mirrors automatically in RTL
            (<code>dir=&quot;rtl&quot;</code>)
          </li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
