import { Plan, PlanItem } from '@/lib';

import PropsTable from '../PropsTable';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  maxWidth360,
} from './shared';

// ─── Plan ──────────────────────────────────────────────────────
export default function PlanDemo() {
  return (
    <DemoPage
      title='Plan'
      description={
        <>
          Agent plan and progress display: a titled checklist whose per-step
          statuses (pending, active, done, error, skipped) feed an auto progress
          summary and progress bar.
        </>
      }
    >
      <DemoSection title='Demo'>
        <div style={maxWidth360}>
          <Plan title='Deploying feature'>
            <PlanItem label='Fetch context' description='Repository indexed' status='done' />
            <PlanItem label='Write tests' description='3 files touched' status='done' />
            <PlanItem label='Run suite' description='Executing…' status='active' />
            <PlanItem label='Open pull request' status='pending' />
          </Plan>
        </div>
      </DemoSection>

      <DemoSection title='Error and Skipped States'>
        <div style={maxWidth360}>
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
      </DemoSection>

      <DemoSection title='Plan Props'>
        <PropsTable of='PlanProps' />
      </DemoSection>

      <DemoSection title='PlanItem Props'>
        <PropsTable of='PlanItemProps' />
      </DemoSection>

      <AccessibilitySection>
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
      </AccessibilitySection>

      <CssVarsSection component='plan' />
    </DemoPage>
  );
}
