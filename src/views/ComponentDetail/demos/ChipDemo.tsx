import { Chip } from '@/lib';

import { row } from '../styles';

import {
  AccessibilitySection,
  DemoPage,
  DemoSection,
  noop,
  PropsSection,
} from './shared';

// ─── Chip ───────────────────────────────────────────────────────
export default function ChipDemo() {
  return (
    <DemoPage
      title='Chip'
      description='Compact element for tags, labels, and filters.'
    >
      <DemoSection title='Solid Variants'>
        <div className={row}>
          <Chip>Default</Chip>
          <Chip color='primary'>Primary</Chip>
          <Chip color='success'>Success</Chip>
          <Chip color='warning'>Warning</Chip>
          <Chip color='danger'>Danger</Chip>
          <Chip color='info'>Info</Chip>
        </div>
      </DemoSection>

      <DemoSection title='Outline Variants'>
        <div className={row}>
          <Chip variant='outline'>Default</Chip>
          <Chip variant='outline' color='primary'>Primary</Chip>
          <Chip variant='outline' color='success'>Success</Chip>
          <Chip variant='outline' color='danger'>Danger</Chip>
          <Chip variant='outline' color='info'>Info</Chip>
        </div>
      </DemoSection>

      <DemoSection title='With Close'>
        <div className={row}>
          <Chip onClose={noop}>Removable</Chip>
          <Chip color='primary' onClose={noop}>Primary</Chip>
        </div>
      </DemoSection>

      <PropsSection of='ChipProps' />

      <AccessibilitySection>
        <ul>
          <li>Renders as a <strong>&lt;span&gt;</strong></li>
          <li>Close button has <strong>aria-label=&quot;Remove&quot;</strong></li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
