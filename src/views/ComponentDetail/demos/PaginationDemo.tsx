import { useState } from 'react';

import { useControl } from 'react-use-control';

import { Pagination } from '@/lib';

import { intro, row } from '../styles';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// Full-feature pager: total summary, size changer, quick jumper and
// clickable ellipses, all reporting through onPageChange.
function ExtrasDemo() {
  const [, , pageCtrl] = useControl(undefined, 1);
  const [, , pageSizeCtrl] = useControl(undefined, 10);
  const [lastChange, setLastChange] = useState('—');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--haze-space-3)' }}>
      <Pagination
        page={pageCtrl}
        pageSize={pageSizeCtrl}
        total={200}
        pageSizeOptions={[10, 20, 50]}
        showSizeChanger
        showQuickJumper
        ellipsisJump
        showTotal={(t, [start, end]) => `${start}-${end} of ${t}`}
        onPageChange={(page, pageSize) => setLastChange(`page ${page} · size ${pageSize}`)}
      />
      <span data-testid='last-change'>onPageChange: {lastChange}</span>
    </div>
  );
}

// Minimal pager: page input + prev/next, with a total summary.
function SimpleDemo() {
  const [, , pageCtrl] = useControl(undefined, 3);

  return (
    <Pagination
      page={pageCtrl}
      total={120}
      simple
      showTotal={(t, [start, end]) => `${start}-${end} of ${t}`}
    />
  );
}

// ─── Pagination ────────────────────────────────────────────────
export default function PaginationDemo() {
  const [, , pageCtrl] = useControl(undefined, 1);

  return (
    <DemoPage
      title='Pagination'
      description='Navigate through paginated content.'
    >
      <DemoSection title='Demo'>
        <Pagination page={pageCtrl} total={100} pageSize={10} />
      </DemoSection>

      <DemoSection title='Sizes'>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--haze-space-3)' }}>
          <Pagination total={50} pageSize={10} size='sm' />
          <Pagination total={50} pageSize={10} size='md' />
          <Pagination total={50} pageSize={10} size='lg' />
        </div>
      </DemoSection>

      <DemoSection title='Extras'>
        <p className={intro}>
          <code>showTotal</code>, <code>showSizeChanger</code>, <code>showQuickJumper</code> and{' '}
          <code>ellipsisJump</code> are all opt-in — the default pager stays a plain button row.
          Changing the page size resets to page 1; every navigation reports through{' '}
          <code>onPageChange(page, pageSize)</code>.
        </p>
        <ExtrasDemo />
      </DemoSection>

      <DemoSection title='Simple'>
        <div className={row}>
          <SimpleDemo />
        </div>
      </DemoSection>

      <PropsSection of='PaginationProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Renders as <strong>&lt;nav&gt;</strong> element
          </li>
          <li>
            Active page has <strong>aria-current=&quot;page&quot;</strong>
          </li>
          <li>
            Previous/Next buttons have <strong>aria-label</strong>
          </li>
          <li>
            Size select, jump inputs and jump ellipses are labelled through the{' '}
            <strong>pagination</strong> locale section
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='pagination' />
    </DemoPage>
  );
}
