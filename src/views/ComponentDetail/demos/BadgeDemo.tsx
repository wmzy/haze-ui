import { css } from '@linaria/core';

import { Badge } from '@/lib';
import { badgeVariants, badgeSizes } from '@/lib/components/Badge';

import { row } from '../styles';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  noteStyle,
  PropsSection,
} from './shared';

// Composition demo: wear the exported skin pieces on a custom element.
const brandedCompose = css`
  border: 1px solid var(--haze-color-primary);
`;

// ─── Badge ─────────────────────────────────────────────────────
export default function BadgeDemo() {
  return (
    <DemoPage
      title='Badge'
      description='Small status indicators for labeling and categorization.'
    >
      <DemoSection title='Colors'>
        <div className={row}>
          <Badge color='default'>Default</Badge>
          <Badge color='primary'>Primary</Badge>
          <Badge color='success'>Success</Badge>
          <Badge color='warning'>Warning</Badge>
          <Badge color='danger'>Danger</Badge>
          <Badge color='info'>Info</Badge>
        </div>
      </DemoSection>

      <DemoSection title='Sizes'>
        <div className={row}>
          <Badge size='sm'>Small</Badge>
          <Badge size='md'>Medium</Badge>
        </div>
      </DemoSection>

      <DemoSection title='Composing with badgeVariants / badgeSizes'>
        <p style={noteStyle}>
          The exported <code>badgeVariants</code> /{' '}
          <code>badgeSizes</code> maps carry the exact skin classes{' '}
          <code>Badge</code> wears — spread them onto any custom element
          (same shape and rationale as Button&apos;s{' '}
          <code>buttonVariants</code>). This span composes the{' '}
          <code>info</code> color with the <code>sm</code> size and one
          custom class on top.
        </p>
        <div className={row}>
          <span
            className={`${badgeVariants.info} ${badgeSizes.sm} ${brandedCompose}`}
          >
            Composed span
          </span>
        </div>
      </DemoSection>

      <PropsSection of='BadgeProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Renders as a <strong>&lt;span&gt;</strong> — purely decorative
          </li>
          <li>
            Add <strong>aria-label</strong> if the badge conveys meaning not
            present in surrounding text
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='badge' />
    </DemoPage>
  );
}
