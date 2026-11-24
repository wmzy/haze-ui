import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { Breadcrumb, BreadcrumbItem } from '@/lib';

import PropsTable from '../PropsTable';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
} from './shared';

// Router-shaped `as`: BreadcrumbItem accepts any component that
// forwards props to a DOM element — here a minimal Link stand-in whose
// navigation prop is `to` rather than `href`. The item wears the link
// skin, and the trail semantics (nav/ol, aria-current on the last
// <li>) are unchanged.
function RouterLink({
  to,
  children,
  ...rest
}: { to: string; children: ReactNode } & ComponentPropsWithoutRef<'a'>) {
  return (
    <a href={to} {...rest}>
      {children}
    </a>
  );
}

// ─── Breadcrumb ────────────────────────────────────────────────
export default function BreadcrumbDemo() {
  return (
    <DemoPage
      title='Breadcrumb'
      description='Navigation trail showing the current page location.'
    >
      <DemoSection title='Demo'>
        <Breadcrumb>
          <BreadcrumbItem href='#'>Home</BreadcrumbItem>
          <BreadcrumbItem href='#'>Components</BreadcrumbItem>
          <BreadcrumbItem>Breadcrumb</BreadcrumbItem>
        </Breadcrumb>
      </DemoSection>

      <DemoSection title='Custom Separator'>
        <Breadcrumb separator='›'>
          <BreadcrumbItem href='#'>Docs</BreadcrumbItem>
          <BreadcrumbItem href='#'>UI</BreadcrumbItem>
          <BreadcrumbItem>Current</BreadcrumbItem>
        </Breadcrumb>
      </DemoSection>

      <DemoSection title='Router Links (as)'>
        <Breadcrumb>
          <BreadcrumbItem as={RouterLink} to='/'>
            Home
          </BreadcrumbItem>
          <BreadcrumbItem as={RouterLink} to='/components'>
            Components
          </BreadcrumbItem>
          <BreadcrumbItem>Breadcrumb</BreadcrumbItem>
        </Breadcrumb>
      </DemoSection>

      <DemoSection title='Breadcrumb Props'>
        <PropsTable of='BreadcrumbProps' />
      </DemoSection>

      <DemoSection title='BreadcrumbItem Props'>
        <PropsTable of='BreadcrumbItemProps' />
      </DemoSection>

      <AccessibilitySection>
        <ul>
          <li>
            Uses{' '}
            <strong>&lt;nav aria-label=&quot;Breadcrumb&quot;&gt;</strong>{' '}
            with <strong>&lt;ol&gt;</strong>
          </li>
          <li>
            Last item has <strong>aria-current=&quot;page&quot;</strong>
          </li>
          <li>
            Separators have <strong>aria-hidden=&quot;true&quot;</strong>
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='breadcrumb' />
    </DemoPage>
  );
}
