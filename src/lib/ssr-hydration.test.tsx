//
// SSR hydration test (default jsdom environment): every fixture is first
// rendered with react-dom/server's renderToString, then the exact same
// element tree is hydrated with hydrateRoot into a container pre-filled
// with that server HTML. Asserts:
//
//   1. console.error/warning stay silent through hydration — hydration
//      mismatches surface there and must NOT be filtered away;
//   2. hydrated text content matches the server-rendered text content;
//   3. unmount leaves the container empty (clean teardown).
//
// SSR exemption list: EMPTY — every component below hydrates cleanly.
import type { ReactElement } from 'react';

import { act } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import { useForm } from 'react-f0rm';

// Direct component-file imports, mirroring ssr-render.node.test.tsx (the
// ./index barrel drags in tokens/colors.ts, whose Linaria interpolation is
// irrelevant to hydration and slows node-env runs; see that file's note).
import Accordion from './components/Accordion/Accordion';
import AccordionItem from './components/Accordion/AccordionItem';
import Banner from './components/Banner/Banner';
import Button from './components/Button/Button';
import ButtonLink from './components/Button/ButtonLink';
import ChatMessage from './components/ChatMessage/ChatMessage';
import Checkbox from './components/Checkbox/Checkbox';
import Combobox from './components/Combobox/Combobox';
import Datepicker from './components/Datepicker/Datepicker';
import Dialog from './components/Dialog/Dialog';
import FormItem from './form/FormItem';
import Input from './components/Input/Input';
import InputCore from './components/Input/InputCore';
import MarkdownRenderer from './components/MarkdownRenderer/MarkdownRenderer';
import Option from './components/Select/Option';
import Popover from './components/Popover/Popover';
import SelectCore from './components/Select/SelectCore';
import Step from './components/Stepper/Step';
import Stepper from './components/Stepper/Stepper';
import StreamingText from './components/StreamingText/StreamingText';
import Switch from './components/Switch/Switch';
import Table from './components/Table/Table';
import TableBody from './components/Table/TableBody';
import TableCell from './components/Table/TableCell';
import TableHead from './components/Table/TableHead';
import TableRow from './components/Table/TableRow';
import Tab from './components/Tabs/Tab';
import TabList from './components/Tabs/TabList';
import TabPanel from './components/Tabs/TabPanel';
import Tabs from './components/Tabs/Tabs';
import Tooltip from './components/Tooltip/Tooltip';
import Tree from './components/Tree/Tree';

// hydrateRoot schedules effects/updates that act() must gate — flip the
// flag @testing-library/react would normally set (this file drives React
// directly).
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

function TabsFixture() {
  return (
    <Tabs value="one">
      <TabList>
        <Tab value="one">Tab 1</Tab>
        <Tab value="two">Tab 2</Tab>
      </TabList>
      <TabPanel value="one">Panel 1</TabPanel>
      <TabPanel value="two">Panel 2</TabPanel>
    </Tabs>
  );
}

function TableFixture() {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell as="th">Name</TableCell>
          <TableCell as="th">Age</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>Alice</TableCell>
          <TableCell>30</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

function FormItemFixture() {
  const form = useForm({ initialValues: { email: 'a@b.c' } });
  return (
    <FormItem form={form} name="email" label="Email">
      {({ id, errorId, invalid, value, onChange }) => (
        <InputCore
          id={id}
          value={value}
          onChange={onChange}
          aria-invalid={invalid}
          aria-describedby={errorId}
        />
      )}
    </FormItem>
  );
}

const TREE_DATA = [
  {
    key: 'docs',
    title: 'Docs',
    children: [{ key: 'guide', title: 'Guide' }],
  },
];

const COMBOBOX_OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
];

const noop = () => undefined;

