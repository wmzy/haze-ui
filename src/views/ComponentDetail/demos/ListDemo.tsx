import { List, ListItem } from '@/lib';

import PropsTable from '../PropsTable';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
} from './shared';

// ─── List ──────────────────────────────────────────────────────
export default function ListDemo() {
  return (
    <DemoPage
      title='List'
      description='Styled list component with ordered, unordered, and plain variants.'
    >
      <DemoSection title='Unordered'>
        <List variant='unordered'>
          <ListItem>First item</ListItem>
          <ListItem>Second item</ListItem>
          <ListItem>Third item</ListItem>
        </List>
      </DemoSection>

      <DemoSection title='Ordered'>
        <List variant='ordered'>
          <ListItem>Step one</ListItem>
          <ListItem>Step two</ListItem>
          <ListItem>Step three</ListItem>
        </List>
      </DemoSection>

      <DemoSection title='List Props'>
        <PropsTable of='ListProps' />
      </DemoSection>

      <AccessibilitySection>
        <ul>
          <li>
            Uses semantic <strong>&lt;ul&gt;</strong> or{' '}
            <strong>&lt;ol&gt;</strong> elements
          </li>
          <li>Screen readers announce list item count</li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='list' />
    </DemoPage>
  );
}
