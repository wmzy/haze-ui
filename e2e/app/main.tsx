/**
 * Minimal harness page for Playwright smoke tests: mounts exactly the four
 * floating components under test, with the library's token classes applied
 * (lightTheme colors + spacing/typography scales). The full demo site is
 * intentionally not part of E2E.
 */
import { css } from '@linaria/core';
import { useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { useControl } from 'react-use-control';
import { Form, createForm } from 'react-f0rm';

import { Dialog } from '../../src/lib/components/Dialog';
import { Datepicker } from '../../src/lib/components/Datepicker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../src/lib/components/DropdownMenu';
import { InputCore } from '../../src/lib/components/Input';
import { Popover } from '../../src/lib/components/Popover';
import { ToastContainer, useToast } from '../../src/lib/components/Toast';
import { FormItem } from '../../src/lib/form';
import { lightTheme } from '../../src/lib/tokens/colors';
import { spacing } from '../../src/lib/tokens/spacing';
import { typography } from '../../src/lib/tokens/typography';

const shell = css`
  min-height: 100vh;
  box-sizing: border-box;
  margin: 0;
  padding: 32px 48px 480px;
  background: #ffffff;
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  /* Panels are top-layer overlays; generous gaps keep one component's
     open panel from covering the next section's trigger. */
  gap: 280px;
`;

const heading = css`
  margin: 0 0 16px;
  font-size: var(--haze-text-lg);
  font-weight: var(--haze-weight-semibold);
`;

/* Bare harness buttons get axe's 24px target-size minimum (WCAG 2.5.8). */
const demoBtn = css`
  padding: 6px 16px;
`;

function App() {
  const [, setDialogOpen, dialogControl] = useControl(undefined, false);
  // Fixed initial date keeps the calendar panel deterministic (always
  // September 2026) regardless of when the suite runs.
  const [date, , dateControl] = useControl(undefined, '2026-09-01');

  return (
    <div className={`${shell} ${lightTheme} ${spacing} ${typography}`}>
      <section id="popover-demo">
        <h2 className={heading}>Popover</h2>
        <Popover content="Popover body">Open popover</Popover>
      </section>

      <section id="menu-demo">
        <h2 className={heading}>DropdownMenu</h2>
        <DropdownMenu>
          <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Apple</DropdownMenuItem>
            <DropdownMenuItem>Banana</DropdownMenuItem>
            <DropdownMenuItem>Cherry</DropdownMenuItem>
            <DropdownMenuItem>Durian</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Elderberry</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>

      <section id="dialog-demo">
        <h2 className={heading}>Dialog</h2>
        <button
          type="button"
          id="dialog-opener"
          onClick={() => setDialogOpen(true)}
        >
          Open dialog
        </button>
        <Dialog
          open={dialogControl}
          onClose={() => setDialogOpen(false)}
          title="Confirm action"
        >
          <p>Dialog body</p>
          <button type="button" onClick={() => setDialogOpen(false)}>
            Close
          </button>
        </Dialog>
      </section>

      <section id="datepicker-demo">
        <h2 className={heading}>Datepicker</h2>
        <Datepicker value={dateControl} />
        <p id="datepicker-value">{date}</p>
      </section>

      <section id="toast-demo">
        <h2 className={heading}>Toast</h2>
        <ToastContainer>
          <ToastDemoSection />
        </ToastContainer>
      </section>

      <section id="form-demo">
        <h2 className={heading}>FormItem</h2>
        <FormDemoSection />
      </section>
    </div>
  );
}

function ToastDemoSection() {
  const notify = useToast();
  return (
    <button
      type="button"
      id="toast-opener"
      className={demoBtn}
      onClick={() =>
        notify('Saved successfully', {variant: 'success', duration: 0})
      }
    >
      Show toast
    </button>
  );
}

function FormDemoSection() {
  const form = useMemo(() => createForm({initialValues: {email: ''}}), []);
  return (
    <Form form={form} onSubmit={() => undefined}>
      <FormItem
        form={form}
        name="email"
        label="Email"
        input={InputCore}
        placeholder="you@x.dev"
        validate={(v: string) => (v.includes('@') ? undefined : 'must be an email')}
      />
      <button type="submit" className={demoBtn}>Submit</button>
    </Form>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
