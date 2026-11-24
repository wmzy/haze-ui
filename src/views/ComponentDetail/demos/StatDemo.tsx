import { Stat, StatGroup } from '@/lib';

import PropsTable from '../PropsTable';

import { AccessibilitySection, DemoPage, DemoSection } from './shared';

// ─── Stat ───────────────────────────────────────────────────────
export default function StatDemo() {
  return (
    <DemoPage
      title='Stat'
      description='Statistics display with trend indicators.'
    >
      <DemoSection title='Demo'>
        <StatGroup>
          <Stat title='Total Users' value='12,345' trend='up' trendValue='12%' description='vs last month' />
          <Stat title='Revenue' value='$45,678' trend='down' trendValue='3%' description='vs last month' />
          <Stat title='Active Now' value='89%' trend='neutral' trendValue='0%' />
        </StatGroup>
      </DemoSection>

      <DemoSection title='Stat Props'>
        <PropsTable of='StatProps' />
      </DemoSection>

      <DemoSection title='StatGroup Props'>
        <PropsTable of='StatGroupProps' />
      </DemoSection>

      <AccessibilitySection>
        <ul>
          <li>Purely presentational components</li>
          <li>Trend uses color and arrow symbols for visual indication</li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
