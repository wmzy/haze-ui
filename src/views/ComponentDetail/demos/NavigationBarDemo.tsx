import { Button, NavigationBar, NavLink } from '@/lib';

import PropsTable from '../PropsTable';

import { AccessibilitySection, DemoPage, DemoSection } from './shared';

// ─── NavigationBar ──────────────────────────────────────────────
export default function NavigationBarDemo() {
  return (
    <DemoPage
      title='NavigationBar'
      description='Top navigation bar with brand, links, and end slot.'
    >
      <DemoSection title='Demo'>
        <NavigationBar
          brand={<span>MyApp</span>}
          end={<Button size='sm' variant='outline'>Login</Button>}
        >
          <NavLink active>Home</NavLink>
          <NavLink>Docs</NavLink>
          <NavLink>About</NavLink>
        </NavigationBar>
      </DemoSection>

      <DemoSection title='NavigationBar Props'>
        <PropsTable of='NavigationBarProps' />
      </DemoSection>

      <DemoSection title='NavLink Props'>
        <PropsTable of='NavLinkProps' />
      </DemoSection>

      <AccessibilitySection>
        <ul>
          <li>Renders as <strong>&lt;nav&gt;</strong></li>
          <li>Active link has <strong>aria-current=&quot;page&quot;</strong></li>
          <li>Links are standard <strong>&lt;a&gt;</strong> elements</li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
