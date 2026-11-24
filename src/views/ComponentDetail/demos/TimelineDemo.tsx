import { Timeline, TimelineItem } from '@/lib';

import PropsTable from '../PropsTable';

import { AccessibilitySection, DemoPage, DemoSection } from './shared';

// ─── Timeline ───────────────────────────────────────────────────
export default function TimelineDemo() {
  return (
    <DemoPage
      title='Timeline'
      description='Vertical timeline for displaying events in chronological order.'
    >
      <DemoSection title='Demo'>
        <Timeline>
          <TimelineItem title='Order placed' description='Your order has been placed successfully.' time='2 minutes ago' color='primary' />
          <TimelineItem title='Payment confirmed' description='Payment processed.' time='1 minute ago' color='success' />
          <TimelineItem title='Shipped' description='Package is on its way.' color='warning' />
          <TimelineItem title='Delivered' />
        </Timeline>
      </DemoSection>

      <DemoSection title='TimelineItem Props'>
        <PropsTable of='TimelineItemProps' />
      </DemoSection>

      <AccessibilitySection>
        <ul>
          <li>Container uses <strong>role=&quot;list&quot;</strong></li>
          <li>Each item uses <strong>role=&quot;listitem&quot;</strong></li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
