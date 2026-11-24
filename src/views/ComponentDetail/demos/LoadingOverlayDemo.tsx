import { useState } from 'react';

import { Button, LoadingOverlay } from '@/lib';

import { DemoPage, DemoSection, PropsSection } from './shared';

// ─── LoadingOverlay ───────────────────────────────────────────
export default function LoadingOverlayDemo() {
  const [syncing, setSyncing] = useState(false);
  return (
    <DemoPage
      title='LoadingOverlay'
      description={
        <>
          Container-level loading state: dims the wrapped content and
          centers a spinner (or a custom loader) above it while the block
          goes inert — aria-busy mirrors the phase. Pair with a `visible`
          prop like a status guard.
        </>
      }
    >
      <DemoSection title='Demo'>
        <LoadingOverlay visible={syncing} label='Syncing…'>
          <p>
            卡片内容在加载期间变暗并居中显示 spinner。下面的按钮控制
            busy 状态。
          </p>
          <p>Content keeps layout; covers on visible.</p>
        </LoadingOverlay>
        <p>
          <Button onClick={() => setSyncing((s) => !s)}>
            {syncing ? 'Stop' : 'Start'} syncing
          </Button>
        </p>
      </DemoSection>

      <PropsSection of='LoadingOverlayProps' />
    </DemoPage>
  );
}
