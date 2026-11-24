import { Button, Empty } from '@/lib';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── Empty ─────────────────────────────────────────────────────
export default function EmptyDemo() {
  return (
    <DemoPage
      title='Empty'
      description='Placeholder state when no data is available.'
    >
      <DemoSection title='Default'>
        <Empty />
      </DemoSection>

      <DemoSection title='Custom Description'>
        <Empty description='No search results found' />
      </DemoSection>

      <DemoSection title='With Action'>
        <Empty description='No items yet'>
          <Button size='sm'>Create Item</Button>
        </Empty>
      </DemoSection>

      <PropsSection of='EmptyProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Purely presentational — wrap with a container that has{' '}
            <strong>aria-label</strong> if needed
          </li>
          <li>
            Default image is decorative SVG
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='empty' />
    </DemoPage>
  );
}
