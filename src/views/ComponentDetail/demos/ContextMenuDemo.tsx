import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/lib';

import PropsTable from '../PropsTable';

import { AccessibilitySection, DemoPage, DemoSection } from './shared';

// ─── ContextMenu ────────────────────────────────────────────────
export default function ContextMenuDemo() {
  return (
    <DemoPage
      title='ContextMenu'
      description='Right-click context menu positioned at cursor.'
    >
      <DemoSection title='Demo'>
        <ContextMenu>
          <ContextMenuTrigger>
            <div style={{ padding: 'var(--haze-space-6)', border: '1px dashed var(--haze-color-border)', borderRadius: 'var(--haze-radius-md)', textAlign: 'center' }}>
              Right-click here to open context menu
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Copy</ContextMenuItem>
            <ContextMenuItem>Paste</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Select All</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </DemoSection>

      <DemoSection title='ContextMenu Props'>
        <PropsTable of='ContextMenuProps' />
      </DemoSection>

      <DemoSection title='ContextMenuItem Props'>
        <PropsTable of='ContextMenuItemProps' />
      </DemoSection>

      <AccessibilitySection>
        <ul>
          <li>Opens on right-click (contextmenu event)</li>
          <li>Content is positioned at cursor coordinates</li>
          <li>Click outside closes the menu</li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
