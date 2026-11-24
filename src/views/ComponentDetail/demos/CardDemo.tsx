import type { CSSProperties } from 'react';

import { Card } from '@/lib';

import { row } from '../styles';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  flushNoteStyle,
  noteStyle,
  PropsSection,
} from './shared';

/** Card heading: a tight bottom margin so the description sits close. */
const cardTitleStyle: CSSProperties = { margin: '0 0 4px' };

// ─── Card ──────────────────────────────────────────────────────
export default function CardDemo() {
  return (
    <DemoPage
      title='Card'
      description='Container for grouping related content with visual separation.'
    >
      <DemoSection title='Variants'>
        <div className={row} style={{ alignItems: 'stretch' }}>
          <Card variant='elevated'>
            <h3 style={cardTitleStyle}>Elevated</h3>
            <p style={flushNoteStyle}>
              Shadow-based elevation.
            </p>
          </Card>
          <Card variant='outlined'>
            <h3 style={cardTitleStyle}>Outlined</h3>
            <p style={flushNoteStyle}>
              Border-based separation.
            </p>
          </Card>
          <Card variant='filled'>
            <h3 style={cardTitleStyle}>Filled</h3>
            <p style={flushNoteStyle}>
              Background-based distinction.
            </p>
          </Card>
        </div>
      </DemoSection>

      <DemoSection title='Whole-card link (as)'>
        <p style={noteStyle}>
          <code>as=&#123;'a'&#125;</code> renders the entire card as a native{' '}
          <code>&lt;a&gt;</code>: <code>href</code>, <code>target</code>,{' '}
          <code>rel</code> and every other anchor attribute flow through,
          while the anchor shape resets the UA underline/link-blue so the
          card looks identical to the <code>div</code> form. Any component
          forwarding props to a DOM element (e.g. a router{' '}
          <code>Link</code>) works the same way.
        </p>
        {/* Whole-card links must not contain nested interactive elements:
         * anchors/buttons don't nest (invalid HTML, SR/keyboard trap).
         * Keep secondary actions outside the linked card, or use a
         * stretched-link overlay on a non-interactive card body. */}
        <div className={row} style={{ alignItems: 'stretch' }}>
          <Card as='a' href='#card'>
            <h3 style={cardTitleStyle}>Linked card</h3>
            <p style={flushNoteStyle}>
              The whole card is one link target — no buttons inside.
            </p>
          </Card>
          <Card as='a' href='#card' variant='outlined' target='_blank' rel='noopener'>
            <h3 style={cardTitleStyle}>New tab</h3>
            <p style={flushNoteStyle}>
              Anchor attrs (target/rel) pass straight through.
            </p>
          </Card>
        </div>
      </DemoSection>

      <PropsSection of='CardProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Renders as a <strong>&lt;div&gt;</strong> — add{' '}
            <strong>role</strong> and <strong>aria-label</strong> if the
            card represents a distinct landmark
          </li>
          <li>
            <code>as=&#123;'a'&#125;</code> gives the card real link
            semantics (focusable, announced as a link) — never nest
            buttons or links inside it
          </li>
          <li>Purely presentational by default</li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='card' />
    </DemoPage>
  );
}
