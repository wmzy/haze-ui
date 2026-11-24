import { useState } from 'react';

import { useControl } from 'react-use-control';

import { Button, Popconfirm } from '@/lib';

import { row } from '../styles';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  noteStyle,
  PropsSection,
} from './shared';

function QuestionGlyph() {
  return (
    <svg viewBox='0 0 24 24' width='16' height='16' aria-hidden='true'>
      <circle cx='12' cy='12' r='9' fill='none' stroke='currentColor' strokeWidth='2' />
      <path
        d='M9.4 9.2a2.7 2.7 0 0 1 5.3.7c0 1.8-2.7 2.2-2.7 3.6'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
      />
      <circle cx='12' cy='17' r='1.2' fill='currentColor' />
    </svg>
  );
}

function AsyncDemo() {
  const [status, setStatus] = useState('idle');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--haze-space-3)' }}>
      <Popconfirm
        title='Archive this project?'
        description='Archived projects stay recoverable for 30 days.'
        okText='Archive'
        okVariant='danger'
        onConfirm={() =>
          new Promise<void>((resolve) => {
            setStatus('archiving…');
            setTimeout(resolve, 1200);
          }).then(() => setStatus('archived'))
        }
      >
        <Button variant='outline'>Archive project</Button>
      </Popconfirm>
      <span
        style={{
          fontSize: 'var(--haze-text-sm)',
          color: 'var(--haze-color-text-muted)',
        }}
      >
        {status}
      </span>
    </div>
  );
}

function ControlledDemo() {
  const [, setOpen, openCtrl] = useControl(undefined, false);
  return (
    <>
      <Button variant='outline' onClick={() => setOpen(true)}>
        Open from outside
      </Button>
      <Popconfirm title='Opened through a control' open={openCtrl}>
        <Button variant='ghost'>Trigger</Button>
      </Popconfirm>
    </>
  );
}

// ─── Popconfirm ────────────────────────────────────────────────
export default function PopconfirmDemo() {
  return (
    <DemoPage
      title='Popconfirm'
      description={
        <>
          Anchored confirmation bubble — a small question panel floating
          beside its trigger, with confirm/cancel actions.
        </>
      }
    >
      <DemoSection title='Demo'>
        <div className={row}>
          <Popconfirm
            title='Delete this item?'
            description='This action cannot be undone.'
          >
            <Button variant='outline'>Delete</Button>
          </Popconfirm>
        </div>
      </DemoSection>

      <DemoSection title='Danger, icon and custom labels'>
        <div className={row}>
          <Popconfirm
            title='Remove team member?'
            description='They lose access to all shared boards immediately.'
            okText='Remove'
            cancelText='Keep'
            okVariant='danger'
            icon={<QuestionGlyph />}
          >
            <Button variant='outline'>Remove member</Button>
          </Popconfirm>
        </div>
      </DemoSection>

      <DemoSection title='Async confirmation'>
        <p style={noteStyle}>
          A handler returning a promise puts the pressed button into its
          busy phase; the panel closes when the promise resolves and
          stays open for a retry when it rejects.
        </p>
        <div className={row}>
          <AsyncDemo />
        </div>
      </DemoSection>

      <DemoSection title='Controlled'>
        <p style={noteStyle}>
          <code>open</code> accepts a control — external state drives the
          panel while the trigger still writes through it.
        </p>
        <div className={row}>
          <ControlledDemo />
        </div>
      </DemoSection>

      <PropsSection of='PopconfirmProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Trigger carries <strong>aria-haspopup</strong>,{' '}
            <strong>aria-expanded</strong> and{' '}
            <strong>aria-controls</strong>
          </li>
          <li>
            Panel is a non-modal <strong>dialog</strong> named by the
            title, with the description wired through{' '}
            <strong>aria-describedby</strong>
          </li>
          <li>
            Enter confirms and Escape cancels; focus moves into the
            panel on open and returns to the trigger on close
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='popconfirm' />
    </DemoPage>
  );
}
