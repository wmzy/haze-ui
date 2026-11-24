import { useControl } from 'react-use-control';

import { Button, Tour } from '@/lib';

import { row } from '../styles';

import {
  AccessibilitySection,
  DemoPage,
  DemoSection,
  flushNoteStyle,
  PropsSection,
} from './shared';

// ─── Tour ──────────────────────────────────────────────────────
export default function TourDemo() {
  const [, setOpen, openCtrl] = useControl(false);

  return (
    <DemoPage
      title='Tour'
      description={
        <>
          Spotlight walkthrough that dims the page and guides users across
          regions, one step at a time.
        </>
      }
    >
      <DemoSection title='Demo'>
        <div className={row}>
          <Button id='tour-demo-import' variant='outline'>
            Import data
          </Button>
          <Button id='tour-demo-start' onClick={() => setOpen(true)}>
            Start tour
          </Button>
        </div>
        <div
          className={row}
          id='tour-demo-card'
          style={{
            display: 'grid',
            gap: 'var(--haze-space-2)',
            padding: 'var(--haze-space-4)',
            border: '1px solid var(--haze-color-border)',
            borderRadius: 'var(--haze-radius-lg)',
            maxWidth: 360,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 'var(--haze-text-lg)' }}>
            Project summary
          </h3>
          <p style={flushNoteStyle}>
            Everything about the current milestone at a glance — progress,
            owners and recent activity.
          </p>
        </div>
        <div className={row}>
          <Button id='tour-demo-export' variant='outline'>
            Export report
          </Button>
        </div>

        <Tour
          steps={[
            {
              target: '#tour-demo-import',
              title: 'Import data',
              content:
                'Bring existing data into the workspace. CSV, JSON or a direct connection.',
              placement: 'bottom',
            },
            {
              target: '#tour-demo-card',
              title: 'Project summary',
              content:
                'Track the current milestone here. The card stays put while the tour moves on.',
              placement: 'top',
            },
            {
              target: '#tour-demo-export',
              content:
                'Finish up by exporting a shareable report. Use ←/→ to step, Esc to skip.',
              placement: 'bottom-end',
            },
          ]}
          open={openCtrl}
          onClose={() => setOpen(false)}
        />
      </DemoSection>

      <PropsSection of='TourProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Step card is a named <strong>role=&quot;dialog&quot;</strong>{' '}
            (titled by the step title, or the step counter) and takes focus
            on each step
          </li>
          <li>
            <strong>Esc</strong> skips, <strong>ArrowRight</strong>/
            <strong>ArrowLeft</strong> step through (ignored while typing in
            fields)
          </li>
          <li>Mask and spotlight are <strong>aria-hidden</strong> decoration</li>
          <li>
            A missing or hidden target degrades to a screen-centered card
            instead of failing
          </li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
