import { useState } from 'react';

import { Transfer } from '@/lib';

import {
  AccessibilitySection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── Transfer ───────────────────────────────────────────────────
export default function TransferDemo() {
  const [targetKeys, setTargetKeys] = useState<string[]>(['b']);

  return (
    <DemoPage
      title='Transfer'
      description='Transfer list for moving items between source and target.'
    >
      <DemoSection title='Demo'>
        <Transfer
          dataSource={[
            { key: 'a', title: 'Item A' },
            { key: 'b', title: 'Item B' },
            { key: 'c', title: 'Item C' },
            { key: 'd', title: 'Item D' },
          ]}
          targetKeys={targetKeys}
          onChange={(keys) => setTargetKeys(keys)}
        />
      </DemoSection>

      <PropsSection of='TransferProps' />

      <AccessibilitySection>
        <ul>
          <li>Items use <strong>&lt;label&gt;</strong> with checkboxes</li>
          <li>Action buttons have <strong>aria-label</strong></li>
          <li>Disabled items cannot be selected</li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
