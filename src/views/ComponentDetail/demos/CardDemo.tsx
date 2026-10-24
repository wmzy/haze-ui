import { Card } from '@/lib';

import PropsTable from '../PropsTable';

import A11yNote from '../A11yNote';

import { intro, section, row } from '../styles';

import { CssVarsSection } from './shared';

// ─── Card ──────────────────────────────────────────────────────
export default function CardDemo() {
  return (
    <>
      <h1>Card</h1>
      <p className={intro}>
        Container for grouping related content with visual separation.
      </p>

      <div className={section}>
        <h2>Variants</h2>
        <div className={row} style={{ alignItems: 'stretch' }}>
          <Card variant='elevated'>
            <h3 style={{ margin: '0 0 4px' }}>Elevated</h3>
            <p
              style={{
                margin: 0,
                color: 'var(--haze-color-text-secondary)',
                fontSize: 'var(--haze-text-sm)',
              }}
            >
              Shadow-based elevation.
            </p>
          </Card>
          <Card variant='outlined'>
            <h3 style={{ margin: '0 0 4px' }}>Outlined</h3>
            <p
              style={{
                margin: 0,
                color: 'var(--haze-color-text-secondary)',
                fontSize: 'var(--haze-text-sm)',
              }}
            >
              Border-based separation.
            </p>
          </Card>
          <Card variant='filled'>
            <h3 style={{ margin: '0 0 4px' }}>Filled</h3>
            <p
              style={{
                margin: 0,
                color: 'var(--haze-color-text-secondary)',
                fontSize: 'var(--haze-text-sm)',
              }}
            >
              Background-based distinction.
            </p>
          </Card>
        </div>
      </div>

      <div className={section}>
        <h2>Whole-card link (as)</h2>
        <p
          style={{
            fontSize: 'var(--haze-text-sm)',
            color: 'var(--haze-color-text-secondary)',
            margin: '0 0 var(--haze-space-3)',
          }}
        >
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
            <h3 style={{ margin: '0 0 4px' }}>Linked card</h3>
            <p
              style={{
                margin: 0,
                color: 'var(--haze-color-text-secondary)',
                fontSize: 'var(--haze-text-sm)',
              }}
            >
              The whole card is one link target — no buttons inside.
            </p>
          </Card>
          <Card as='a' href='#card' variant='outlined' target='_blank' rel='noopener'>
            <h3 style={{ margin: '0 0 4px' }}>New tab</h3>
            <p
              style={{
                margin: 0,
                color: 'var(--haze-color-text-secondary)',
                fontSize: 'var(--haze-text-sm)',
              }}
            >
              Anchor attrs (target/rel) pass straight through.
            </p>
          </Card>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of='CardProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
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
        </A11yNote>
      </div>

      <CssVarsSection component='card' />
    </>
  );
}
