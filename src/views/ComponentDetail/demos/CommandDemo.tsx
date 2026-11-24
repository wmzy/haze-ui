import { useControl } from 'react-use-control';

import {
  Button,
  Command,
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Kbd,
} from '@/lib';

import PropsTable from '../PropsTable';

import { AccessibilitySection, DemoPage, DemoSection } from './shared';

/** The dialog example needs shared state for the button + the mod+k hotkey. */
function CommandPaletteExample() {
  const [, , openCtrl] = useControl(undefined, false);
  const [, setOpen] = useControl(openCtrl);

  return (
    <>
      <p>
        Press <Kbd size='sm'>mod</Kbd> + <Kbd size='sm'>K</Kbd> (macOS ⌘K, elsewhere Ctrl+K)
        anywhere on this page, or:
      </p>
      <Button onClick={() => setOpen(true)}>Open command palette</Button>
      <CommandDialog
        open={openCtrl}
        hotkey='mod+k'
        title='Command Palette'
        placeholder='Type a command...'
      >
        <CommandList>
          <CommandGroup heading='File'>
            <CommandItem shortcut='⌘N'>New File</CommandItem>
            <CommandItem shortcut='⌘O'>Open File…</CommandItem>
            <CommandItem shortcut='⌘S'>Save</CommandItem>
          </CommandGroup>
          <CommandGroup heading='Preferences'>
            <CommandItem keywords={['palette', 'hotkey']}>Settings</CommandItem>
            <CommandItem shortcut='⌘⇧P'>Command Palette</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

/** Long-list section dataset: 500 generated commands for the virtualized path. */
const MANY_COMMANDS = Array.from({ length: 500 }, (_, index) =>
  `Command ${String(index + 1).padStart(3, '0')}`
);

// ─── Command ────────────────────────────────────────────────────
export default function CommandDemo() {
  return (
    <DemoPage
      title='Command'
      description='Command palette with fuzzy filterable list of items.'
    >
      <DemoSection title='Demo'>
        <Command>
          <CommandInput placeholder='Type a command...' />
          <CommandList>
            <CommandGroup heading='File'>
              <CommandItem shortcut='⌘N'>New File</CommandItem>
              <CommandItem shortcut='⌘O'>Open File…</CommandItem>
              <CommandItem shortcut='⌘S'>Save</CommandItem>
            </CommandGroup>
            <CommandGroup heading='Other'>
              <CommandItem>Settings</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DemoSection>

      <DemoSection title='Fuzzy matching'>
        <p>
          Filtering is fuzzy by default: every query character must appear in an item's{' '}
          <code>value</code> / children text / <code>keywords</code> in order
          (case-insensitive), and hits are ranked best-first — prefix matches beat middle
          matches, contiguous runs beat scattered ones, word starts and camelCase humps get a
          boost, and earlier matches win ties. Try <code>sa</code> below: <em>Save</em>{' '}
          (prefix, contiguous) outranks <em>Mesa</em> (middle hit); <code>fb</code> ranks{' '}
          <em>fooBar</em> above <em>foobar</em>; <code>pref</code> surfaces Settings through
          its keyword.
        </p>
        <Command>
          <CommandInput placeholder='Try "sa", "fb" or "pref"...' />
          <CommandList>
            <CommandItem>Mesa</CommandItem>
            <CommandItem>Save</CommandItem>
            <CommandItem>fooBar</CommandItem>
            <CommandItem>foobar</CommandItem>
            <CommandItem keywords={['preferences']}>Settings</CommandItem>
          </CommandList>
        </Command>
      </DemoSection>

      <DemoSection title='Long lists (virtualized)'>
        <p>
          Pass <code>virtualized</code> to <code>CommandList</code> to render long flat lists
          through VirtualList — only the visible window stays mounted, so the 500 items below
          cost about a dozen DOM rows no matter how the query filters them (ranking works
          through the virtual path too). Flat <code>CommandItem</code> children only:{' '}
          <code>virtualized</code> with grouped or wrapped content logs a dev warning and
          falls back to the plain path.
        </p>
        <Command>
          <CommandInput placeholder='Search 500 commands...' />
          <CommandList virtualized>
            {MANY_COMMANDS.map((label) => (
              <CommandItem key={label}>{label}</CommandItem>
            ))}
          </CommandList>
        </Command>
      </DemoSection>

      <DemoSection title='CommandDialog (mod+k)'>
        <p>
          <code>CommandDialog</code> composes <code>Dialog</code> (native top-layer
          <code>&lt;dialog&gt;</code>) with <code>Command</code>: it registers a global
          hotkey (<code>hotkey=&apos;mod+k&apos;</code> — omit the prop to register nothing),
          focuses the input on open, closes on Esc / backdrop / item selection, and
          renders the empty-state copy when filtering leaves nothing.
        </p>
        <CommandPaletteExample />
      </DemoSection>

      <DemoSection title='Command Props'>
        <PropsTable of='CommandProps' />
      </DemoSection>

      <DemoSection title='CommandInput Props'>
        <PropsTable of='CommandInputProps' />
      </DemoSection>

      <DemoSection title='CommandList Props'>
        <PropsTable of='CommandListProps' />
      </DemoSection>

      <DemoSection title='CommandItem Props'>
        <PropsTable of='CommandItemProps' />
      </DemoSection>

      <DemoSection title='CommandGroup Props'>
        <PropsTable of='CommandGroupProps' />
      </DemoSection>

      <DemoSection title='CommandDialog Props'>
        <PropsTable of='CommandDialogProps' />
      </DemoSection>

      <AccessibilitySection>
        <ul>
          <li>Uses <strong>role=&quot;combobox&quot;</strong> on the container</li>
          <li>Items use <strong>role=&quot;option&quot;</strong>, groups <strong>role=&quot;group&quot;</strong> named by their heading</li>
          <li>Typing in the input fuzzy-matches items by <code>value</code> / children text / <code>keywords</code> and ranks hits best-first</li>
          <li>Groups whose every item was filtered out hide entirely; keyboard focus stays continuous across groups</li>
          <li>CommandDialog traps focus in the native modal dialog and returns it on close</li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