const CASES: [name: string, element: ReactElement][] = [
  ['Button', <Button>Save changes</Button>],
  ['ButtonLink', <ButtonLink href="https://example.com">Read docs</ButtonLink>],
  ['Input', <Input placeholder="Enter text" />],
  ['InputCore', <InputCore value="" onChange={noop} placeholder="Bare input" />],
  [
    'SelectCore',
    (
      <SelectCore value="" onChange={noop} aria-label="fruit">
        <Option value="apple">Apple</Option>
      </SelectCore>
    ),
  ],
  ['Checkbox', <Checkbox aria-label="agree" label="Remember me" />],
  ['Switch', <Switch aria-label="toggle" />],
  ['Tabs', <TabsFixture />],
  [
    'Accordion',
    (
      <Accordion>
        <AccordionItem title="Section 1">Content 1</AccordionItem>
      </Accordion>
    ),
  ],
  ['Dialog (closed)', <Dialog title="Confirm">Are you sure?</Dialog>],
  ['Popover (closed)', <Popover content="Popover body">Trigger</Popover>],
  [
    'Tooltip (closed)',
    (
      <Tooltip content="Help text">
        <button>Hover me</button>
      </Tooltip>
    ),
  ],
  ['Datepicker (closed)', <Datepicker />],
  [
    'Combobox',
    <Combobox options={COMBOBOX_OPTIONS} placeholder="Search fruit" />,
  ],
  ['Tree', <Tree treeData={TREE_DATA} />],
  ['Table', <TableFixture />],
  [
    'Stepper',
    (
      <Stepper activeStep={1}>
        <Step title="Cart" />
        <Step title="Pay" />
      </Stepper>
    ),
  ],
  [
    'ChatMessage',
    <ChatMessage role="user" name="Alice">Hello there</ChatMessage>,
  ],
  [
    'MarkdownRenderer',
    <MarkdownRenderer content={'# Title\n\nSome **bold** text'} />,
  ],
  // speed=1h: the stream restarts empty on the client (matching the
  // server), and the first tick must never land mid-test.
  ['StreamingText', <StreamingText text="Hello world" speed={3_600_000} />],
  ['Banner', <Banner>Scheduled maintenance</Banner>],
  ['FormItem', <FormItemFixture />],
];

describe('SSR hydration (jsdom)', () => {
  it.each(CASES)('%s hydrates without mismatch', async (_name, element) => {
    // 1. Server render.
    const html = renderToString(element);

    // 2. Reference copy of the server DOM for text comparison (detached —
    //    never hydrated, never in the document).
    const reference = document.createElement('div');
    reference.innerHTML = html;
    const serverText = reference.textContent;

    // 3. Live container pre-filled with the server markup.
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    // 4. Hydrate under error capture. React 19 surfaces hydration
    //    mismatches through hydrateRoot's onRecoverableError callback —
    //    NOT console.error — so both channels are recorded and asserted
    //    empty; nothing is filtered.
    const messages: string[] = [];
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation((...args: unknown[]) => {
        messages.push(`error: ${args.join(' ')}`);
      });
    const warnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation((...args: unknown[]) => {
        messages.push(`warn: ${args.join(' ')}`);
      });
    const recoverable: string[] = [];
    // React 19 signature: onRecoverableError(error, errorInfo) — the
    // component stack lives on the second argument.
    const onRecoverableError = (
      err: unknown,
      info: { componentStack?: string } = {}
    ) => {
      recoverable.push(
        `${String(err)}${info.componentStack ?? ''}`
      );
    };

    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(container, element, { onRecoverableError });
        await Promise.resolve();
      });
      // Flush post-hydration effects/passive updates inside act.
      await act(async () => {
        await Promise.resolve();
      });

      expect(messages).toEqual([]);
      expect(recoverable).toEqual([]);
      // The equality contract is about the visible DOM: hydration must
      // not rewrite what shipped. Hidden live regions may legitimately
      // speak right after hydration (StreamingText cues its stream the
      // moment effects run), so their nodes are excluded — the server
      // side ships them empty, which is what makes both sides comparable.
      const visible = container.cloneNode(true) as HTMLElement;
      for (const region of visible.querySelectorAll(
        "[data-slot='live-region']",
      )) {
        region.remove();
      }
      expect(visible.textContent).toBe(serverText);
    } finally {
      errorSpy.mockRestore();
      warnSpy.mockRestore();
      if (root) {
        await act(async () => {
          root!.unmount();
          await Promise.resolve();
        });
      }
    }

    // 5. Clean teardown: React removes its nodes, nothing left behind.
    expect(container.childNodes).toHaveLength(0);
    container.remove();
  });
});

// ---------------------------------------------------------------------------
// Floating panels across SSR + hydration. React 19 does not patch
// attribute mismatches after hydration: whatever attributes the server
// shipped are what the hydrated DOM keeps until a prop change rewrites
// them. The popover attribute is therefore a server-render contract —
// a panel that ships without it can never call showPopover in a real
// browser, no matter what the client render computes.
// ---------------------------------------------------------------------------

// jsdom implements neither the Popover API nor ToggleEvent; patch the
// prototype surface (same approach as Popover.test.tsx / Dialog's
// showModal mocks). showPopover is browser-faithful: calling it on an
// element without the popover attribute throws, exactly like a real
// engine's "Not supported on elements that are not popovers".
class ToggleEventPolyfill extends Event {
  newState: string;
  constructor(type: string, init: { newState: string }) {
    super(type);
    this.newState = init.newState;
  }
}

const showPopoverMock = vi.fn(function (this: HTMLElement) {
  if (!this.hasAttribute('popover')) {
    throw new DOMException(
      'Not supported on elements that are not popovers',
      'NotSupportedError'
    );
  }
  this.setAttribute('data-popover-open', '');
  this.dispatchEvent(new ToggleEventPolyfill('toggle', { newState: 'open' }));
});

