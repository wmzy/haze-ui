import { useControl } from 'react-use-control';

import { Button, Drawer } from '@/lib';

import { row } from '../styles';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── Drawer ────────────────────────────────────────────────────
export default function DrawerDemo() {
  const [, , openCtrl] = useControl(undefined, false);
  const [, setOpen] = useControl(openCtrl);

  return (
    <DemoPage
      title='Drawer'
      description='Slide-out panel anchored to a screen edge.'
    >
      <DemoSection title='Demo'>
        <div className={row}>
          <Button onClick={() => setOpen(true)}>Open Drawer</Button>
        </div>
        <Drawer open={openCtrl} onClose={() => setOpen(false)}>
          <div style={{ padding: 'var(--haze-space-4)' }}>
            <h3 style={{ margin: '0 0 var(--haze-space-3)' }}>Drawer Title</h3>
            <p style={{ color: 'var(--haze-color-text-secondary)' }}>
              Drawer content goes here. Click the backdrop or press ESC to close.
            </p>
            <Button onClick={() => setOpen(false)} size='sm' variant='outline'>
              Close
            </Button>
          </div>
        </Drawer>
      </DemoSection>

      <PropsSection of='DrawerProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Uses native <strong>&lt;dialog&gt;</strong> with{' '}
            <strong>showModal()</strong>
          </li>
          <li>
            <strong>ESC</strong> closes the drawer
          </li>
          <li>Focus is trapped within the drawer while open</li>
          <li>Backdrop click closes the drawer</li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='drawer' />
    </DemoPage>
  );
}
