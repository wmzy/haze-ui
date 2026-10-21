import { Plan, PlanItem } from '@/lib';

import PropsTable from '../PropsTable';

import A11yNote from '../A11yNote';

import { intro, section } from '../styles';

import { CssVarsSection } from './shared';

// ─── Plan ──────────────────────────────────────────────────────
export default function PlanDemo() {
  return (
    <>
      <h1>Plan</h1>
      <p className={intro}>
        Agent plan and progress display: a titled checklist whose per-step
        statuses (pending, active, done, error, skipped) feed an auto progress
        summary and progress bar.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div style={{ maxWidth: 360 }}>
          <Plan title='Deploying feature'>
            <PlanItem label='Fetch context' description='Repository indexed' status='done' />
            <PlanItem label='Write tests' description='3 files touched' status='done' />
            <PlanItem label='Run suite' description='Executing…' status='active' />
            <PlanItem label='Open pull request' status='pending' />
          </Plan>
        </div>
      </div>

      <div className={section}>
        <h2>Error and Skipped States</h2>
        <div style={{ maxWidth: 360 }}>
          <Plan
            title='Refactor plan'
            summary={(done, total) => `${done} of ${total} steps complete`}
          >
            <PlanItem label='Audit imports' status='done' />
            <PlanItem label='Migrate configs' description='Schema mismatch on legacy keys' status='error' />
            <PlanItem label='Update snapshots' status='skipped' />
            <PlanItem label='Release notes' status='pending' />
          </Plan>
        </div>
      </div>

      <div className={section}>
        <h2>Plan Props</h2>
        <PropsTable of='PlanProps' />
      </div>

      <div className={section}>
        <h2>PlanItem Props</h2>
        <PropsTable of='PlanItemProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Native <strong>list</strong>/<strong>listitem</strong> semantics
              from the underlying <code>ul</code>/<code>li</code> elements
            </li>
            <li>
              Progress is exposed as a <code>progressbar</code> with
              <code> aria-valuenow</code>/<code>aria-valuemax</code>, named by
              the plan title when rendered
            </li>
            <li>
              Status indicator glyphs are decorative
              (<code>aria-hidden</code>) — word statuses through{' '}
              <code>label</code>/<code>description</code> content
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='plan' />
    </>
  );
}
