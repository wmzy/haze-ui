import { useState } from 'react';

import { Button, LoadingOverlay } from '@/lib';

import PropsTable from '../PropsTable';

import { intro, section } from '../styles';

// ─── LoadingOverlay ───────────────────────────────────────────
export default function LoadingOverlayDemo() {
  const [syncing, setSyncing] = useState(false);
  return (
    <>
      <h1>LoadingOverlay</h1>
      <p className={intro}>
        Container-level loading state: dims the wrapped content and
        centers a spinner (or a custom loader) above it while the block
        goes inert — aria-busy mirrors the phase. Pair with a `visible`
        prop like a status guard.
      </p>

      <div className={section}>
        <h2>Demo</h2>
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
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of='LoadingOverlayProps' />
      </div>
    </>
  );
}
