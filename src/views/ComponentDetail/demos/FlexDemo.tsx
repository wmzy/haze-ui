import { css } from '@linaria/core';

import { Badge, Flex } from '@/lib';

import { codeBlock } from '../styles';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

const note = css`
  max-width: 75ch;
  color: var(--haze-color-text-secondary);
  font-size: var(--haze-text-sm);
  line-height: var(--haze-leading-normal);

  code {
    font-family: var(--haze-font-mono);
    font-size: var(--haze-text-xs);
  }
`;

// ─── Flex ──────────────────────────────────────────────────────
export default function FlexDemo() {
  return (
    <DemoPage
      title='Flex'
      description='Shorthand layout component for flexbox patterns.'
    >
      <DemoSection title='Demo'>
        <Flex gap='var(--haze-space-3)' align='center'>
          <Badge>Item 1</Badge>
          <Badge color='success'>Item 2</Badge>
          <Badge color='info'>Item 3</Badge>
        </Flex>
      </DemoSection>

      <DemoSection title='Column'>
        <Flex direction='column' gap='var(--haze-space-2)'>
          <Badge>Row A</Badge>
          <Badge color='warning'>Row B</Badge>
        </Flex>
      </DemoSection>

      <DemoSection title='Space / Stack equivalents'>
        <p className={note}>
          haze-ui deliberately ships no separate <code>Space</code>,{' '}
          <code>Stack</code>, or <code>Group</code> component. Flexbox{' '}
          <code>gap</code> already covers every spacing layout those wrappers
          model — so one primitive composes them all:{' '}
          <code>Stack</code> is <code>Flex direction='column'</code> with a{' '}
          <code>gap</code>, <code>Group</code> is a row with a{' '}
          <code>gap</code>, and wrapping rows just add <code>wrap</code>. If
          you are migrating from a kit that exposes a dedicated spacer, map it
          onto the equivalents below.
        </p>

        <h3>Stack — vertical rhythm</h3>
        <Flex direction='column' gap='var(--haze-space-3)'>
          <Badge>First</Badge>
          <Badge color='success'>Second</Badge>
          <Badge color='info'>Third</Badge>
        </Flex>
        <pre className={codeBlock}>{`<Flex direction='column' gap='var(--haze-space-3)'>
  <Badge>First</Badge>
  <Badge>Second</Badge>
  <Badge>Third</Badge>
</Flex>`}</pre>

        <h3>Group — inline row</h3>
        <Flex gap='var(--haze-space-3)' align='center'>
          <Badge>Save</Badge>
          <Badge color='success'>Publish</Badge>
          <Badge color='danger'>Delete</Badge>
        </Flex>
        <pre className={codeBlock}>{`<Flex gap='var(--haze-space-3)' align='center'>
  <Badge>Save</Badge>
  <Badge color='success'>Publish</Badge>
  <Badge color='danger'>Delete</Badge>
</Flex>`}</pre>

        <h3>Wrap — rows that reflow</h3>
        <Flex wrap gap='var(--haze-space-2)'>
          <Badge>Tag 1</Badge>
          <Badge>Tag 2</Badge>
          <Badge>Tag 3</Badge>
          <Badge color='success'>Tag 4</Badge>
          <Badge color='success'>Tag 5</Badge>
          <Badge color='success'>Tag 6</Badge>
          <Badge color='warning'>Tag 7</Badge>
          <Badge color='warning'>Tag 8</Badge>
          <Badge color='warning'>Tag 9</Badge>
          <Badge color='danger'>Tag 10</Badge>
          <Badge color='danger'>Tag 11</Badge>
          <Badge color='danger'>Tag 12</Badge>
        </Flex>
        <pre className={codeBlock}>{`<Flex wrap gap='var(--haze-space-2)'>
  <Badge>Tag 1</Badge>
  <Badge>Tag 2</Badge>
  <Badge>Tag 3</Badge>
  {/* …more items reflow onto new rows as width allows */}
</Flex>`}</pre>
      </DemoSection>

      <PropsSection of='FlexProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Renders as a plain <strong>&lt;div&gt;</strong> — purely
            presentational
          </li>
          <li>
            No semantic meaning; add <strong>role</strong> if needed
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='flex' />
    </DemoPage>
  );
}