const hidePopoverMock = vi.fn(function (this: HTMLElement) {
  if (!this.hasAttribute('data-popover-open')) return;
  this.removeAttribute('data-popover-open');
  this.dispatchEvent(
    new ToggleEventPolyfill('toggle', { newState: 'closed' })
  );
});

type PopoverProtoPatch = {
  popover?: unknown;
  showPopover?: () => void;
  hidePopover?: () => void;
};

function installNativePopover() {
  Object.defineProperty(HTMLElement.prototype, 'popover', {
    configurable: true,
    value: 'manual',
  });
  HTMLElement.prototype.showPopover = showPopoverMock;
  HTMLElement.prototype.hidePopover = hidePopoverMock;
}

function removeNativePopover() {
  const proto = HTMLElement.prototype as PopoverProtoPatch;
  delete proto.popover;
  delete proto.showPopover;
  delete proto.hidePopover;
}

describe('SSR hydration — floating panels', () => {
  afterEach(() => {
    showPopoverMock.mockClear();
    hidePopoverMock.mockClear();
  });

  it('ships the panel as popover=auto in server HTML', () => {
    // renderToString in jsdom probes the same "no engine" path node SSR
    // takes: the capability detection must not strip the attribute.
    const html = renderToString(
      <Popover content="Popover body">Trigger</Popover>
    );
    const reference = document.createElement('div');
    reference.innerHTML = html;
    const panel = reference.querySelector("[data-slot='content']");
    expect(panel).toHaveAttribute('popover', 'auto');
  });

  it('removes the attribute after hydration when the engine lacks the API', async () => {
    // jsdom-tier client (no popover API): the attribute ships from the
    // server but must not linger — UA stylesheets hide [popover] elements
    // that are not :popover-open, which would defeat the fallback tier's
    // open state on any engine that styles the attribute without the API.
    const html = renderToString(
      <Popover content="Popover body">Trigger</Popover>
    );
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    const panel = () => {
      const trigger = container.querySelector('[role="button"]')!;
      return document.getElementById(trigger.getAttribute('aria-controls')!)!;
    };
    // Server markup carries the progressive-enhancement attribute...
    expect(panel()).toHaveAttribute('popover', 'auto');

    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(
          container,
          <Popover content="Popover body">Trigger</Popover>
        );
        await Promise.resolve();
      });
      await act(async () => {
        await Promise.resolve();
      });
      // ...and the client that positively lacks the API takes it back off.
      expect(panel()).not.toHaveAttribute('popover');
    } finally {
      if (root) {
        await act(async () => {
          root!.unmount();
          await Promise.resolve();
        });
      }
      container.remove();
    }
  });

  it('hydrates into a working native-tier pair without mismatches', async () => {
    // 1. Server render with NO engine installed — mirrors node SSR,
    //    where capabilities cannot be probed.
    const html = renderToString(
      <Popover content="Popover body">Trigger</Popover>
    );

    // 2. The browser arrives: install the popover API, then hydrate the
    //    server markup with the same tree.
    installNativePopover();
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    const messages: string[] = [];
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation((...args: unknown[]) => {
        messages.push(`error: ${args.join(' ')}`);
      });
    const warnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation((...args: unknown[]) => {
        messages.push(`warn: ${args.join(' ')}`);
      });
    const recoverable: string[] = [];
    const onRecoverableError = (
      err: unknown,
      info: { componentStack?: string } = {}
    ) => {
      recoverable.push(`${String(err)}${info.componentStack ?? ''}`);
    };

    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      await act(async () => {
        root = hydrateRoot(
          container,
          <Popover content="Popover body">Trigger</Popover>,
          { onRecoverableError }
        );
        await Promise.resolve();
      });
      await act(async () => {
        await Promise.resolve();
      });

      // No hydration mismatch: the server markup and the hydration pass
      // must agree attribute-for-attribute.
      expect(messages).toEqual([]);
      expect(recoverable).toEqual([]);

      const trigger = container.querySelector<HTMLElement>('[role="button"]')!;
      const panel = document.getElementById(
        trigger.getAttribute('aria-controls')!
      )!;
      // The attribute survived hydration — React 19 keeps the server DOM
      // for attributes, so only a matching server render keeps it there.
      expect(panel).toHaveAttribute('popover', 'auto');

      // Interaction reaches the engine: without the shipped attribute
      // this click throws NotSupportedError from inside the open effect
      // (the bug this suite pins).
      await act(async () => {
        trigger.click();
        await Promise.resolve();
      });
      expect(showPopoverMock).toHaveBeenCalledTimes(1);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    } finally {
      errorSpy.mockRestore();
      warnSpy.mockRestore();
      removeNativePopover();
      if (root) {
        await act(async () => {
          root!.unmount();
          await Promise.resolve();
        });
      }
      container.remove();
    }
  });
});
