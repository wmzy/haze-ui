/**
 * VoiceOver harness for the real screen reader smoke spec
 * (e2e/screen-reader.spec.ts): the three announcement contracts that
 * static axe scans cannot see —
 *   - Dialog: opening the modal moves focus inside and VoiceOver must
 *     announce the dialog's accessible name (aria-labelledby → title);
 *   - DropdownMenu: ArrowDown hands focus to the first item and the
 *     focused menuitem must be announced;
 *   - Toast: a success toast (role="status", polite live region) must be
 *     announced.
 *
 * The toast uses duration 0 so it never auto-dismisses mid-announcement,
 * and each test navigates fresh (page.goto in beforeEach) so the three
 * scenarios never share component state.
 */
import { useControl } from 'react-use-control';

import { Dialog } from '../../../src/lib/components/Dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../src/lib/components/DropdownMenu';
import { ToastContainer, useToast } from '../../../src/lib/components/Toast';

import { mountPage } from './mount';

function App() {
  const [, setDialogOpen, dialogControl] = useControl(undefined, false);

  return (
    <>
      <section data-testid="case-dialog">
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

      <section data-testid="case-menu">
        <DropdownMenu>
          <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Apple</DropdownMenuItem>
            <DropdownMenuItem>Banana</DropdownMenuItem>
            <DropdownMenuItem>Cherry</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </section>

      <section data-testid="case-toast">
        <ToastContainer>
          <ToastTrigger />
        </ToastContainer>
      </section>
    </>
  );
}

function ToastTrigger() {
  const notify = useToast();
  return (
    <button
      type="button"
      id="toast-opener"
      onClick={() =>
        notify('Saved successfully', { variant: 'success', duration: 0 })
      }
    >
      Show toast
    </button>
  );
}

mountPage(<App />);
