import { useControl } from 'react-use-control';

import { Button, ConfirmDialog } from '@/lib';

import { row } from '../styles';

import {
  AccessibilitySection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── ConfirmDialog ──────────────────────────────────────────────
export default function ConfirmDialogDemo() {
  const [, , openCtrl] = useControl(undefined, false);
  const [, setOpen] = useControl(openCtrl);

  return (
    <DemoPage
      title='ConfirmDialog'
      description='Confirmation dialog with confirm/cancel actions.'
    >
      <DemoSection title='Demo'>
        <div className={row}>
          <Button onClick={() => setOpen(true)}>Open Confirm Dialog</Button>
        </div>
        <ConfirmDialog
          open={openCtrl}
          title='Delete Item'
          onConfirm={() => setOpen(false)}
          onCancel={() => setOpen(false)}
          variant='danger'
        >
          Are you sure you want to delete this item? This action cannot be undone.
        </ConfirmDialog>
      </DemoSection>

      <PropsSection of='ConfirmDialogProps' />

      <AccessibilitySection>
        <ul>
          <li>Overlay click closes the dialog</li>
          <li>Confirm and cancel buttons are keyboard accessible</li>
          <li>Danger variant uses red confirm button</li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
