import type { ReactNode } from 'react';

import { useState } from 'react';
import { useMatched } from '@native-router/react';
import { useControl } from 'react-use-control';

const noop = () => {
  /* demo placeholder */
};

import {
  Button,
  Input,
  Select,
  Option,
  Checkbox,
  Switch,
  Badge,
  Dialog,
  Tooltip,
  Popover,
  Card,
  Radio,
  RadioGroup,
  Textarea,
  Slider,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Accordion,
  AccordionItem,
  Alert,
  Avatar,
  Tag,
  Skeleton,
  Icon,
  Image,
  Flex,
  Breadcrumb,
  BreadcrumbItem,
  Disclosure,
  Menu,
  MenuItem,
  MenuDivider,
  NumberInput,
  FileInput,
  ToastContainer,
  useToast,
  List,
  ListItem,
  Combobox,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Carousel,
  CarouselSlide,
  Datepicker,
  COMPONENT_TOKENS,
  Tree,
  type TreeNodeData,
  Divider,
  Spinner,
  Empty,
  Progress,
  Pagination,
  Grid,
  GridItem,
  Drawer,
  Stepper,
  Step,
  ChatMessage,
  ChatContainer,
  ChatInput,
  StreamingText,
  MarkdownRenderer,
  ToolCallCard,
  ThinkingIndicator,
  StepTimeline,
  StepTimelineItem,
  ApprovalCard,
  TokenCounter,
  ModelPicker,
  ConversationList,
  ConversationItem,
  DiffViewer,
  LogViewer,
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  ResizableGroup,
  ResizablePanel,
  ResizableHandle,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  Transfer,
  Upload,
  ColorPicker,
  Rating,
  Timeline,
  TimelineItem,
  Title,
  Text,
  Paragraph,
  Stat,
  StatGroup,
  Segmented,
  Chip,
  ScrollArea,
  TimePicker,
  DateRangePicker,
  OTPInput,
  PasswordInput,
  TagInput,
  InlineEdit,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  NavigationBar,
  NavLink,
  BackToTop,
  Affix,
  Container,
  Banner,
  ConfirmDialog,
  CodeBlock,
  AspectRatio,
  VirtualList,
  TagGroup,
  TagGroupItem,
  BottomSheet,
  SwipeAction,
} from '@/lib';

import PropsTable from './PropsTable';
import A11yNote from './A11yNote';
import TokensTable from './TokensTable';
import {
  page,
  intro,
  section,
  row,
  fieldRow,
  labelStyle,
  codeBlock,
} from './styles';

function CssVarsSection({ component }: { component: string }) {
  const tokens = COMPONENT_TOKENS[component];
  if (!tokens?.length) return null;
  return (
    <div className={section}>
      <h2>CSS Variables</h2>
      <TokensTable tokens={tokens} />
    </div>
  );
}

// ─── Shared SVG helpers ─────────────────────────────────────────

function StrokeSvg() {
  return (
    <svg viewBox='0 0 24 24'>
      <path
        d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'
        fill='none'
        stroke='currentColor'
        strokeWidth='2'
      />
    </svg>
  );
}

function FillSvg() {
  return (
    <svg viewBox='0 0 24 24'>
      <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
    </svg>
  );
}

// ─── Button ────────────────────────────────────────────────────

function ButtonDemo() {
  return (
    <>
      <h1>Button</h1>
      <p className={intro}>Trigger actions with configurable style and size.</p>

      <div className={section}>
        <h2>Variants</h2>
        <div className={row}>
          <Button variant='solid'>Solid</Button>
          <Button variant='outline'>Outline</Button>
          <Button variant='ghost'>Ghost</Button>
        </div>
      </div>

      <div className={section}>
        <h2>Sizes</h2>
        <div className={row}>
          <Button size='sm'>Small</Button>
          <Button size='md'>Medium</Button>
          <Button size='lg'>Large</Button>
        </div>
      </div>

      <div className={section}>
        <h2>Square (Icon Button)</h2>
        <p
          style={{
            fontSize: 'var(--haze-text-sm)',
            color: 'var(--haze-color-text-secondary)',
            margin: '0 0 var(--haze-space-3)',
          }}
        >
          Use <code>square</code> for icon-only buttons with equal padding on
          all sides.
        </p>
        <div className={row}>
          <Button size='sm' square variant='solid'>
            <Icon size='sm'>
              <StrokeSvg />
            </Icon>
          </Button>
          <Button size='md' square variant='solid'>
            <Icon size='sm'>
              <StrokeSvg />
            </Icon>
          </Button>
          <Button size='lg' square variant='solid'>
            <Icon size='md'>
              <StrokeSvg />
            </Icon>
          </Button>
          <Button size='sm' square variant='outline'>
            <Icon size='sm'>
              <StrokeSvg />
            </Icon>
          </Button>
          <Button size='sm' square variant='ghost'>
            <Icon size='sm'>
              <StrokeSvg />
            </Icon>
          </Button>
        </div>
      </div>

      <div className={section}>
        <h2>Disabled</h2>
        <div className={row}>
          <Button disabled>Disabled Solid</Button>
          <Button variant='outline' disabled>
            Disabled Outline
          </Button>
          <Button variant='ghost' disabled>
            Disabled Ghost
          </Button>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'variant',
              type: "'solid' | 'outline' | 'ghost'",
              default: "'solid'",
              description: 'Visual style of the button',
            },
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg'",
              default: "'md'",
              description: 'Size of the button',
            },
            {
              name: 'square',
              type: 'boolean',
              default: 'false',
              description:
                'Equal padding on all sides, ideal for icon-only buttons',
            },
            {
              name: 'disabled',
              type: 'boolean',
              default: 'false',
              description: 'Disable the button',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: '...rest',
              type: 'ButtonHTMLAttributes',
              description: 'All native button attributes (except type)',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Renders as native <strong>&lt;button&gt;</strong> with{' '}
              <strong>type=&quot;button&quot;</strong>
            </li>
            <li>
              Supports <strong>Tab</strong> focus and <strong>Enter</strong>/
              <strong>Space</strong> activation
            </li>
            <li>
              Disabled state uses <strong>disabled</strong> attribute, removing
              from tab order
            </li>
            <li>
              Focus ring via <strong>:focus-visible</strong>
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='button' />
    </>
  );
}

// ─── Input ─────────────────────────────────────────────────────

function InputDemo() {
  return (
    <>
      <h1>Input</h1>
      <p className={intro}>
        Single-line text input with controlled/uncontrolled support.
      </p>

      <div className={section}>
        <h2>Sizes</h2>
        <div className={fieldRow}>
          <Input size='sm' placeholder='Small' />
        </div>
        <div className={fieldRow}>
          <Input size='md' placeholder='Medium' />
        </div>
        <div className={fieldRow}>
          <Input size='lg' placeholder='Large' />
        </div>
      </div>

      <div className={section}>
        <h2>Disabled</h2>
        <div className={fieldRow}>
          <Input disabled placeholder='Disabled' />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'value',
              type: 'Control<string> | string',
              description: 'Controlled value or control object',
            },
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg'",
              default: "'md'",
              description: 'Size of the input',
            },
            {
              name: 'disabled',
              type: 'boolean',
              default: 'false',
              description: 'Disable the input',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: '...rest',
              type: 'InputHTMLAttributes',
              description: 'All native input attributes',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Renders as native <strong>&lt;input&gt;</strong>
            </li>
            <li>
              Use <strong>aria-label</strong> or a visible{' '}
              <strong>&lt;label&gt;</strong> for screen readers
            </li>
            <li>
              Focus ring via <strong>:focus</strong> pseudo-class
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='input' />
    </>
  );
}

// ─── Select ────────────────────────────────────────────────────

function SelectDemo() {
  return (
    <>
      <h1>Select</h1>
      <p className={intro}>
        Dropdown selection with native &lt;select&gt; semantics.
      </p>

      <div className={section}>
        <h2>Sizes</h2>
        <div className={fieldRow}>
          <Select size='sm'>
            <Option value=''>Small select</Option>
            <Option value='a'>Option A</Option>
            <Option value='b'>Option B</Option>
          </Select>
        </div>
        <div className={fieldRow}>
          <Select size='md'>
            <Option value=''>Medium select</Option>
            <Option value='a'>Option A</Option>
            <Option value='b'>Option B</Option>
          </Select>
        </div>
        <div className={fieldRow}>
          <Select size='lg'>
            <Option value=''>Large select</Option>
            <Option value='a'>Option A</Option>
            <Option value='b'>Option B</Option>
          </Select>
        </div>
      </div>

      <div className={section}>
        <h2>Disabled</h2>
        <div className={fieldRow}>
          <Select disabled>
            <Option value=''>Disabled</Option>
          </Select>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'value',
              type: 'Control<string> | string',
              description: 'Controlled value or control object',
            },
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg'",
              default: "'md'",
              description: 'Size of the select',
            },
            {
              name: 'disabled',
              type: 'boolean',
              default: 'false',
              description: 'Disable the select',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: '<Option> elements',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Renders as native <strong>&lt;select&gt;</strong> with full
              keyboard support
            </li>
            <li>
              Use <strong>aria-label</strong> or a visible{' '}
              <strong>&lt;label&gt;</strong>
            </li>
            <li>
              <strong>Arrow keys</strong> navigate options,{' '}
              <strong>Enter</strong> selects
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='select' />
    </>
  );
}

// ─── Checkbox ──────────────────────────────────────────────────

function CheckboxDemo() {
  return (
    <>
      <h1>Checkbox</h1>
      <p className={intro}>Toggle a boolean value on or off.</p>

      <div className={section}>
        <h2>Default</h2>
        <div className={row}>
          <label className={labelStyle}>
            <Checkbox /> Unchecked
          </label>
          <label className={labelStyle}>
            <Checkbox checked /> Checked
          </label>
        </div>
      </div>

      <div className={section}>
        <h2>Disabled</h2>
        <div className={row}>
          <label className={labelStyle}>
            <Checkbox disabled /> Disabled
          </label>
          <label className={labelStyle}>
            <Checkbox checked disabled /> Checked Disabled
          </label>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'checked',
              type: 'Control<boolean> | boolean',
              description: 'Controlled checked state or control object',
            },
            {
              name: 'disabled',
              type: 'boolean',
              default: 'false',
              description: 'Disable the checkbox',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: '...rest',
              type: 'InputHTMLAttributes',
              description: 'All native input attributes',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Renders as native{' '}
              <strong>&lt;input type=&quot;checkbox&quot;&gt;</strong>
            </li>
            <li>
              <strong>Space</strong> toggles the checked state
            </li>
            <li>
              Wrap with <strong>&lt;label&gt;</strong> for accessible labeling
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='checkbox' />
    </>
  );
}

// ─── Switch ────────────────────────────────────────────────────

function SwitchDemo() {
  return (
    <>
      <h1>Switch</h1>
      <p className={intro}>
        Toggle between on/off states with a sliding control.
      </p>

      <div className={section}>
        <h2>Sizes</h2>
        <div className={row}>
          <Switch size='sm' />
          <Switch size='md' />
          <Switch size='lg' />
        </div>
      </div>

      <div className={section}>
        <h2>Disabled</h2>
        <div className={row}>
          <Switch disabled />
          <Switch checked disabled />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'checked',
              type: 'Control<boolean> | boolean',
              description: 'Controlled checked state or control object',
            },
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg'",
              default: "'md'",
              description: 'Size of the switch',
            },
            {
              name: 'disabled',
              type: 'boolean',
              default: 'false',
              description: 'Disable the switch',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Uses <strong>role=&quot;switch&quot;</strong> with{' '}
              <strong>aria-checked</strong>
            </li>
            <li>
              <strong>Space</strong> toggles the state
            </li>
            <li>
              Provide <strong>aria-label</strong> when no visible label is
              present
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='switch' />
    </>
  );
}

// ─── Badge ─────────────────────────────────────────────────────

function BadgeDemo() {
  return (
    <>
      <h1>Badge</h1>
      <p className={intro}>
        Small status indicators for labeling and categorization.
      </p>

      <div className={section}>
        <h2>Variants</h2>
        <div className={row}>
          <Badge variant='default'>Default</Badge>
          <Badge variant='success'>Success</Badge>
          <Badge variant='warning'>Warning</Badge>
          <Badge variant='danger'>Danger</Badge>
          <Badge variant='info'>Info</Badge>
        </div>
      </div>

      <div className={section}>
        <h2>Sizes</h2>
        <div className={row}>
          <Badge size='sm'>Small</Badge>
          <Badge size='md'>Medium</Badge>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'variant',
              type: "'default' | 'success' | 'warning' | 'danger' | 'info'",
              default: "'default'",
              description: 'Color variant',
            },
            {
              name: 'size',
              type: "'sm' | 'md'",
              default: "'md'",
              description: 'Size of the badge',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Badge content',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Renders as a <strong>&lt;span&gt;</strong> — purely decorative
            </li>
            <li>
              Add <strong>aria-label</strong> if the badge conveys meaning not
              present in surrounding text
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='badge' />
    </>
  );
}

// ─── Dialog ────────────────────────────────────────────────────

function DialogDemo() {
  const [, , openCtrl] = useControl(undefined, false);
  const [, setOpen] = useControl(openCtrl);

  return (
    <>
      <h1>Dialog</h1>
      <p className={intro}>
        Modal dialog using the native &lt;dialog&gt; element.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div className={row}>
          <Button onClick={() => setOpen(true)}>Open Dialog</Button>
        </div>
        <Dialog open={openCtrl} onClose={() => setOpen(false)}>
          <h3 style={{ margin: '0 0 8px' }}>Dialog Title</h3>
          <p
            style={{
              margin: '0 0 16px',
              color: 'var(--haze-color-text-secondary)',
            }}
          >
            This is a modal dialog. Press ESC or click the backdrop to close.
          </p>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </Dialog>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'open',
              type: 'Control<boolean> | boolean',
              default: 'false',
              description: 'Whether the dialog is open',
            },
            {
              name: 'onClose',
              type: '() => void',
              description: 'Called when the dialog is closed',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Dialog content',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Uses native <strong>&lt;dialog&gt;</strong> with{' '}
              <strong>showModal()</strong> — automatic{' '}
              <strong>role=&quot;dialog&quot;</strong>
            </li>
            <li>
              <strong>ESC</strong> closes the dialog
            </li>
            <li>Focus is trapped within the dialog while open</li>
            <li>Backdrop click closes the dialog</li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='dialog' />
    </>
  );
}

// ─── Tooltip ───────────────────────────────────────────────────

function TooltipDemo() {
  return (
    <>
      <h1>Tooltip</h1>
      <p className={intro}>
        Informational popup triggered by hover or focus, using pure CSS.
      </p>

      <div className={section}>
        <h2>Positions</h2>
        <div className={row}>
          <Tooltip content='Top tooltip' position='top'>
            <Button variant='outline'>Top</Button>
          </Tooltip>
          <Tooltip content='Bottom tooltip' position='bottom'>
            <Button variant='outline'>Bottom</Button>
          </Tooltip>
          <Tooltip content='Left tooltip' position='left'>
            <Button variant='outline'>Left</Button>
          </Tooltip>
          <Tooltip content='Right tooltip' position='right'>
            <Button variant='outline'>Right</Button>
          </Tooltip>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'content',
              type: 'ReactNode',
              description: 'Tooltip content',
            },
            {
              name: 'position',
              type: "'top' | 'bottom' | 'left' | 'right'",
              default: "'top'",
              description: 'Tooltip placement',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Trigger element',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Uses <strong>role=&quot;tooltip&quot;</strong> with{' '}
              <strong>aria-describedby</strong>
            </li>
            <li>
              Visible on <strong>hover</strong> and{' '}
              <strong>focus-within</strong>
            </li>
            <li>Content is always in the DOM for screen readers</li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='tooltip' />
    </>
  );
}

// ─── Popover ───────────────────────────────────────────────────

function PopoverDemo() {
  return (
    <>
      <h1>Popover</h1>
      <p className={intro}>
        Click-triggered floating panel for additional content.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div className={row}>
          <Popover content={<div>Popover content goes here.</div>}>
            <Button variant='outline'>Toggle Popover</Button>
          </Popover>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'content',
              type: 'ReactNode',
              description: 'Popover panel content',
            },
            {
              name: 'open',
              type: 'Control<boolean> | boolean',
              default: 'false',
              description: 'Whether the popover is open',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Trigger element',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Trigger has <strong>aria-expanded</strong> and{' '}
              <strong>aria-controls</strong>
            </li>
            <li>
              Panel is hidden with <strong>display: none</strong> when closed
            </li>
            <li>Click trigger to toggle open/close</li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='popover' />
    </>
  );
}

// ─── Card ──────────────────────────────────────────────────────

function CardDemo() {
  return (
    <>
      <h1>Card</h1>
      <p className={intro}>
        Container for grouping related content with visual separation.
      </p>

      <div className={section}>
        <h2>Variants</h2>
        <div className={row} style={{ alignItems: 'stretch' }}>
          <Card variant='elevated'>
            <h3 style={{ margin: '0 0 4px' }}>Elevated</h3>
            <p
              style={{
                margin: 0,
                color: 'var(--haze-color-text-secondary)',
                fontSize: 'var(--haze-text-sm)',
              }}
            >
              Shadow-based elevation.
            </p>
          </Card>
          <Card variant='outlined'>
            <h3 style={{ margin: '0 0 4px' }}>Outlined</h3>
            <p
              style={{
                margin: 0,
                color: 'var(--haze-color-text-secondary)',
                fontSize: 'var(--haze-text-sm)',
              }}
            >
              Border-based separation.
            </p>
          </Card>
          <Card variant='filled'>
            <h3 style={{ margin: '0 0 4px' }}>Filled</h3>
            <p
              style={{
                margin: 0,
                color: 'var(--haze-color-text-secondary)',
                fontSize: 'var(--haze-text-sm)',
              }}
            >
              Background-based distinction.
            </p>
          </Card>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'variant',
              type: "'elevated' | 'outlined' | 'filled'",
              default: "'elevated'",
              description: 'Visual style of the card',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Card content',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Renders as a <strong>&lt;div&gt;</strong> — add{' '}
              <strong>role</strong> and <strong>aria-label</strong> if the card
              represents a distinct landmark
            </li>
            <li>Purely presentational by default</li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='card' />
    </>
  );
}

// ─── Radio ─────────────────────────────────────────────────────

function RadioDemo() {
  return (
    <>
      <h1>Radio</h1>
      <p className={intro}>
        Single selection from a group of options using RadioGroup context.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <RadioGroup>
          <Radio value='apple'>Apple</Radio>
          <Radio value='banana'>Banana</Radio>
          <Radio value='cherry'>Cherry</Radio>
        </RadioGroup>
      </div>

      <div className={section}>
        <h2>RadioGroup Props</h2>
        <PropsTable
          props={[
            {
              name: 'value',
              type: 'Control<string> | string',
              description: 'Controlled value or control object',
            },
            {
              name: 'name',
              type: 'string',
              description: 'HTML name attribute for the radio group',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: '<Radio> elements',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Radio Props</h2>
        <PropsTable
          props={[
            {
              name: 'value',
              type: 'string',
              description: 'Value of this radio option',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            { name: 'children', type: 'ReactNode', description: 'Label text' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Uses native <strong>&lt;input type=&quot;radio&quot;&gt;</strong>{' '}
              inside <strong>&lt;fieldset&gt;</strong>
            </li>
            <li>
              <strong>Arrow keys</strong> navigate between options
            </li>
            <li>
              <strong>Space</strong> selects the focused option
            </li>
            <li>
              Add a <strong>&lt;legend&gt;</strong> inside RadioGroup for group
              labeling
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='radio' />
    </>
  );
}

// ─── Textarea ──────────────────────────────────────────────────

function TextareaDemo() {
  return (
    <>
      <h1>Textarea</h1>
      <p className={intro}>
        Multi-line text input, styled consistently with Input.
      </p>

      <div className={section}>
        <h2>Sizes</h2>
        <div className={fieldRow}>
          <Textarea size='sm' placeholder='Small' rows={3} />
        </div>
        <div className={fieldRow}>
          <Textarea size='md' placeholder='Medium' rows={3} />
        </div>
        <div className={fieldRow}>
          <Textarea size='lg' placeholder='Large' rows={3} />
        </div>
      </div>

      <div className={section}>
        <h2>Disabled</h2>
        <div className={fieldRow}>
          <Textarea disabled placeholder='Disabled' rows={3} />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'value',
              type: 'Control<string> | string',
              description: 'Controlled value or control object',
            },
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg'",
              default: "'md'",
              description: 'Size of the textarea',
            },
            {
              name: 'disabled',
              type: 'boolean',
              default: 'false',
              description: 'Disable the textarea',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: '...rest',
              type: 'TextareaHTMLAttributes',
              description: 'All native textarea attributes',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Renders as native <strong>&lt;textarea&gt;</strong>
            </li>
            <li>
              Use <strong>aria-label</strong> or a visible{' '}
              <strong>&lt;label&gt;</strong>
            </li>
            <li>
              Supports <strong>resize: vertical</strong> by default
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='textarea' />
    </>
  );
}

// ─── Slider ────────────────────────────────────────────────────

function SliderDemo() {
  const [, , valueCtrl] = useControl(undefined, 50);
  const [value] = useControl(valueCtrl);

  return (
    <>
      <h1>Slider</h1>
      <p className={intro}>
        Range input for selecting a numeric value within a range.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div className={fieldRow}>
          <Slider value={valueCtrl} min={0} max={100} step={1} />
          <span
            style={{
              fontSize: 'var(--haze-text-sm)',
              color: 'var(--haze-color-text-secondary)',
            }}
          >
            Value: {value}
          </span>
        </div>
      </div>

      <div className={section}>
        <h2>Disabled</h2>
        <div className={fieldRow}>
          <Slider disabled />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'value',
              type: 'Control<number> | number',
              description: 'Controlled value or control object',
            },
            {
              name: 'min',
              type: 'number',
              default: '0',
              description: 'Minimum value',
            },
            {
              name: 'max',
              type: 'number',
              default: '100',
              description: 'Maximum value',
            },
            {
              name: 'step',
              type: 'number',
              default: '1',
              description: 'Step increment',
            },
            {
              name: 'disabled',
              type: 'boolean',
              default: 'false',
              description: 'Disable the slider',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Renders as native{' '}
              <strong>&lt;input type=&quot;range&quot;&gt;</strong>
            </li>
            <li>
              <strong>Arrow keys</strong> adjust the value by step
            </li>
            <li>
              Use <strong>aria-label</strong> or a visible{' '}
              <strong>&lt;label&gt;</strong>
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='slider' />
    </>
  );
}

// ─── Tabs ──────────────────────────────────────────────────────

function TabsDemo() {
  const [, , tabCtrl] = useControl(undefined, 'tab1');

  return (
    <>
      <h1>Tabs</h1>
      <p className={intro}>
        Organize content into switchable panels with tabbed navigation.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <Tabs value={tabCtrl}>
          <TabList>
            <Tab value='tab1'>Tab One</Tab>
            <Tab value='tab2'>Tab Two</Tab>
            <Tab value='tab3'>Tab Three</Tab>
          </TabList>
          <TabPanel value='tab1'>Content for Tab One.</TabPanel>
          <TabPanel value='tab2'>Content for Tab Two.</TabPanel>
          <TabPanel value='tab3'>Content for Tab Three.</TabPanel>
        </Tabs>
      </div>

      <div className={section}>
        <h2>Tabs Props</h2>
        <PropsTable
          props={[
            {
              name: 'value',
              type: 'Control<string> | string',
              description: 'Active tab value',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'TabList and TabPanel elements',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Tab Props</h2>
        <PropsTable
          props={[
            {
              name: 'value',
              type: 'string',
              description: 'Unique value identifying this tab',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            { name: 'children', type: 'ReactNode', description: 'Tab label' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>TabPanel Props</h2>
        <PropsTable
          props={[
            {
              name: 'value',
              type: 'string',
              description: 'Matches the corresponding Tab value',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Panel content',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Uses <strong>role=&quot;tablist&quot;</strong>,{' '}
              <strong>role=&quot;tab&quot;</strong>,{' '}
              <strong>role=&quot;tabpanel&quot;</strong>
            </li>
            <li>
              Active tab has <strong>aria-selected=&quot;true&quot;</strong>
            </li>
            <li>
              Tabs linked to panels via <strong>aria-controls</strong>
            </li>
            <li>
              <strong>Arrow keys</strong> navigate between tabs
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='tabs' />
    </>
  );
}

// ─── Accordion ─────────────────────────────────────────────────

function AccordionDemo() {
  return (
    <>
      <h1>Accordion</h1>
      <p className={intro}>
        Collapsible content sections using native
        &lt;details&gt;/&lt;summary&gt;.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <Accordion>
          <AccordionItem title='Section One'>
            Content for section one. This uses the native details/summary
            elements.
          </AccordionItem>
          <AccordionItem title='Section Two'>
            Content for section two. Click the header to expand or collapse.
          </AccordionItem>
          <AccordionItem title='Section Three'>
            Content for section three. The chevron rotates on open.
          </AccordionItem>
        </Accordion>
      </div>

      <div className={section}>
        <h2>Accordion Props</h2>
        <PropsTable
          props={[
            {
              name: 'exclusive',
              type: 'boolean',
              default: 'false',
              description: 'Only one item open at a time (uses name attribute)',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'AccordionItem elements',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>AccordionItem Props</h2>
        <PropsTable
          props={[
            {
              name: 'title',
              type: 'ReactNode',
              description: 'Header text shown in the summary',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Collapsible content',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Uses native <strong>&lt;details&gt;</strong>/
              <strong>&lt;summary&gt;</strong> — built-in keyboard and screen
              reader support
            </li>
            <li>
              <strong>Enter</strong>/<strong>Space</strong> toggles open/close
            </li>
            <li>
              Exclusive mode uses the HTML <strong>name</strong> attribute for
              mutual exclusion
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='accordion' />
    </>
  );
}

// ─── Alert ─────────────────────────────────────────────────────

function AlertDemo() {
  const [key, setKey] = useState(0);

  return (
    <>
      <h1>Alert</h1>
      <p className={intro}>Contextual feedback messages for user actions.</p>

      <div className={section}>
        <h2>Variants</h2>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--haze-space-3)',
            maxWidth: 480,
          }}
        >
          <Alert variant='info'>This is an informational alert.</Alert>
          <Alert variant='success'>Operation completed successfully.</Alert>
          <Alert variant='warning'>Please review before proceeding.</Alert>
          <Alert variant='danger'>An error occurred. Please try again.</Alert>
        </div>
      </div>

      <div className={section}>
        <h2>Closable</h2>
        <div style={{ maxWidth: 480 }}>
          <Alert key={key} variant='info' closable>
            This alert can be dismissed. Click the × button.
          </Alert>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setKey((k) => k + 1)}
          >
            Reset
          </Button>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'variant',
              type: "'info' | 'success' | 'warning' | 'danger'",
              default: "'info'",
              description: 'Color variant',
            },
            {
              name: 'visible',
              type: 'Control<boolean> | boolean',
              default: 'true',
              description: 'Visibility state (controllable)',
            },
            {
              name: 'closable',
              type: 'boolean',
              default: 'false',
              description: 'Show a close button',
            },
            {
              name: 'onClose',
              type: '() => void',
              description: 'Called when the close button is clicked',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Alert content',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Uses <strong>role=&quot;alert&quot;</strong> — announced by screen
              readers immediately
            </li>
            <li>
              Close button has <strong>aria-label=&quot;Close&quot;</strong>
            </li>
            <li>Focus management: close button is keyboard accessible</li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='alert' />
    </>
  );
}

// ─── Avatar ────────────────────────────────────────────────────

function AvatarDemo() {
  return (
    <>
      <h1>Avatar</h1>
      <p className={intro}>Circular image container with fallback support.</p>

      <div className={section}>
        <h2>Sizes</h2>
        <div className={row}>
          <Avatar size='sm' src='https://i.pravatar.cc/64?u=a' alt='Alice' />
          <Avatar size='md' src='https://i.pravatar.cc/80?u=b' alt='Bob' />
          <Avatar size='lg' src='https://i.pravatar.cc/112?u=c' alt='Carol' />
        </div>
      </div>

      <div className={section}>
        <h2>Fallback</h2>
        <div className={row}>
          <Avatar size='md' alt='Dave' />
          <Avatar size='md' fallback='🎨' />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            { name: 'src', type: 'string', description: 'Image URL' },
            {
              name: 'alt',
              type: 'string',
              description: 'Alt text; first letter used as fallback',
            },
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg'",
              default: "'md'",
              description: 'Avatar size',
            },
            {
              name: 'fallback',
              type: 'ReactNode',
              description: 'Custom fallback content',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Uses <strong>&lt;img&gt;</strong> with <strong>alt</strong> text
              when image is available
            </li>
            <li>
              Fallback shows first letter of <strong>alt</strong> or custom
              content
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='avatar' />
    </>
  );
}

// ─── Tag ───────────────────────────────────────────────────────

function TagDemo() {
  const [tags, setTags] = useState(['React', 'TypeScript', 'Linaria']);

  return (
    <>
      <h1>Tag</h1>
      <p className={intro}>
        Interactive labels for categorization and filtering.
      </p>

      <div className={section}>
        <h2>Variants</h2>
        <div className={row}>
          <Tag variant='default'>Default</Tag>
          <Tag variant='primary'>Primary</Tag>
          <Tag variant='success'>Success</Tag>
          <Tag variant='warning'>Warning</Tag>
          <Tag variant='danger'>Danger</Tag>
        </div>
      </div>

      <div className={section}>
        <h2>Closable</h2>
        <div className={row}>
          {tags.map((t) => (
            <Tag
              key={t}
              closable
              onClose={() => setTags((prev) => prev.filter((x) => x !== t))}
            >
              {t}
            </Tag>
          ))}
          {tags.length === 0 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setTags(['React', 'TypeScript', 'Linaria'])}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'variant',
              type: "'default' | 'primary' | 'success' | 'warning' | 'danger'",
              default: "'default'",
              description: 'Color variant',
            },
            {
              name: 'size',
              type: "'sm' | 'md'",
              default: "'md'",
              description: 'Tag size',
            },
            {
              name: 'closable',
              type: 'boolean',
              default: 'false',
              description: 'Show close button',
            },
            {
              name: 'onClose',
              type: '() => void',
              description: 'Called when close button is clicked',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            { name: 'children', type: 'ReactNode', description: 'Tag content' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Close button has <strong>aria-label=&quot;Remove&quot;</strong>
            </li>
            <li>
              Close button is keyboard accessible via <strong>Tab</strong> +{' '}
              <strong>Enter</strong>
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='tag' />
    </>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────

function SkeletonDemo() {
  return (
    <>
      <h1>Skeleton</h1>
      <p className={intro}>Animated placeholder for loading states.</p>

      <div className={section}>
        <h2>Variants</h2>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--haze-space-3)',
            maxWidth: 320,
          }}
        >
          <Skeleton variant='text' width='80%' />
          <Skeleton variant='text' width='60%' />
          <Skeleton variant='rectangular' width={320} height={120} />
          <div className={row}>
            <Skeleton variant='circular' width={40} height={40} />
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--haze-space-1)',
              }}
            >
              <Skeleton variant='text' width='50%' />
              <Skeleton variant='text' width='80%' />
            </div>
          </div>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'variant',
              type: "'text' | 'circular' | 'rectangular'",
              default: "'text'",
              description: 'Shape of the skeleton',
            },
            {
              name: 'width',
              type: 'string | number',
              description: 'Width (px if number)',
            },
            {
              name: 'height',
              type: 'string | number',
              description: 'Height (px if number)',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Purely decorative — use{' '}
              <strong>aria-busy=&quot;true&quot;</strong> on the parent
              container during loading
            </li>
            <li>
              Shimmer animation is CSS-only, respects{' '}
              <strong>prefers-reduced-motion</strong>
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='skeleton' />
    </>
  );
}

// ─── Icon ──────────────────────────────────────────────────────

function IconDemo() {
  return (
    <>
      <h1>Icon</h1>
      <p className={intro}>
        Wrapper for SVG icons with consistent sizing and color inheritance.
        Works with both fill-based and stroke-based SVGs, and integrates
        seamlessly with community icon libraries like Lucide, React Icons, and
        Phosphor.
      </p>

      <div className={section}>
        <h2>Sizes</h2>
        <div className={row}>
          <Icon size='sm'>
            <StrokeSvg />
          </Icon>
          <Icon size='md'>
            <StrokeSvg />
          </Icon>
          <Icon size='lg'>
            <StrokeSvg />
          </Icon>
        </div>
      </div>

      <div className={section}>
        <h2>Fill vs Stroke</h2>
        <p
          style={{
            fontSize: 'var(--haze-text-sm)',
            color: 'var(--haze-color-text-secondary)',
            margin: '0 0 var(--haze-space-3)',
          }}
        >
          Icon auto-detects stroke-based SVGs (those with{' '}
          <code>fill=&quot;none&quot;</code> or <code>stroke</code> attributes)
          and adjusts rendering accordingly. Fill-based SVGs work out of the
          box.
        </p>
        <div className={row}>
          <Flex gap='var(--haze-space-4)' style={{ alignItems: 'center' }}>
            <Flex gap='var(--haze-space-2)' style={{ alignItems: 'center' }}>
              <Icon size='lg'>
                <StrokeSvg />
              </Icon>
              <span
                style={{
                  fontSize: 'var(--haze-text-xs)',
                  color: 'var(--haze-color-text-muted)',
                }}
              >
                Stroke
              </span>
            </Flex>
            <Flex gap='var(--haze-space-2)' style={{ alignItems: 'center' }}>
              <Icon size='lg'>
                <FillSvg />
              </Icon>
              <span
                style={{
                  fontSize: 'var(--haze-text-xs)',
                  color: 'var(--haze-color-text-muted)',
                }}
              >
                Fill
              </span>
            </Flex>
          </Flex>
        </div>
      </div>

      <div className={section}>
        <h2>
          Using the <code>icon</code> Prop
        </h2>
        <p
          style={{
            fontSize: 'var(--haze-text-sm)',
            color: 'var(--haze-color-text-secondary)',
            margin: '0 0 var(--haze-space-3)',
          }}
        >
          Pass a component directly via the <code>icon</code> prop instead of
          wrapping it in children. When using <code>icon</code>, stroke mode is
          enabled by default to work with most community icon libraries.
        </p>
        <div className={row}>
          <Icon icon={StrokeSvg} size='sm' />
          <Icon icon={StrokeSvg} size='md' />
          <Icon icon={StrokeSvg} size='lg' />
        </div>
      </div>

      <div className={section}>
        <h2>Community Icon Libraries</h2>
        <p
          style={{
            fontSize: 'var(--haze-text-sm)',
            color: 'var(--haze-color-text-secondary)',
            margin: '0 0 var(--haze-space-3)',
          }}
        >
          Haze UI Icon is designed as a thin wrapper — it does not bundle any
          icons. Instead, pair it with your preferred icon library:
        </p>

        <h3
          style={{
            fontSize: 'var(--haze-text-sm)',
            fontWeight: 600,
            margin: 'var(--haze-space-4) 0 var(--haze-space-2)',
          }}
        >
          Lucide React
        </h3>
        <pre
          className={codeBlock}
        >{`import { Search, ChevronDown } from 'lucide-react';
import { Icon } from 'haze-ui';

// Using icon prop (recommended)
<Icon icon={Search} size="md" />

// Using children
<Icon size="sm"><Search /></Icon>`}</pre>

        <h3
          style={{
            fontSize: 'var(--haze-text-sm)',
            fontWeight: 600,
            margin: 'var(--haze-space-4) 0 var(--haze-space-2)',
          }}
        >
          React Icons
        </h3>
        <pre
          className={codeBlock}
        >{`import { FiSearch, FiChevronDown } from 'react-icons/fi';
import { Icon } from 'haze-ui';

<Icon size="md"><FiSearch /></Icon>`}</pre>

        <h3
          style={{
            fontSize: 'var(--haze-text-sm)',
            fontWeight: 600,
            margin: 'var(--haze-space-4) 0 var(--haze-space-2)',
          }}
        >
          Phosphor Icons
        </h3>
        <pre
          className={codeBlock}
        >{`import { MagnifyingGlass } from '@phosphor-icons/react';
import { Icon } from 'haze-ui';

<Icon icon={MagnifyingGlass} size="md" />`}</pre>

        <h3
          style={{
            fontSize: 'var(--haze-text-sm)',
            fontWeight: 600,
            margin: 'var(--haze-space-4) 0 var(--haze-space-2)',
          }}
        >
          Inline SVG
        </h3>
        <pre className={codeBlock}>{`import { Icon } from 'haze-ui';

<Icon size="lg">
  <svg viewBox="0 0 24 24">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
  </svg>
</Icon>`}</pre>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'icon',
              type: 'ComponentType<SVGProps<SVGSVGElement>>',
              description:
                'SVG component to render (alternative to children). Stroke mode is auto-enabled.',
            },
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg'",
              default: "'md'",
              description: 'Icon size (16px / 20px / 24px)',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'SVG element (used when icon prop is not provided)',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Has <strong>aria-hidden=&quot;true&quot;</strong> by default —
              decorative only
            </li>
            <li>
              For meaningful icons, add <strong>aria-label</strong> to the
              parent element
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='icon' />
    </>
  );
}

// ─── Image ─────────────────────────────────────────────────────

function ImageDemo() {
  return (
    <>
      <h1>Image</h1>
      <p className={intro}>
        Enhanced image component with fallback and aspect ratio support.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div style={{ maxWidth: 320 }}>
          <Image
            src='https://picsum.photos/640/360'
            alt='Sample landscape'
            aspectRatio='16/9'
          />
        </div>
      </div>

      <div className={section}>
        <h2>Fallback</h2>
        <div style={{ maxWidth: 320 }}>
          <Image
            src='https://invalid-url.example'
            alt='Broken image'
            aspectRatio='16/9'
            fallback='Image failed to load'
          />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            { name: 'src', type: 'string', description: 'Image URL' },
            { name: 'alt', type: 'string', description: 'Alt text' },
            {
              name: 'fallback',
              type: 'ReactNode',
              description: 'Fallback content on error',
            },
            {
              name: 'aspectRatio',
              type: 'string',
              description: 'CSS aspect-ratio value',
            },
            {
              name: 'objectFit',
              type: 'CSSProperties["objectFit"]',
              default: "'cover'",
              description: 'Object-fit behavior',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Uses native <strong>&lt;img&gt;</strong> with required{' '}
              <strong>alt</strong> text
            </li>
            <li>Fallback content is visible to screen readers</li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='image' />
    </>
  );
}

// ─── Flex ──────────────────────────────────────────────────────

function FlexDemo() {
  return (
    <>
      <h1>Flex</h1>
      <p className={intro}>Shorthand layout component for flexbox patterns.</p>

      <div className={section}>
        <h2>Demo</h2>
        <Flex gap='var(--haze-space-3)' align='center'>
          <Badge>Item 1</Badge>
          <Badge variant='success'>Item 2</Badge>
          <Badge variant='info'>Item 3</Badge>
        </Flex>
      </div>

      <div className={section}>
        <h2>Column</h2>
        <Flex direction='column' gap='var(--haze-space-2)'>
          <Badge>Row A</Badge>
          <Badge variant='warning'>Row B</Badge>
        </Flex>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'direction',
              type: "'row' | 'column'",
              default: "'row'",
              description: 'Flex direction',
            },
            {
              name: 'align',
              type: 'CSSProperties["alignItems"]',
              description: 'Align items',
            },
            {
              name: 'justify',
              type: 'CSSProperties["justifyContent"]',
              description: 'Justify content',
            },
            {
              name: 'gap',
              type: 'string | number',
              description: 'Gap between items',
            },
            {
              name: 'wrap',
              type: 'boolean',
              default: 'false',
              description: 'Enable flex-wrap',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Flex children',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Renders as a plain <strong>&lt;div&gt;</strong> — purely
              presentational
            </li>
            <li>
              No semantic meaning; add <strong>role</strong> if needed
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='flex' />
    </>
  );
}

// ─── Breadcrumb ────────────────────────────────────────────────

function BreadcrumbDemo() {
  return (
    <>
      <h1>Breadcrumb</h1>
      <p className={intro}>
        Navigation trail showing the current page location.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <Breadcrumb>
          <BreadcrumbItem href='#'>Home</BreadcrumbItem>
          <BreadcrumbItem href='#'>Components</BreadcrumbItem>
          <BreadcrumbItem>Breadcrumb</BreadcrumbItem>
        </Breadcrumb>
      </div>

      <div className={section}>
        <h2>Custom Separator</h2>
        <Breadcrumb separator='›'>
          <BreadcrumbItem href='#'>Docs</BreadcrumbItem>
          <BreadcrumbItem href='#'>UI</BreadcrumbItem>
          <BreadcrumbItem>Current</BreadcrumbItem>
        </Breadcrumb>
      </div>

      <div className={section}>
        <h2>Breadcrumb Props</h2>
        <PropsTable
          props={[
            {
              name: 'separator',
              type: 'ReactNode',
              default: "'/'",
              description: 'Separator between items',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'BreadcrumbItem elements',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>BreadcrumbItem Props</h2>
        <PropsTable
          props={[
            {
              name: 'href',
              type: 'string',
              description: 'Link URL; omit for current page',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            { name: 'children', type: 'ReactNode', description: 'Item label' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Uses{' '}
              <strong>&lt;nav aria-label=&quot;Breadcrumb&quot;&gt;</strong>{' '}
              with <strong>&lt;ol&gt;</strong>
            </li>
            <li>
              Last item has <strong>aria-current=&quot;page&quot;</strong>
            </li>
            <li>
              Separators have <strong>aria-hidden=&quot;true&quot;</strong>
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='breadcrumb' />
    </>
  );
}

// ─── Disclosure ────────────────────────────────────────────────

function DisclosureDemo() {
  return (
    <>
      <h1>Disclosure</h1>
      <p className={intro}>
        Single collapsible section using native details/summary.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div style={{ maxWidth: 480 }}>
          <Disclosure summary='Click to expand'>
            This is the hidden content that appears when the disclosure is
            opened. It uses the native details/summary elements for built-in
            accessibility.
          </Disclosure>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'open',
              type: 'Control<boolean> | boolean',
              default: 'false',
              description: 'Whether the disclosure is open',
            },
            {
              name: 'summary',
              type: 'ReactNode',
              description: 'Header/trigger text',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Collapsible content',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Uses native <strong>&lt;details&gt;</strong>/
              <strong>&lt;summary&gt;</strong>
            </li>
            <li>
              <strong>Enter</strong>/<strong>Space</strong> toggles open/close
            </li>
            <li>Screen readers announce expanded/collapsed state</li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='disclosure' />
    </>
  );
}

// ─── Menu ──────────────────────────────────────────────────────

function MenuDemo() {
  return (
    <>
      <h1>Menu</h1>
      <p className={intro}>Dropdown menu with keyboard navigation.</p>

      <div className={section}>
        <h2>Demo</h2>
        <div className={row}>
          <Menu trigger={<Button variant='outline'>Open Menu</Button>}>
            <MenuItem onSelect={noop}>Edit</MenuItem>
            <MenuItem onSelect={noop}>Duplicate</MenuItem>
            <MenuDivider />
            <MenuItem onSelect={noop}>Archive</MenuItem>
            <MenuItem disabled>Delete</MenuItem>
          </Menu>
        </div>
      </div>

      <div className={section}>
        <h2>Menu Props</h2>
        <PropsTable
          props={[
            {
              name: 'open',
              type: 'Control<boolean> | boolean',
              default: 'false',
              description: 'Whether the menu is open',
            },
            {
              name: 'trigger',
              type: 'ReactNode',
              description: 'Trigger element',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'MenuItem and MenuDivider elements',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>MenuItem Props</h2>
        <PropsTable
          props={[
            {
              name: 'onSelect',
              type: '() => void',
              description: 'Called when item is selected',
            },
            {
              name: 'disabled',
              type: 'boolean',
              default: 'false',
              description: 'Disable the item',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Item content',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Uses <strong>role=&quot;menu&quot;</strong> and{' '}
              <strong>role=&quot;menuitem&quot;</strong>
            </li>
            <li>Click outside closes the menu</li>
            <li>
              Disabled items have <strong>disabled</strong> attribute
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='menu' />
    </>
  );
}

// ─── NumberInput ───────────────────────────────────────────────

function NumberInputDemo() {
  const [, , valueCtrl] = useControl(undefined, 5);
  const [value] = useControl(valueCtrl);

  return (
    <>
      <h1>NumberInput</h1>
      <p className={intro}>Numeric input with increment/decrement buttons.</p>

      <div className={section}>
        <h2>Demo</h2>
        <div className={row}>
          <NumberInput value={valueCtrl} min={0} max={100} step={1} />
          <span
            style={{
              fontSize: 'var(--haze-text-sm)',
              color: 'var(--haze-color-text-secondary)',
            }}
          >
            Value: {value}
          </span>
        </div>
      </div>

      <div className={section}>
        <h2>Sizes</h2>
        <div className={row}>
          <NumberInput size='sm' min={0} max={10} />
          <NumberInput size='md' min={0} max={10} />
          <NumberInput size='lg' min={0} max={10} />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'value',
              type: 'Control<number> | number',
              description: 'Controlled value or control object',
            },
            { name: 'min', type: 'number', description: 'Minimum value' },
            { name: 'max', type: 'number', description: 'Maximum value' },
            {
              name: 'step',
              type: 'number',
              default: '1',
              description: 'Step increment',
            },
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg'",
              default: "'md'",
              description: 'Input size',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Uses <strong>&lt;input type=&quot;number&quot;&gt;</strong>
            </li>
            <li>
              Stepper buttons have <strong>aria-label</strong>{' '}
              (&quot;Decrease&quot;/&quot;Increase&quot;)
            </li>
            <li>Buttons are disabled at min/max boundaries</li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='numberinput' />
    </>
  );
}

// ─── FileInput ─────────────────────────────────────────────────

function FileInputDemo() {
  return (
    <>
      <h1>FileInput</h1>
      <p className={intro}>Styled file picker with hidden native input.</p>

      <div className={section}>
        <h2>Demo</h2>
        <div className={row}>
          <FileInput accept='image/*' />
          <FileInput accept='.pdf,.doc'>Upload Document</FileInput>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'accept',
              type: 'string',
              description: 'Accepted file types',
            },
            {
              name: 'multiple',
              type: 'boolean',
              default: 'false',
              description: 'Allow multiple files',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: 'children',
              type: 'ReactNode',
              default: "'Choose file'",
              description: 'Custom trigger text',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Uses a <strong>&lt;label&gt;</strong> wrapping a visually hidden{' '}
              <strong>&lt;input type=&quot;file&quot;&gt;</strong>
            </li>
            <li>
              Keyboard accessible — <strong>Tab</strong> focuses,{' '}
              <strong>Enter</strong>/<strong>Space</strong> opens file dialog
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='fileinput' />
    </>
  );
}

// ─── Toast ─────────────────────────────────────────────────────

function ToastDemoInner() {
  const toast = useToast();

  return (
    <>
      <h1>Toast</h1>
      <p className={intro}>
        Temporary notification messages via useToast() hook.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div className={row}>
          <Button variant='outline' onClick={() => toast('Info toast message')}>
            Info
          </Button>
          <Button
            variant='outline'
            onClick={() => toast('Success!', { variant: 'success' })}
          >
            Success
          </Button>
          <Button
            variant='outline'
            onClick={() => toast('Warning toast', { variant: 'warning' })}
          >
            Warning
          </Button>
          <Button
            variant='outline'
            onClick={() => toast('Error occurred', { variant: 'danger' })}
          >
            Danger
          </Button>
        </div>
      </div>

      <div className={section}>
        <h2>useToast API</h2>
        <PropsTable
          props={[
            {
              name: 'content',
              type: 'ReactNode',
              description: 'Toast message (first argument)',
            },
            {
              name: 'options.variant',
              type: "'info' | 'success' | 'warning' | 'danger'",
              default: "'info'",
              description: 'Color variant',
            },
            {
              name: 'options.duration',
              type: 'number',
              default: '3000',
              description: 'Auto-dismiss time in ms',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Each toast has <strong>role=&quot;alert&quot;</strong>
            </li>
            <li>
              Close button has <strong>aria-label=&quot;Close&quot;</strong>
            </li>
            <li>Toasts auto-dismiss after the configured duration</li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='toast' />
    </>
  );
}

function ToastDemo() {
  return (
    <ToastContainer>
      <ToastDemoInner />
    </ToastContainer>
  );
}

// ─── List ──────────────────────────────────────────────────────

function ListDemo() {
  return (
    <>
      <h1>List</h1>
      <p className={intro}>
        Styled list component with ordered, unordered, and plain variants.
      </p>

      <div className={section}>
        <h2>Unordered</h2>
        <List variant='unordered'>
          <ListItem>First item</ListItem>
          <ListItem>Second item</ListItem>
          <ListItem>Third item</ListItem>
        </List>
      </div>

      <div className={section}>
        <h2>Ordered</h2>
        <List variant='ordered'>
          <ListItem>Step one</ListItem>
          <ListItem>Step two</ListItem>
          <ListItem>Step three</ListItem>
        </List>
      </div>

      <div className={section}>
        <h2>List Props</h2>
        <PropsTable
          props={[
            {
              name: 'variant',
              type: "'unordered' | 'ordered' | 'none'",
              default: "'unordered'",
              description: 'List style',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'ListItem elements',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Uses semantic <strong>&lt;ul&gt;</strong> or{' '}
              <strong>&lt;ol&gt;</strong> elements
            </li>
            <li>Screen readers announce list item count</li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='list' />
    </>
  );
}

// ─── Combobox ──────────────────────────────────────────────────

function ComboboxDemo() {
  const fruits = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
    { value: 'grape', label: 'Grape' },
    { value: 'mango', label: 'Mango' },
    { value: 'orange', label: 'Orange' },
  ];

  return (
    <>
      <h1>Combobox</h1>
      <p className={intro}>
        Searchable dropdown combining text input with a filterable list.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div className={fieldRow}>
          <Combobox options={fruits} placeholder='Search fruits...' />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'value',
              type: 'Control<string> | string',
              description: 'Controlled value or control object',
            },
            {
              name: 'open',
              type: 'Control<boolean> | boolean',
              description: 'Dropdown open state (controllable)',
            },
            {
              name: 'options',
              type: '{value: string; label: string}[]',
              description: 'List of options',
            },
            {
              name: 'placeholder',
              type: 'string',
              description: 'Input placeholder text',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Uses <strong>role=&quot;combobox&quot;</strong> with{' '}
              <strong>aria-expanded</strong> and{' '}
              <strong>aria-autocomplete=&quot;list&quot;</strong>
            </li>
            <li>
              Options use <strong>role=&quot;listbox&quot;</strong> and{' '}
              <strong>role=&quot;option&quot;</strong>
            </li>
            <li>
              <strong>Arrow keys</strong> navigate options,{' '}
              <strong>Enter</strong> selects, <strong>Escape</strong> closes
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='combobox' />
    </>
  );
}

// ─── Table ─────────────────────────────────────────────────────

function TableDemo() {
  return (
    <>
      <h1>Table</h1>
      <p className={intro}>
        Semantic table components with striped and bordered variants.
      </p>

      <div className={section}>
        <h2>Default</h2>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell as='th'>Name</TableCell>
              <TableCell as='th'>Role</TableCell>
              <TableCell as='th'>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Alice</TableCell>
              <TableCell>Engineer</TableCell>
              <TableCell>Active</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Bob</TableCell>
              <TableCell>Designer</TableCell>
              <TableCell>Active</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Carol</TableCell>
              <TableCell>Manager</TableCell>
              <TableCell>Away</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className={section}>
        <h2>Striped + Bordered</h2>
        <Table striped bordered>
          <TableHead>
            <TableRow>
              <TableCell as='th'>Product</TableCell>
              <TableCell as='th'>Price</TableCell>
              <TableCell as='th'>Stock</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Widget A</TableCell>
              <TableCell>$10</TableCell>
              <TableCell>150</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Widget B</TableCell>
              <TableCell>$25</TableCell>
              <TableCell>80</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Widget C</TableCell>
              <TableCell>$15</TableCell>
              <TableCell>200</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className={section}>
        <h2>Table Props</h2>
        <PropsTable
          props={[
            {
              name: 'striped',
              type: 'boolean',
              default: 'false',
              description: 'Alternate row backgrounds',
            },
            {
              name: 'bordered',
              type: 'boolean',
              default: 'false',
              description: 'Add cell borders',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'TableHead and TableBody elements',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Uses semantic <strong>&lt;table&gt;</strong>,{' '}
              <strong>&lt;thead&gt;</strong>, <strong>&lt;tbody&gt;</strong>,{' '}
              <strong>&lt;th&gt;</strong>, <strong>&lt;td&gt;</strong>
            </li>
            <li>Screen readers announce row/column context automatically</li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='table' />
    </>
  );
}

// ─── Carousel ──────────────────────────────────────────────────

function CarouselDemo() {
  return (
    <>
      <h1>Carousel</h1>
      <p className={intro}>
        Slide-based content viewer with navigation and indicators.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div style={{ maxWidth: 480 }}>
          <Carousel>
            <CarouselSlide>
              <div
                style={{
                  height: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--haze-color-bg-subtle)',
                  borderRadius: 'var(--haze-radius-md)',
                }}
              >
                Slide 1
              </div>
            </CarouselSlide>
            <CarouselSlide>
              <div
                style={{
                  height: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--haze-color-bg-muted)',
                  borderRadius: 'var(--haze-radius-md)',
                }}
              >
                Slide 2
              </div>
            </CarouselSlide>
            <CarouselSlide>
              <div
                style={{
                  height: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--haze-color-primary-subtle)',
                  borderRadius: 'var(--haze-radius-md)',
                }}
              >
                Slide 3
              </div>
            </CarouselSlide>
          </Carousel>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'value',
              type: 'Control<number> | number',
              description: 'Active slide index',
            },
            {
              name: 'autoPlay',
              type: 'boolean',
              default: 'false',
              description: 'Auto-advance slides',
            },
            {
              name: 'interval',
              type: 'number',
              default: '5000',
              description: 'Auto-play interval in ms',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'CarouselSlide elements',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Uses <strong>role=&quot;region&quot;</strong> with{' '}
              <strong>aria-roledescription=&quot;carousel&quot;</strong>
            </li>
            <li>
              Slides have <strong>role=&quot;group&quot;</strong> with{' '}
              <strong>aria-roledescription=&quot;slide&quot;</strong>
            </li>
            <li>
              Navigation buttons have <strong>aria-label</strong>
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='carousel' />
    </>
  );
}

// ─── Datepicker ────────────────────────────────────────────────

function DatepickerDemo() {
  const [, , valueCtrl] = useControl(undefined, '');
  const [value] = useControl(valueCtrl);

  return (
    <>
      <h1>Datepicker</h1>
      <p className={intro}>Date selection with a calendar dropdown panel.</p>

      <div className={section}>
        <h2>Demo</h2>
        <div className={fieldRow}>
          <Datepicker value={valueCtrl} placeholder='Pick a date' />
        </div>
        {value && (
          <p
            style={{
              fontSize: 'var(--haze-text-sm)',
              color: 'var(--haze-color-text-secondary)',
            }}
          >
            Selected: {value}
          </p>
        )}
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'value',
              type: 'Control<string> | string',
              description: 'Selected date (ISO format YYYY-MM-DD)',
            },
            {
              name: 'open',
              type: 'Control<boolean> | boolean',
              description: 'Dropdown open state (controllable)',
            },
            {
              name: 'min',
              type: 'string',
              description: 'Minimum selectable date',
            },
            {
              name: 'max',
              type: 'string',
              description: 'Maximum selectable date',
            },
            {
              name: 'placeholder',
              type: 'string',
              default: "'Select date'",
              description: 'Input placeholder',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Input has <strong>aria-haspopup=&quot;dialog&quot;</strong> and{' '}
              <strong>aria-expanded</strong>
            </li>
            <li>
              Calendar grid uses <strong>role=&quot;grid&quot;</strong> with{' '}
              <strong>aria-label</strong>
            </li>
            <li>
              Navigation buttons have <strong>aria-label</strong>
            </li>
            <li>Click outside closes the calendar</li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='datepicker' />
    </>
  );
}

// ─── Tree ───────────────────────────────────────────────────────

function TreeDemo() {
  const treeData: TreeNodeData[] = [
    {
      key: 'root',
      title: 'Root',
      children: [
        {
          key: 'parent-1',
          title: 'Parent 1',
          children: [
            { key: 'child-1-1', title: 'Child 1-1' },
            { key: 'child-1-2', title: 'Child 1-2' },
          ],
        },
        {
          key: 'parent-2',
          title: 'Parent 2',
          children: [
            { key: 'child-2-1', title: 'Child 2-1' },
            { key: 'child-2-2', title: 'Child 2-2' },
          ],
        },
      ],
    },
  ];

  return (
    <>
      <h1>Tree</h1>
      <p className={intro}>
        Hierarchical data display with expandable nodes, selection, and checkbox
        support.
      </p>

      <div className={section}>
        <h2>Basic</h2>
        <div style={{ maxWidth: 320 }}>
          <Tree treeData={treeData} />
        </div>
      </div>

      <div className={section}>
        <h2>Checkable</h2>
        <div style={{ maxWidth: 320 }}>
          <Tree treeData={treeData} checkable />
        </div>
      </div>

      <div className={section}>
        <h2>With Icons and Lines</h2>
        <div style={{ maxWidth: 320 }}>
          <Tree treeData={treeData} showIcon showLine />
        </div>
      </div>

      <div className={section}>
        <h2>Tree Props</h2>
        <PropsTable
          props={[
            {
              name: 'treeData',
              type: 'TreeNodeData[]',
              description: 'Array of tree node data',
            },
            {
              name: 'checkable',
              type: 'boolean',
              default: 'false',
              description: 'Show checkbox before each node',
            },
            {
              name: 'checkStrictly',
              type: 'boolean',
              default: 'false',
              description: 'Disable parent-child cascade selection',
            },
            {
              name: 'selectable',
              type: 'boolean',
              default: 'true',
              description: 'Allow node selection',
            },
            {
              name: 'multiple',
              type: 'boolean',
              default: 'false',
              description: 'Allow multiple selection',
            },
            {
              name: 'disabled',
              type: 'boolean',
              default: 'false',
              description: 'Disable the entire tree',
            },
            {
              name: 'blockNode',
              type: 'boolean',
              default: 'false',
              description: 'Node content takes full width',
            },
            {
              name: 'showLine',
              type: 'boolean',
              default: 'false',
              description: 'Show connecting lines between nodes',
            },
            {
              name: 'showIcon',
              type: 'boolean',
              default: 'false',
              description: 'Show icon for each node',
            },
            {
              name: 'expandedKeys',
              type: 'Control<string[]> | string[]',
              description: 'Controlled expanded node keys',
            },
            {
              name: 'selectedKeys',
              type: 'Control<string[]> | string[]',
              description: 'Controlled selected node keys',
            },
            {
              name: 'checkedKeys',
              type: 'Control<string[]> | string[]',
              description: 'Controlled checked node keys',
            },
            {
              name: 'titleRender',
              type: '(node: TreeNodeData) => ReactNode',
              description: 'Custom title renderer',
            },
            {
              name: 'iconRender',
              type: '(node: TreeNodeData) => ReactNode',
              description: 'Custom icon renderer',
            },
            {
              name: 'switcherIcon',
              type: 'ReactNode',
              description: 'Custom expand/collapse icon',
            },
            {
              name: 'onExpand',
              type: '(expandedKeys: string[], info: {...}) => void',
              description: 'Callback when node is expanded/collapsed',
            },
            {
              name: 'onSelect',
              type: '(selectedKeys: string[], info: {...}) => void',
              description: 'Callback when node is selected',
            },
            {
              name: 'onCheck',
              type: '(checkedKeys: string[] | {...}, info: {...}) => void',
              description: 'Callback when node is checked',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>TreeNodeData</h2>
        <PropsTable
          props={[
            {
              name: 'key',
              type: 'string',
              description: 'Unique identifier for the node',
            },
            {
              name: 'title',
              type: 'ReactNode',
              description: 'Display title of the node',
            },
            {
              name: 'children',
              type: 'TreeNodeData[]',
              description: 'Child nodes',
            },
            {
              name: 'disabled',
              type: 'boolean',
              default: 'false',
              description: 'Disable the node',
            },
            {
              name: 'selectable',
              type: 'boolean',
              default: 'true',
              description: 'Allow node selection',
            },
            {
              name: 'disableCheckbox',
              type: 'boolean',
              default: 'false',
              description: 'Disable the checkbox for this node',
            },
            {
              name: 'icon',
              type: 'ReactNode',
              description: 'Custom icon for this node',
            },
            {
              name: 'isLeaf',
              type: 'boolean',
              description: 'Mark as leaf node (for lazy loading)',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Uses nested <strong>&lt;ul&gt;</strong>/
              <strong>&lt;li&gt;</strong> with{' '}
              <strong>role=&quot;tree&quot;</strong>/
              <strong>role=&quot;treeitem&quot;</strong>
            </li>
            <li>
              Expanded/collapsed state via <strong>aria-expanded</strong>
            </li>
            <li>
              Selected state via <strong>aria-selected</strong>
            </li>
            <li>
              Checked state via <strong>aria-checked</strong>
            </li>
            <li>
              <strong>Arrow keys</strong> navigate between nodes,{' '}
              <strong>Enter</strong>/<strong>Space</strong> activates
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='tree' />
    </>
  );
}

// ─── Divider ────────────────────────────────────────────────────

function DividerDemo() {
  return (
    <>
      <h1>Divider</h1>
      <p className={intro}>Visual separator between content sections.</p>

      <div className={section}>
        <h2>Horizontal</h2>
        <div style={{ maxWidth: 480 }}>
          <p style={{ margin: 0 }}>Content above</p>
          <Divider />
          <p style={{ margin: 0 }}>Content below</p>
        </div>
      </div>

      <div className={section}>
        <h2>Vertical</h2>
        <div className={row}>
          <span>Left</span>
          <Divider orientation='vertical' />
          <span>Right</span>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'orientation',
              type: "'horizontal' | 'vertical'",
              default: "'horizontal'",
              description: 'Direction of the divider',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Uses <strong>role=&quot;separator&quot;</strong>
            </li>
            <li>
              Vertical dividers have <strong>aria-orientation=&quot;vertical&quot;</strong>
            </li>
            <li>
              Horizontal renders as native <strong>&lt;hr&gt;</strong>
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='divider' />
    </>
  );
}

// ─── Spinner ───────────────────────────────────────────────────

function SpinnerDemo() {
  return (
    <>
      <h1>Spinner</h1>
      <p className={intro}>Animated loading indicator for async operations.</p>

      <div className={section}>
        <h2>Sizes</h2>
        <div className={row}>
          <Spinner size='sm' />
          <Spinner size='md' />
          <Spinner size='lg' />
        </div>
      </div>

      <div className={section}>
        <h2>With Text</h2>
        <div className={row}>
          <Spinner size='sm' />
          <span style={{ fontSize: 'var(--haze-text-sm)', color: 'var(--haze-color-text-secondary)' }}>Loading...</span>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg'",
              default: "'md'",
              description: 'Spinner size (16px / 24px / 32px)',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Uses <strong>role=&quot;status&quot;</strong> with{' '}
              <strong>aria-label=&quot;Loading&quot;</strong>
            </li>
            <li>
              Screen readers announce the loading state
            </li>
            <li>
              Animation respects <strong>prefers-reduced-motion</strong>
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='spinner' />
    </>
  );
}

// ─── Empty ─────────────────────────────────────────────────────

function EmptyDemo() {
  return (
    <>
      <h1>Empty</h1>
      <p className={intro}>Placeholder state when no data is available.</p>

      <div className={section}>
        <h2>Default</h2>
        <Empty />
      </div>

      <div className={section}>
        <h2>Custom Description</h2>
        <Empty description='No search results found' />
      </div>

      <div className={section}>
        <h2>With Action</h2>
        <Empty description='No items yet'>
          <Button size='sm'>Create Item</Button>
        </Empty>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'description',
              type: 'string',
              default: "'No data'",
              description: 'Text description below the image',
            },
            {
              name: 'image',
              type: 'ReactNode',
              description: 'Custom image/illustration (replaces default)',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Action content (e.g. a button)',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Purely presentational — wrap with a container that has{' '}
              <strong>aria-label</strong> if needed
            </li>
            <li>
              Default image is decorative SVG
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='empty' />
    </>
  );
}

// ─── Progress ──────────────────────────────────────────────────

function ProgressDemo() {
  return (
    <>
      <h1>Progress</h1>
      <p className={intro}>Visual indicator of completion percentage.</p>

      <div className={section}>
        <h2>Bar Variants</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--haze-space-3)', maxWidth: 400 }}>
          <Progress value={25} />
          <Progress value={50} color='success' />
          <Progress value={75} color='warning' />
          <Progress value={90} color='danger' />
        </div>
      </div>

      <div className={section}>
        <h2>Bar Sizes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--haze-space-3)', maxWidth: 400 }}>
          <Progress value={60} size='sm' />
          <Progress value={60} size='md' />
          <Progress value={60} size='lg' />
        </div>
      </div>

      <div className={section}>
        <h2>Circle Variant</h2>
        <div className={row}>
          <Progress variant='circle' value={30} size='sm' />
          <Progress variant='circle' value={60} />
          <Progress variant='circle' value={90} size='lg' color='success' />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'value',
              type: 'number',
              default: '0',
              description: 'Progress percentage (0-100)',
            },
            {
              name: 'variant',
              type: "'bar' | 'circle'",
              default: "'bar'",
              description: 'Visual style',
            },
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg'",
              default: "'md'",
              description: 'Size of the progress indicator',
            },
            {
              name: 'color',
              type: "'primary' | 'success' | 'warning' | 'danger'",
              default: "'primary'",
              description: 'Color variant',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Uses <strong>role=&quot;progressbar&quot;</strong> with{' '}
              <strong>aria-valuemin</strong>, <strong>aria-valuemax</strong>,{' '}
              <strong>aria-valuenow</strong>
            </li>
            <li>
              Screen readers announce current progress percentage
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='progress' />
    </>
  );
}

// ─── Pagination ────────────────────────────────────────────────

function PaginationDemo() {
  const [, , pageCtrl] = useControl(undefined, 1);

  return (
    <>
      <h1>Pagination</h1>
      <p className={intro}>Navigate through paginated content.</p>

      <div className={section}>
        <h2>Demo</h2>
        <Pagination page={pageCtrl} total={100} pageSize={10} />
      </div>

      <div className={section}>
        <h2>Sizes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--haze-space-3)' }}>
          <Pagination total={50} pageSize={10} size='sm' />
          <Pagination total={50} pageSize={10} size='md' />
          <Pagination total={50} pageSize={10} size='lg' />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'page',
              type: 'Control<number> | number',
              description: 'Current page number (controlled)',
            },
            {
              name: 'total',
              type: 'number',
              description: 'Total number of items',
            },
            {
              name: 'pageSize',
              type: 'number',
              default: '10',
              description: 'Items per page',
            },
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg'",
              default: "'md'",
              description: 'Size of pagination buttons',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: '...rest',
              type: 'NavHTMLAttributes',
              description: 'All native nav attributes',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
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
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='pagination' />
    </>
  );
}

// ─── Grid ──────────────────────────────────────────────────────

function GridDemo() {
  return (
    <>
      <h1>Grid</h1>
      <p className={intro}>CSS Grid layout with configurable columns and gap.</p>

      <div className={section}>
        <h2>Basic</h2>
        <Grid columns={3} gap={3}>
          <GridItem span={1}>
            <div style={{ background: 'var(--haze-color-bg-subtle)', padding: 'var(--haze-space-4)', borderRadius: 'var(--haze-radius-md)', textAlign: 'center' }}>1</div>
          </GridItem>
          <GridItem span={1}>
            <div style={{ background: 'var(--haze-color-bg-subtle)', padding: 'var(--haze-space-4)', borderRadius: 'var(--haze-radius-md)', textAlign: 'center' }}>2</div>
          </GridItem>
          <GridItem span={1}>
            <div style={{ background: 'var(--haze-color-bg-subtle)', padding: 'var(--haze-space-4)', borderRadius: 'var(--haze-radius-md)', textAlign: 'center' }}>3</div>
          </GridItem>
        </Grid>
      </div>

      <div className={section}>
        <h2>Spanning Columns</h2>
        <Grid columns={4} gap={3}>
          <GridItem span={2}>
            <div style={{ background: 'var(--haze-color-primary-subtle)', padding: 'var(--haze-space-4)', borderRadius: 'var(--haze-radius-md)', textAlign: 'center' }}>span 2</div>
          </GridItem>
          <GridItem span={1}>
            <div style={{ background: 'var(--haze-color-bg-subtle)', padding: 'var(--haze-space-4)', borderRadius: 'var(--haze-radius-md)', textAlign: 'center' }}>1</div>
          </GridItem>
          <GridItem span={1}>
            <div style={{ background: 'var(--haze-color-bg-subtle)', padding: 'var(--haze-space-4)', borderRadius: 'var(--haze-radius-md)', textAlign: 'center' }}>1</div>
          </GridItem>
          <GridItem span={1} start={1}>
            <div style={{ background: 'var(--haze-color-bg-muted)', padding: 'var(--haze-space-4)', borderRadius: 'var(--haze-radius-md)', textAlign: 'center' }}>start 1</div>
          </GridItem>
        </Grid>
      </div>

      <div className={section}>
        <h2>Grid Props</h2>
        <PropsTable
          props={[
            {
              name: 'columns',
              type: 'number',
              default: '12',
              description: 'Number of grid columns',
            },
            {
              name: 'gap',
              type: 'number',
              default: '4',
              description: 'Gap token index (--haze-space-N)',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'GridItem elements',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>GridItem Props</h2>
        <PropsTable
          props={[
            {
              name: 'span',
              type: 'number',
              default: '1',
              description: 'Number of columns to span',
            },
            {
              name: 'start',
              type: 'number',
              description: 'Grid column start position',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Grid item content',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Purely presentational — uses plain <strong>&lt;div&gt;</strong> elements
            </li>
            <li>
              No semantic meaning; add <strong>role</strong> if the grid conveys structure
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='grid' />
    </>
  );
}

// ─── Drawer ────────────────────────────────────────────────────

function DrawerDemo() {
  const [, , openCtrl] = useControl(undefined, false);
  const [, setOpen] = useControl(openCtrl);

  return (
    <>
      <h1>Drawer</h1>
      <p className={intro}>Slide-out panel anchored to a screen edge.</p>

      <div className={section}>
        <h2>Demo</h2>
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
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'open',
              type: 'Control<boolean> | boolean',
              default: 'false',
              description: 'Whether the drawer is open',
            },
            {
              name: 'placement',
              type: "'left' | 'right' | 'top' | 'bottom'",
              default: "'right'",
              description: 'Edge to anchor the drawer',
            },
            {
              name: 'onClose',
              type: '() => void',
              description: 'Called when the drawer is closed',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Drawer content',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
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
        </A11yNote>
      </div>

      <CssVarsSection component='drawer' />
    </>
  );
}

// ─── Stepper ───────────────────────────────────────────────────

function StepperDemo() {
  const [, , activeCtrl] = useControl(undefined, 1);
  const [active] = useControl(activeCtrl);

  return (
    <>
      <h1>Stepper</h1>
      <p className={intro}>Step-by-step progress indicator for multi-step flows.</p>

      <div className={section}>
        <h2>Demo</h2>
        <Stepper activeStep={activeCtrl}>
          <Step title='Account' description='Create account' />
          <Step title='Profile' description='Add details' />
          <Step title='Confirm' description='Review & submit' />
        </Stepper>
        <div className={row} style={{ marginTop: 'var(--haze-space-4)' }}>
          <Button size='sm' variant='outline' onClick={() => activeCtrl.set(Math.max(0, active - 1))} disabled={active <= 0}>
            Back
          </Button>
          <Button size='sm' onClick={() => activeCtrl.set(Math.min(2, active + 1))} disabled={active >= 2}>
            Next
          </Button>
        </div>
      </div>

      <div className={section}>
        <h2>Stepper Props</h2>
        <PropsTable
          props={[
            {
              name: 'activeStep',
              type: 'Control<number> | number',
              default: '0',
              description: 'Index of the currently active step',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Step elements',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Step Props</h2>
        <PropsTable
          props={[
            {
              name: 'title',
              type: 'string',
              description: 'Step label text',
            },
            {
              name: 'description',
              type: 'string',
              description: 'Optional description below the title',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Container uses <strong>role=&quot;list&quot;</strong>
            </li>
            <li>
              Each step uses <strong>role=&quot;listitem&quot;</strong>
            </li>
            <li>
              Visual state (active/completed/pending) is conveyed through color and icon
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='stepper' />
    </>
  );
}

// ─── ChatMessage ──────────────────────────────────────────────

function ChatMessageDemo() {
  return (
    <>
      <h1>ChatMessage</h1>
      <p className={intro}>
        Chat bubble component with role-based styling for user, assistant, and
        system messages.
      </p>

      <div className={section}>
        <h2>Roles</h2>
        <ChatMessage role='user' name='You' timestamp='10:00 AM'>
          Can you explain how React hooks work?
        </ChatMessage>
        <ChatMessage role='assistant' name='Assistant' timestamp='10:01 AM'>
          Sure! Hooks let you use state and other React features in function
          components. The most common ones are useState and useEffect.
        </ChatMessage>
        <ChatMessage role='system'>Conversation started</ChatMessage>
      </div>

      <div className={section}>
        <h2>With Status</h2>
        <ChatMessage role='user' name='You' status='sent'>
          Message sent successfully.
        </ChatMessage>
        <ChatMessage role='user' name='You' status='error'>
          This message failed to send.
        </ChatMessage>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'role',
              type: "'user' | 'assistant' | 'system'",
              description: 'Message role determining layout and style',
            },
            {
              name: 'avatar',
              type: 'ReactNode',
              description: 'Custom avatar content',
            },
            {
              name: 'name',
              type: 'ReactNode',
              description: 'Display name shown in the header',
            },
            {
              name: 'timestamp',
              type: 'ReactNode',
              description: 'Timestamp shown in the header',
            },
            {
              name: 'status',
              type: "'sending' | 'sent' | 'error'",
              description: 'Delivery status indicator',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Message content',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              User messages are visually reversed with{' '}
              <strong>flex-direction: row-reverse</strong>
            </li>
            <li>System messages are centered with muted styling</li>
            <li>Status text provides visual feedback for message delivery</li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='chatmessage' />
    </>
  );
}

// ─── ChatContainer ────────────────────────────────────────────

function ChatContainerDemo() {
  return (
    <>
      <h1>ChatContainer</h1>
      <p className={intro}>
        Auto-scrolling message container that follows new messages as they
        arrive.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div
          style={{
            maxHeight: 200,
            border: '1px solid var(--haze-color-border)',
            borderRadius: 'var(--haze-radius-md)',
          }}
        >
          <ChatContainer>
            <ChatMessage role='assistant'>Welcome! How can I help?</ChatMessage>
            <ChatMessage role='user'>
              Tell me about this component.
            </ChatMessage>
            <ChatMessage role='assistant'>
              ChatContainer automatically scrolls to the bottom when new messages
              are added.
            </ChatMessage>
          </ChatContainer>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'autoScroll',
              type: 'boolean',
              default: 'true',
              description: 'Automatically scroll to bottom on new content',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Chat messages',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Uses <strong>overflow-y: auto</strong> for scrollable content
            </li>
            <li>
              Auto-scroll uses <strong>MutationObserver</strong> for reliable
              detection
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='chatcontainer' />
    </>
  );
}

// ─── ChatInput ────────────────────────────────────────────────

function ChatInputDemo() {
  const [messages, setMessages] = useState<string[]>([]);

  return (
    <>
      <h1>ChatInput</h1>
      <p className={intro}>
        Auto-resizing textarea with Enter-to-send and Shift+Enter for newlines.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div style={{ maxWidth: 480 }}>
          <ChatInput
            onSend={(msg) => setMessages((prev) => [...prev, msg])}
            placeholder='Type a message...'
          />
          {messages.length > 0 && (
            <div
              style={{
                marginTop: 'var(--haze-space-3)',
                fontSize: 'var(--haze-text-sm)',
                color: 'var(--haze-color-text-secondary)',
              }}
            >
              Sent: {messages.join(', ')}
            </div>
          )}
        </div>
      </div>

      <div className={section}>
        <h2>Disabled</h2>
        <div style={{ maxWidth: 480 }}>
          <ChatInput disabled placeholder='Disabled input' />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'value',
              type: 'Control<string> | string',
              description: 'Input value (controllable)',
            },
            {
              name: 'onSend',
              type: '(message: string) => void',
              description: 'Called when the user sends a message',
            },
            {
              name: 'placeholder',
              type: 'string',
              default: "'Type a message...'",
              description: 'Input placeholder text',
            },
            {
              name: 'disabled',
              type: 'boolean',
              default: 'false',
              description: 'Disable the input',
            },
            {
              name: 'maxLength',
              type: 'number',
              description: 'Maximum character length',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Send button has <strong>aria-label=&quot;Send&quot;</strong>
            </li>
            <li>
              <strong>Enter</strong> sends, <strong>Shift+Enter</strong> inserts
              newline
            </li>
            <li>
              Focus ring appears on <strong>:focus-within</strong>
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='chatinput' />
    </>
  );
}

// ─── StreamingText ────────────────────────────────────────────

function StreamingTextDemo() {
  const [key, setKey] = useState(0);

  return (
    <>
      <h1>StreamingText</h1>
      <p className={intro}>
        Typewriter effect that reveals text character by character with an
        optional blinking cursor.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <StreamingText
          key={key}
          text='Hello! This text appears one character at a time, simulating a streaming response from an AI assistant.'
          speed={25}
        />
        <div className={row} style={{ marginTop: 'var(--haze-space-3)' }}>
          <Button size='sm' variant='outline' onClick={() => setKey((k) => k + 1)}>
            Replay
          </Button>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'text',
              type: 'string',
              description: 'Full text to stream',
            },
            {
              name: 'speed',
              type: 'number',
              default: '20',
              description: 'Milliseconds between characters',
            },
            {
              name: 'onComplete',
              type: '() => void',
              description: 'Called when streaming finishes',
            },
            {
              name: 'showCursor',
              type: 'boolean',
              default: 'true',
              description: 'Show blinking cursor during streaming',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Cursor animation uses <strong>animation: blink</strong> with
              step-end timing
            </li>
            <li>
              Respects <strong>prefers-reduced-motion</strong> via CSS
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='streamingtext' />
    </>
  );
}

// ─── MarkdownRenderer ─────────────────────────────────────────

function MarkdownRendererDemo() {
  const md = `## Hello World

This is **bold** and *italic* text.

- Item one
- Item two
- Item three

\`\`\`js
console.log("Hello from code block");
\`\`\`

> This is a blockquote.`;

  return (
    <>
      <h1>MarkdownRenderer</h1>
      <p className={intro}>
        Renders markdown content to styled HTML with headings, lists, code
        blocks, and more.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div
          style={{
            maxWidth: 480,
            border: '1px solid var(--haze-color-border)',
            borderRadius: 'var(--haze-radius-md)',
            padding: 'var(--haze-space-4)',
          }}
        >
          <MarkdownRenderer content={md} />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'content',
              type: 'string',
              description: 'Markdown source string',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Renders semantic HTML: <strong>&lt;h1&gt;</strong>-<strong>&lt;h6&gt;</strong>,{' '}
              <strong>&lt;ul&gt;</strong>, <strong>&lt;ol&gt;</strong>,{' '}
              <strong>&lt;blockquote&gt;</strong>
            </li>
            <li>
              Links open in new tab with <strong>rel=&quot;noopener&quot;</strong>
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='markdownrenderer' />
    </>
  );
}

// ─── ToolCallCard ─────────────────────────────────────────────

function ToolCallCardDemo() {
  return (
    <>
      <h1>ToolCallCard</h1>
      <p className={intro}>
        Displays tool/function call details with input, output, and status
        indicator.
      </p>

      <div className={section}>
        <h2>Statuses</h2>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--haze-space-3)',
            maxWidth: 400,
          }}
        >
          <ToolCallCard name='search_docs' status='pending' />
          <ToolCallCard name='fetch_data' input='url: /api/users' status='running' />
          <ToolCallCard
            name='calculate'
            input='expression: 2 + 2'
            output='4'
            status='done'
          />
          <ToolCallCard name='send_email' input='to: user@example.com' status='error' />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'name',
              type: 'string',
              description: 'Tool or function name',
            },
            {
              name: 'input',
              type: 'ReactNode',
              description: 'Input passed to the tool',
            },
            {
              name: 'output',
              type: 'ReactNode',
              description: 'Output returned by the tool',
            },
            {
              name: 'status',
              type: "'pending' | 'running' | 'done' | 'error'",
              default: "'pending'",
              description: 'Execution status',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Status is indicated by a colored dot and text label</li>
            <li>Uses monospace font for input/output content</li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='toolcallcard' />
    </>
  );
}

// ─── ThinkingIndicator ────────────────────────────────────────

function ThinkingIndicatorDemo() {
  return (
    <>
      <h1>ThinkingIndicator</h1>
      <p className={intro}>
        Animated bouncing dots with customizable text to indicate AI is
        processing.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--haze-space-3)',
          }}
        >
          <ThinkingIndicator />
          <ThinkingIndicator text='Processing' />
          <ThinkingIndicator text='Generating' />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'text',
              type: 'string',
              default: "'Thinking'",
              description: 'Label text shown before the dots',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Purely decorative animation; consider{' '}
              <strong>aria-live=&quot;polite&quot;</strong> on a parent for screen
              readers
            </li>
            <li>
              Dot animation respects <strong>prefers-reduced-motion</strong>
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='thinkingindicator' />
    </>
  );
}

// ─── StepTimeline ─────────────────────────────────────────────

function StepTimelineDemo() {
  return (
    <>
      <h1>StepTimeline</h1>
      <p className={intro}>
        Vertical timeline showing steps with status markers (pending, active,
        done, error).
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div style={{ maxWidth: 360 }}>
          <StepTimeline>
            <StepTimelineItem label='Connected' description='API linked' status='done' />
            <StepTimelineItem label='Processing' description='Analyzing data...' status='active' />
            <StepTimelineItem label='Review' status='pending' />
            <StepTimelineItem label='Deploy' status='pending' />
          </StepTimeline>
        </div>
      </div>

      <div className={section}>
        <h2>Error State</h2>
        <div style={{ maxWidth: 360 }}>
          <StepTimeline>
            <StepTimelineItem label='Upload' description='File sent' status='done' />
            <StepTimelineItem label='Validate' description='Schema mismatch' status='error' />
            <StepTimelineItem label='Complete' status='pending' />
          </StepTimeline>
        </div>
      </div>

      <div className={section}>
        <h2>StepTimeline Props</h2>
        <PropsTable
          props={[
            {
              name: 'children',
              type: 'ReactNode',
              description: 'StepTimelineItem elements',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>StepTimelineItem Props</h2>
        <PropsTable
          props={[
            {
              name: 'label',
              type: 'ReactNode',
              description: 'Step label text',
            },
            {
              name: 'description',
              type: 'ReactNode',
              description: 'Optional description below the label',
            },
            {
              name: 'status',
              type: "'pending' | 'active' | 'done' | 'error'",
              default: "'pending'",
              description: 'Step status',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Status is conveyed through color and icon (checkmark, exclamation)
            </li>
            <li>
              Connecting line uses CSS <strong>::before</strong> pseudo-element
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='steptimeline' />
    </>
  );
}

// ─── ApprovalCard ─────────────────────────────────────────────

function ApprovalCardDemo() {
  const [status, setStatus] = useState<'pending' | 'approved' | 'denied'>('pending');

  return (
    <>
      <h1>ApprovalCard</h1>
      <p className={intro}>
        Card with approve/deny actions for human-in-the-loop workflows.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div style={{ maxWidth: 400 }}>
          {status === 'pending' ? (
            <ApprovalCard
              title='Deploy to Production'
              description='This will deploy version 2.1.0 to all regions.'
              onApprove={() => setStatus('approved')}
              onDeny={() => setStatus('denied')}
            >
              <div style={{ fontSize: 'var(--haze-text-sm)' }}>
                Changes: 12 files modified, 3 new features
              </div>
            </ApprovalCard>
          ) : (
            <div
              style={{
                padding: 'var(--haze-space-4)',
                border: '1px solid var(--haze-color-border)',
                borderRadius: 'var(--haze-radius-md)',
                fontSize: 'var(--haze-text-sm)',
              }}
            >
              {status === 'approved' ? 'Deployment approved!' : 'Deployment denied.'}
              <Button
                size='sm'
                variant='ghost'
                onClick={() => setStatus('pending')}
                style={{ marginLeft: 'var(--haze-space-2)' }}
              >
                Reset
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'title',
              type: 'ReactNode',
              default: "'Approval Required'",
              description: 'Card title',
            },
            {
              name: 'description',
              type: 'ReactNode',
              description: 'Description text',
            },
            {
              name: 'onApprove',
              type: '() => void',
              description: 'Called when approve is clicked',
            },
            {
              name: 'onDeny',
              type: '() => void',
              description: 'Called when deny is clicked',
            },
            {
              name: 'approveText',
              type: 'string',
              default: "'Approve'",
              description: 'Approve button text',
            },
            {
              name: 'denyText',
              type: 'string',
              default: "'Deny'",
              description: 'Deny button text',
            },
            {
              name: 'children',
              type: 'ReactNode',
              description: 'Additional content',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Buttons render as native <strong>&lt;button&gt;</strong> elements
            </li>
            <li>Warning border provides visual emphasis for required action</li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='approvalcard' />
    </>
  );
}

// ─── TokenCounter ─────────────────────────────────────────────

function TokenCounterDemo() {
  return (
    <>
      <h1>TokenCounter</h1>
      <p className={intro}>
        Progress bar showing token usage with color changes at warning and
        danger thresholds.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div style={{ maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 'var(--haze-space-3)' }}>
          <TokenCounter used={1500} max={8000} label='Context' />
          <TokenCounter used={6000} max={8000} label='Context' />
          <TokenCounter used={7500} max={8000} label='Context' />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'used',
              type: 'number',
              description: 'Number of tokens used',
            },
            {
              name: 'max',
              type: 'number',
              description: 'Maximum token capacity',
            },
            {
              name: 'label',
              type: 'string',
              default: "'Tokens'",
              description: 'Label text',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Color changes at 70% (warning) and 90% (danger) thresholds
            </li>
            <li>Uses tabular-nums for consistent number alignment</li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='tokencounter' />
    </>
  );
}

// ─── ModelPicker ──────────────────────────────────────────────

function ModelPickerDemo() {
  const [, , modelCtrl] = useControl(undefined, 'gpt-4');
  const [model] = useControl(modelCtrl);

  const models = [
    { value: 'gpt-4', label: 'GPT-4', contextLength: '128k' },
    { value: 'gpt-3.5', label: 'GPT-3.5 Turbo', contextLength: '16k' },
    { value: 'claude-3', label: 'Claude 3', contextLength: '200k' },
    { value: 'gemini', label: 'Gemini Pro', contextLength: '32k' },
  ];

  return (
    <>
      <h1>ModelPicker</h1>
      <p className={intro}>
        Dropdown for selecting an AI model with optional context length info.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div style={{ maxWidth: 320 }}>
          <ModelPicker value={modelCtrl} options={models} />
          <p
            style={{
              marginTop: 'var(--haze-space-2)',
              fontSize: 'var(--haze-text-sm)',
              color: 'var(--haze-color-text-secondary)',
            }}
          >
            Selected: {model}
          </p>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'value',
              type: 'Control<string> | string',
              description: 'Selected model value',
            },
            {
              name: 'options',
              type: 'ModelOption[]',
              description: 'Array of { value, label, description?, contextLength? }',
            },
            {
              name: 'disabled',
              type: 'boolean',
              default: 'false',
              description: 'Disable the picker',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Renders as a native <strong>&lt;select&gt;</strong> element
            </li>
            <li>
              Full keyboard support via <strong>Arrow keys</strong> and{' '}
              <strong>Enter</strong>
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='modelpicker' />
    </>
  );
}

// ─── ConversationList ─────────────────────────────────────────

function ConversationListDemo() {
  const [active, setActive] = useState('chat-1');

  const conversations = [
    { id: 'chat-1', title: 'New Chat', subtitle: 'Start a conversation' },
    { id: 'chat-2', title: 'Project Planning', subtitle: 'Yesterday' },
    { id: 'chat-3', title: 'Code Review', subtitle: '3 days ago' },
    { id: 'chat-4', title: 'Bug Investigation', subtitle: 'Last week' },
  ];

  return (
    <>
      <h1>ConversationList</h1>
      <p className={intro}>
        Sidebar list of conversations with active state and subtitle support.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div
          style={{
            maxWidth: 280,
            border: '1px solid var(--haze-color-border)',
            borderRadius: 'var(--haze-radius-md)',
            overflow: 'hidden',
          }}
        >
          <ConversationList>
            {conversations.map((c) => (
              <ConversationItem
                key={c.id}
                title={c.title}
                subtitle={c.subtitle}
                active={active === c.id}
                onClick={() => setActive(c.id)}
              />
            ))}
          </ConversationList>
        </div>
      </div>

      <div className={section}>
        <h2>ConversationList Props</h2>
        <PropsTable
          props={[
            {
              name: 'children',
              type: 'ReactNode',
              description: 'ConversationItem elements',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>ConversationItem Props</h2>
        <PropsTable
          props={[
            {
              name: 'title',
              type: 'ReactNode',
              description: 'Conversation title',
            },
            {
              name: 'subtitle',
              type: 'ReactNode',
              description: 'Subtitle or preview text',
            },
            {
              name: 'active',
              type: 'boolean',
              default: 'false',
              description: 'Whether this item is currently active',
            },
            {
              name: 'onClick',
              type: '() => void',
              description: 'Called when the item is clicked',
            },
            {
              name: 'end',
              type: 'ReactNode',
              description: 'Content at the end of the item',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Active item has <strong>aria-current=&quot;true&quot;</strong>
            </li>
            <li>
              Items render as <strong>&lt;button&gt;</strong> for keyboard
              accessibility
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='conversationlist' />
    </>
  );
}

// ─── DiffViewer ───────────────────────────────────────────────

function DiffViewerDemo() {
  return (
    <>
      <h1>DiffViewer</h1>
      <p className={intro}>
        Line-by-line diff viewer with added/removed/unchanged highlighting and
        line numbers.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div style={{ maxWidth: 560 }}>
          <DiffViewer
            oldValue={'const x = 1;\nconst y = 2;\nconsole.log(x + y);'}
            newValue={
              'const x = 10;\nconst y = 2;\nconst z = x + y;\nconsole.log(z);'
            }
          />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'oldValue',
              type: 'string',
              description: 'Original text',
            },
            {
              name: 'newValue',
              type: 'string',
              description: 'Modified text',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Added lines highlighted in green, removed in red</li>
            <li>
              Line numbers use <strong>user-select: none</strong> to avoid
              accidental selection
            </li>
            <li>Monospace font for consistent alignment</li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='diffviewer' />
    </>
  );
}

// ─── LogViewer ────────────────────────────────────────────────

function LogViewerDemo() {
  const logs = [
    { level: 'debug' as const, message: 'Initializing parser', timestamp: '10:00:00' },
    { level: 'info' as const, message: 'Server started on port 3000', timestamp: '10:00:01' },
    { level: 'info' as const, message: 'Connected to database', timestamp: '10:00:02' },
    { level: 'debug' as const, message: 'Cache warmed up', timestamp: '10:00:03' },
    { level: 'warn' as const, message: 'Cache miss for key: user_123', timestamp: '10:00:05' },
    { level: 'info' as const, message: 'Request completed', timestamp: '10:00:08' },
    { level: 'error' as const, message: 'Failed to fetch external API', timestamp: '10:00:10' },
    { level: 'warn' as const, message: 'Retrying request (1/3)', timestamp: '10:00:11' },
    { level: 'info' as const, message: 'Retry successful', timestamp: '10:00:13' },
  ];

  return (
    <>
      <h1>LogViewer</h1>
      <p className={intro}>
        Structured log viewer with level-based filtering (debug, info, warn,
        error).
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div style={{ maxWidth: 560 }}>
          <LogViewer logs={logs} />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {
              name: 'logs',
              type: 'LogEntry[]',
              description: 'Array of { level, message, timestamp? }',
            },
            {
              name: 'filter',
              type: "Control<LogLevel | null> | LogLevel | null",
              description: 'Active level filter (controllable)',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Additional CSS class',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>LogEntry Type</h2>
        <PropsTable
          props={[
            {
              name: 'level',
              type: "'debug' | 'info' | 'warn' | 'error'",
              description: 'Log severity level',
            },
            {
              name: 'message',
              type: 'string',
              description: 'Log message text',
            },
            {
              name: 'timestamp',
              type: 'string',
              description: 'Optional timestamp string',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Filter buttons are native <strong>&lt;button&gt;</strong> elements
            </li>
            <li>Level badges use distinct colors for visual differentiation</li>
            <li>
              Scrollable body with <strong>max-height: 24rem</strong>
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='logviewer' />
    </>
  );
}

// ─── Command ────────────────────────────────────────────────────

function CommandDemo() {
  return (
    <>
      <h1>Command</h1>
      <p className={intro}>Command palette with filterable list of items.</p>

      <div className={section}>
        <h2>Demo</h2>
        <Command>
          <CommandInput placeholder='Type a command...' />
          <CommandList>
            <CommandItem>New File</CommandItem>
            <CommandItem>Open File</CommandItem>
            <CommandItem>Save</CommandItem>
            <CommandItem>Settings</CommandItem>
          </CommandList>
        </Command>
      </div>

      <div className={section}>
        <h2>Command Props</h2>
        <PropsTable
          props={[
            { name: 'query', type: 'Control<string> | string', description: 'Filter query (controllable)' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: 'children', type: 'ReactNode', description: 'CommandInput, CommandList, and CommandItem elements' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>CommandInput Props</h2>
        <PropsTable
          props={[
            { name: 'placeholder', type: 'string', description: 'Input placeholder text' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>CommandItem Props</h2>
        <PropsTable
          props={[
            { name: 'onSelect', type: '() => void', description: 'Called when item is selected' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: 'children', type: 'ReactNode', description: 'Item content (string for filtering)' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Uses <strong>role=&quot;combobox&quot;</strong> on the container</li>
            <li>Items use <strong>role=&quot;option&quot;</strong></li>
            <li>Typing in the input filters items by text content</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── Resizable ──────────────────────────────────────────────────

function ResizableDemo() {
  return (
    <>
      <h1>Resizable</h1>
      <p className={intro}>Resizable panels with draggable handles.</p>

      <div className={section}>
        <h2>Horizontal</h2>
        <div style={{ height: 200, border: '1px solid var(--haze-color-border)', borderRadius: 'var(--haze-radius-md)' }}>
          <ResizableGroup>
            <ResizablePanel defaultSize={50}>
              <div style={{ padding: 'var(--haze-space-3)', height: '100%' }}>Left Panel</div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50}>
              <div style={{ padding: 'var(--haze-space-3)', height: '100%' }}>Right Panel</div>
            </ResizablePanel>
          </ResizableGroup>
        </div>
      </div>

      <div className={section}>
        <h2>ResizableGroup Props</h2>
        <PropsTable
          props={[
            { name: 'direction', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Layout direction' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: 'children', type: 'ReactNode', description: 'ResizablePanel and ResizableHandle elements' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>ResizablePanel Props</h2>
        <PropsTable
          props={[
            { name: 'defaultSize', type: 'number', default: '50', description: 'Default size as percentage' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: 'children', type: 'ReactNode', description: 'Panel content' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Handle uses <strong>role=&quot;separator&quot;</strong> with <strong>aria-orientation</strong></li>
            <li>Cursor changes to col-resize or row-resize based on direction</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── Collapsible ────────────────────────────────────────────────

function CollapsibleDemo() {
  return (
    <>
      <h1>Collapsible</h1>
      <p className={intro}>Controlled collapsible section with trigger and content.</p>

      <div className={section}>
        <h2>Demo</h2>
        <Collapsible>
          <CollapsibleTrigger>
            <Button variant='outline' size='sm'>Toggle Content</Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p style={{ padding: 'var(--haze-space-3) 0', margin: 0 }}>This content is shown when expanded.</p>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className={section}>
        <h2>Collapsible Props</h2>
        <PropsTable
          props={[
            { name: 'open', type: 'Control<boolean> | boolean', description: 'Controlled open state' },
            { name: 'defaultOpen', type: 'boolean', default: 'false', description: 'Initial open state' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: 'children', type: 'ReactNode', description: 'CollapsibleTrigger and CollapsibleContent elements' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Trigger is a native <strong>&lt;button&gt;</strong></li>
            <li>Content toggles visibility on trigger click</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── Transfer ───────────────────────────────────────────────────

function TransferDemo() {
  const [targetKeys, setTargetKeys] = useState<string[]>(['b']);

  return (
    <>
      <h1>Transfer</h1>
      <p className={intro}>Transfer list for moving items between source and target.</p>

      <div className={section}>
        <h2>Demo</h2>
        <Transfer
          dataSource={[
            { key: 'a', title: 'Item A' },
            { key: 'b', title: 'Item B' },
            { key: 'c', title: 'Item C' },
            { key: 'd', title: 'Item D' },
          ]}
          targetKeys={targetKeys}
          onChange={(keys) => setTargetKeys(keys)}
        />
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            { name: 'dataSource', type: 'TransferItem[]', description: 'Array of { key, title, disabled? } items' },
            { name: 'targetKeys', type: 'Control<string[]> | string[]', description: 'Keys of items in the target list (controllable)' },
            { name: 'onChange', type: '(targetKeys, direction, moveKeys) => void', description: 'Called when items are moved' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Items use <strong>&lt;label&gt;</strong> with checkboxes</li>
            <li>Action buttons have <strong>aria-label</strong></li>
            <li>Disabled items cannot be selected</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── Upload ─────────────────────────────────────────────────────

function UploadDemo() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <>
      <h1>Upload</h1>
      <p className={intro}>File upload with drag and drop support.</p>

      <div className={section}>
        <h2>Demo</h2>
        <div style={{ maxWidth: 400 }}>
          <Upload accept='image/*' onChange={(f) => setFiles(f)} />
        </div>
        {files.length > 0 && (
          <p style={{ fontSize: 'var(--haze-text-sm)', color: 'var(--haze-color-text-secondary)', marginTop: 'var(--haze-space-2)' }}>
            Selected: {files.map((f) => f.name).join(', ')}
          </p>
        )}
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            { name: 'accept', type: 'string', description: 'Accepted file types' },
            { name: 'multiple', type: 'boolean', default: 'false', description: 'Allow multiple files' },
            { name: 'onChange', type: '(files: File[]) => void', description: 'Called when files are selected' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: 'children', type: 'ReactNode', description: 'Custom dropzone content' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Uses <strong>role=&quot;button&quot;</strong> with <strong>tabIndex</strong></li>
            <li>Click or drag-and-drop to select files</li>
            <li>Hidden native <strong>&lt;input type=&quot;file&quot;&gt;</strong></li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── ColorPicker ────────────────────────────────────────────────

function ColorPickerDemo() {
  return (
    <>
      <h1>ColorPicker</h1>
      <p className={intro}>Color selection with native picker, text input, and presets.</p>

      <div className={section}>
        <h2>Demo</h2>
        <div style={{ maxWidth: 320 }}>
          <ColorPicker presets={['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']} />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            { name: 'value', type: 'Control<string> | string', description: 'Controlled color value (hex)' },
            { name: 'presets', type: 'string[]', description: 'Array of preset color hex values' },
            { name: 'onChange', type: '(color: string) => void', description: 'Called when color changes' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Native <strong>&lt;input type=&quot;color&quot;&gt;</strong> for visual picking</li>
            <li>Text input for manual hex entry</li>
            <li>Preset buttons have <strong>aria-label</strong> with the color value</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── Rating ─────────────────────────────────────────────────────

function RatingDemo() {
  const [, , valueCtrl] = useControl(undefined, 3);
  const [value] = useControl(valueCtrl);

  return (
    <>
      <h1>Rating</h1>
      <p className={intro}>Star rating with half-star support.</p>

      <div className={section}>
        <h2>Demo</h2>
        <div className={row}>
          <Rating value={valueCtrl} />
          <span style={{ fontSize: 'var(--haze-text-sm)', color: 'var(--haze-color-text-secondary)' }}>{value} stars</span>
        </div>
      </div>

      <div className={section}>
        <h2>Half Stars</h2>
        <div className={row}>
          <Rating allowHalf />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            { name: 'value', type: 'Control<number> | number', description: 'Controlled rating value' },
            { name: 'count', type: 'number', default: '5', description: 'Number of stars' },
            { name: 'allowHalf', type: 'boolean', default: 'false', description: 'Allow half-star ratings' },
            { name: 'onChange', type: '(value: number) => void', description: 'Called when rating changes' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Uses <strong>role=&quot;radiogroup&quot;</strong> with individual <strong>role=&quot;radio&quot;</strong> stars</li>
            <li>Each star has <strong>aria-checked</strong> and <strong>aria-label</strong></li>
            <li>Click to select, hover to preview</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── Timeline ───────────────────────────────────────────────────

function TimelineDemo() {
  return (
    <>
      <h1>Timeline</h1>
      <p className={intro}>Vertical timeline for displaying events in chronological order.</p>

      <div className={section}>
        <h2>Demo</h2>
        <Timeline>
          <TimelineItem title='Order placed' description='Your order has been placed successfully.' time='2 minutes ago' color='primary' />
          <TimelineItem title='Payment confirmed' description='Payment processed.' time='1 minute ago' color='success' />
          <TimelineItem title='Shipped' description='Package is on its way.' color='warning' />
          <TimelineItem title='Delivered' />
        </Timeline>
      </div>

      <div className={section}>
        <h2>TimelineItem Props</h2>
        <PropsTable
          props={[
            { name: 'title', type: 'string', description: 'Event title' },
            { name: 'description', type: 'string', description: 'Event description' },
            { name: 'time', type: 'string', description: 'Timestamp text' },
            { name: 'color', type: "'primary' | 'success' | 'warning' | 'danger' | 'default'", default: "'default'", description: 'Dot color' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Container uses <strong>role=&quot;list&quot;</strong></li>
            <li>Each item uses <strong>role=&quot;listitem&quot;</strong></li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── Typography ─────────────────────────────────────────────────

function TypographyDemo() {
  return (
    <>
      <h1>Typography</h1>
      <p className={intro}>Title, Text, and Paragraph components for consistent typography.</p>

      <div className={section}>
        <h2>Title</h2>
        <Title level={1}>Heading Level 1</Title>
        <Title level={2}>Heading Level 2</Title>
        <Title level={3}>Heading Level 3</Title>
        <Title level={4}>Heading Level 4</Title>
        <Title level={5}>Heading Level 5</Title>
      </div>

      <div className={section}>
        <h2>Text</h2>
        <div className={row}>
          <Text>Default text</Text>
          <Text type='secondary'>Secondary text</Text>
          <Text type='muted'>Muted text</Text>
          <Text strong>Bold text</Text>
          <Text code>inline code</Text>
          <Text mark>Highlighted</Text>
        </div>
      </div>

      <div className={section}>
        <h2>Paragraph</h2>
        <Paragraph>This is a paragraph component with relaxed line height and bottom margin.</Paragraph>
        <Paragraph>Another paragraph follows naturally.</Paragraph>
      </div>

      <div className={section}>
        <h2>Title Props</h2>
        <PropsTable
          props={[
            { name: 'level', type: '1 | 2 | 3 | 4 | 5', default: '1', description: 'Heading level' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: 'children', type: 'ReactNode', description: 'Title content' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Text Props</h2>
        <PropsTable
          props={[
            { name: 'type', type: "'default' | 'secondary' | 'muted'", default: "'default'", description: 'Text color variant' },
            { name: 'strong', type: 'boolean', default: 'false', description: 'Render as bold' },
            { name: 'code', type: 'boolean', default: 'false', description: 'Render as inline code' },
            { name: 'mark', type: 'boolean', default: 'false', description: 'Highlight text' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: 'children', type: 'ReactNode', description: 'Text content' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Title renders semantic <strong>&lt;h1&gt;</strong> through <strong>&lt;h5&gt;</strong></li>
            <li>Text renders as <strong>&lt;span&gt;</strong>, <strong>&lt;strong&gt;</strong>, or <strong>&lt;code&gt;</strong></li>
            <li>Paragraph renders as <strong>&lt;p&gt;</strong></li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── Stat ───────────────────────────────────────────────────────

function StatDemo() {
  return (
    <>
      <h1>Stat</h1>
      <p className={intro}>Statistics display with trend indicators.</p>

      <div className={section}>
        <h2>Demo</h2>
        <StatGroup>
          <Stat title='Total Users' value='12,345' trend='up' trendValue='12%' description='vs last month' />
          <Stat title='Revenue' value='$45,678' trend='down' trendValue='3%' description='vs last month' />
          <Stat title='Active Now' value='89%' trend='neutral' trendValue='0%' />
        </StatGroup>
      </div>

      <div className={section}>
        <h2>Stat Props</h2>
        <PropsTable
          props={[
            { name: 'title', type: 'string', description: 'Stat label' },
            { name: 'value', type: 'string | number', description: 'Stat value' },
            { name: 'description', type: 'string', description: 'Additional description' },
            { name: 'trend', type: "'up' | 'down' | 'neutral'", description: 'Trend direction' },
            { name: 'trendValue', type: 'string', description: 'Trend percentage text' },
            { name: 'prefix', type: 'ReactNode', description: 'Content before value' },
            { name: 'suffix', type: 'ReactNode', description: 'Content after value' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>StatGroup Props</h2>
        <PropsTable
          props={[
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: 'children', type: 'ReactNode', description: 'Stat elements' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Purely presentational components</li>
            <li>Trend uses color and arrow symbols for visual indication</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── Segmented ──────────────────────────────────────────────────

function SegmentedDemo() {
  return (
    <>
      <h1>Segmented</h1>
      <p className={intro}>Segmented control for switching between options.</p>

      <div className={section}>
        <h2>Demo</h2>
        <div className={row}>
          <Segmented options={['Map', 'Transit', 'Satellite']} />
        </div>
      </div>

      <div className={section}>
        <h2>Sizes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--haze-space-3)' }}>
          <Segmented options={['Small', 'Medium', 'Large']} size='sm' />
          <Segmented options={['Small', 'Medium', 'Large']} size='md' />
          <Segmented options={['Small', 'Medium', 'Large']} size='lg' />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            { name: 'options', type: 'SegmentedOption[]', description: 'Array of strings or { value, label, disabled? }' },
            { name: 'value', type: 'Control<string> | string', description: 'Controlled selected value' },
            { name: 'onChange', type: '(value: string) => void', description: 'Called when selection changes' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Segment size' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Uses <strong>role=&quot;group&quot;</strong> on the container</li>
            <li>Each segment is a native <strong>&lt;button&gt;</strong></li>
            <li>Active segment has visual highlight with shadow</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── Chip ───────────────────────────────────────────────────────

function ChipDemo() {
  return (
    <>
      <h1>Chip</h1>
      <p className={intro}>Compact element for tags, labels, and filters.</p>

      <div className={section}>
        <h2>Solid Variants</h2>
        <div className={row}>
          <Chip>Default</Chip>
          <Chip color='primary'>Primary</Chip>
          <Chip color='success'>Success</Chip>
          <Chip color='warning'>Warning</Chip>
          <Chip color='danger'>Danger</Chip>
        </div>
      </div>

      <div className={section}>
        <h2>Outline Variants</h2>
        <div className={row}>
          <Chip variant='outline'>Default</Chip>
          <Chip variant='outline' color='primary'>Primary</Chip>
          <Chip variant='outline' color='success'>Success</Chip>
          <Chip variant='outline' color='danger'>Danger</Chip>
        </div>
      </div>

      <div className={section}>
        <h2>With Close</h2>
        <div className={row}>
          <Chip onClose={noop}>Removable</Chip>
          <Chip color='primary' onClose={noop}>Primary</Chip>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            { name: 'variant', type: "'solid' | 'outline'", default: "'solid'", description: 'Visual variant' },
            { name: 'color', type: "'default' | 'primary' | 'success' | 'warning' | 'danger'", default: "'default'", description: 'Color scheme' },
            { name: 'icon', type: 'ReactNode', description: 'Leading icon' },
            { name: 'onClose', type: '() => void', description: 'Close handler; shows close button when provided' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: 'children', type: 'ReactNode', description: 'Chip content' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Renders as a <strong>&lt;span&gt;</strong></li>
            <li>Close button has <strong>aria-label=&quot;Remove&quot;</strong></li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── ScrollArea ─────────────────────────────────────────────────

function ScrollAreaDemo() {
  return (
    <>
      <h1>ScrollArea</h1>
      <p className={intro}>Container with custom styled scrollbar.</p>

      <div className={section}>
        <h2>Demo</h2>
        <ScrollArea maxHeight={200}>
          <div style={{ padding: 'var(--haze-space-2)' }}>
            {Array.from({ length: 30 }, (_, i) => (
              <p key={i} style={{ margin: '0 0 var(--haze-space-2)' }}>Scrollable item {i + 1}</p>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            { name: 'maxHeight', type: 'number | string', description: 'Maximum height (px if number)' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: 'children', type: 'ReactNode', description: 'Scrollable content' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Uses native overflow with custom scrollbar styling</li>
            <li>Scrollbar is thin and styled via CSS custom properties</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── TimePicker ─────────────────────────────────────────────────

function TimePickerDemo() {
  return (
    <>
      <h1>TimePicker</h1>
      <p className={intro}>Time input using native time picker with controlled state.</p>

      <div className={section}>
        <h2>Demo</h2>
        <div className={fieldRow}>
          <TimePicker placeholder='Select time' />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            { name: 'value', type: 'Control<string> | string', description: 'Controlled time value' },
            { name: 'onChange', type: '(value: string) => void', description: 'Called when time changes' },
            { name: 'placeholder', type: 'string', description: 'Input placeholder' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: '...rest', type: 'InputHTMLAttributes', description: 'All native input attributes' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Renders as native <strong>&lt;input type=&quot;time&quot;&gt;</strong></li>
            <li>Full keyboard support via browser native picker</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── DateRangePicker ────────────────────────────────────────────

function DateRangePickerDemo() {
  return (
    <>
      <h1>DateRangePicker</h1>
      <p className={intro}>Date range selection with start and end date inputs.</p>

      <div className={section}>
        <h2>Demo</h2>
        <DateRangePicker />
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            { name: 'startDate', type: 'Control<string> | string', description: 'Controlled start date' },
            { name: 'endDate', type: 'Control<string> | string', description: 'Controlled end date' },
            { name: 'onStartChange', type: '(value: string) => void', description: 'Called when start date changes' },
            { name: 'onEndChange', type: '(value: string) => void', description: 'Called when end date changes' },
            { name: 'separator', type: 'ReactNode', default: "'–'", description: 'Separator between inputs' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Uses native <strong>&lt;input type=&quot;date&quot;&gt;</strong> elements</li>
            <li>Full keyboard and screen reader support</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── OTPInput ───────────────────────────────────────────────────

function OTPInputDemo() {
  return (
    <>
      <h1>OTPInput</h1>
      <p className={intro}>One-time password input with individual character cells.</p>

      <div className={section}>
        <h2>Demo</h2>
        <OTPInput length={6} />
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            { name: 'length', type: 'number', default: '6', description: 'Number of input cells' },
            { name: 'value', type: 'Control<string> | string', description: 'Controlled OTP value' },
            { name: 'onChange', type: '(value: string) => void', description: 'Called when OTP changes' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Each cell is an <strong>&lt;input&gt;</strong> with <strong>inputMode=&quot;numeric&quot;</strong></li>
            <li>Auto-advances focus on input</li>
            <li>Backspace moves focus to previous cell</li>
            <li>Paste support fills all cells</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── PasswordInput ──────────────────────────────────────────────

function PasswordInputDemo() {
  return (
    <>
      <h1>PasswordInput</h1>
      <p className={intro}>Password field with show/hide toggle.</p>

      <div className={section}>
        <h2>Demo</h2>
        <div className={fieldRow}>
          <PasswordInput placeholder='Enter password' />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            { name: 'value', type: 'Control<string> | string', description: 'Controlled value' },
            { name: 'onChange', type: '(value: string) => void', description: 'Called when value changes' },
            { name: 'placeholder', type: 'string', description: 'Input placeholder' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the input' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Toggle button has <strong>aria-label</strong> (&quot;Show password&quot; / &quot;Hide password&quot;)</li>
            <li>Toggle button uses <strong>tabIndex={'{'}-1{'}'}</strong> to skip tab order</li>
            <li>Type switches between &quot;password&quot; and &quot;text&quot;</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── TagInput ───────────────────────────────────────────────────

function TagInputDemo() {
  return (
    <>
      <h1>TagInput</h1>
      <p className={intro}>Input field for adding and removing tags.</p>

      <div className={section}>
        <h2>Demo</h2>
        <div className={fieldRow}>
          <TagInput placeholder='Type and press Enter' />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            { name: 'value', type: 'Control<string[]> | string[]', description: 'Controlled tags array' },
            { name: 'onChange', type: '(value: string[]) => void', description: 'Called when tags change' },
            { name: 'placeholder', type: 'string', description: 'Input placeholder' },
            { name: 'maxTags', type: 'number', description: 'Maximum number of tags' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the input' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Enter or comma adds a tag</li>
            <li>Backspace on empty input removes last tag</li>
            <li>Remove buttons are keyboard accessible</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── InlineEdit ─────────────────────────────────────────────────

function InlineEditDemo() {
  return (
    <>
      <h1>InlineEdit</h1>
      <p className={intro}>Click-to-edit text with inline input.</p>

      <div className={section}>
        <h2>Demo</h2>
        <InlineEdit placeholder='Click to edit this text' />
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            { name: 'value', type: 'Control<string> | string', description: 'Controlled value' },
            { name: 'onChange', type: '(value: string) => void', description: 'Called when value is committed' },
            { name: 'placeholder', type: 'string', default: "'Click to edit'", description: 'Placeholder text' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable editing' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Display mode uses <strong>role=&quot;button&quot;</strong> with <strong>tabIndex</strong></li>
            <li>Enter starts editing, Enter commits, Escape cancels</li>
            <li>Blur commits the value</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── DropdownMenu ───────────────────────────────────────────────

function DropdownMenuDemo() {
  return (
    <>
      <h1>DropdownMenu</h1>
      <p className={intro}>Dropdown menu with trigger, content, items, and separators.</p>

      <div className={section}>
        <h2>Demo</h2>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant='outline'>Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className={section}>
        <h2>DropdownMenu Props</h2>
        <PropsTable
          props={[
            { name: 'open', type: 'Control<boolean> | boolean', description: 'Controlled open state' },
            { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called when open state changes' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: 'children', type: 'ReactNode', description: 'Trigger and Content elements' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>DropdownMenuContent Props</h2>
        <PropsTable
          props={[
            { name: 'align', type: "'start' | 'center' | 'end'", default: "'start'", description: 'Content alignment' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: 'children', type: 'ReactNode', description: 'MenuItem and MenuSeparator elements' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>DropdownMenuItem Props</h2>
        <PropsTable
          props={[
            { name: 'onClick', type: '() => void', description: 'Called when item is clicked' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the item' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: 'children', type: 'ReactNode', description: 'Item content' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Trigger is a native <strong>&lt;button&gt;</strong></li>
            <li>Click outside closes the menu</li>
            <li>Disabled items have <strong>disabled</strong> attribute</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── ContextMenu ────────────────────────────────────────────────

function ContextMenuDemo() {
  return (
    <>
      <h1>ContextMenu</h1>
      <p className={intro}>Right-click context menu positioned at cursor.</p>

      <div className={section}>
        <h2>Demo</h2>
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
      </div>

      <div className={section}>
        <h2>ContextMenu Props</h2>
        <PropsTable
          props={[
            { name: 'open', type: 'Control<boolean> | boolean', description: 'Controlled open state' },
            { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called when open state changes' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: 'children', type: 'ReactNode', description: 'Trigger and Content elements' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>ContextMenuItem Props</h2>
        <PropsTable
          props={[
            { name: 'onClick', type: '() => void', description: 'Called when item is clicked' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the item' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: 'children', type: 'ReactNode', description: 'Item content' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Opens on right-click (contextmenu event)</li>
            <li>Content is positioned at cursor coordinates</li>
            <li>Click outside closes the menu</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── NavigationBar ──────────────────────────────────────────────

function NavigationBarDemo() {
  return (
    <>
      <h1>NavigationBar</h1>
      <p className={intro}>Top navigation bar with brand, links, and end slot.</p>

      <div className={section}>
        <h2>Demo</h2>
        <NavigationBar
          brand={<span>MyApp</span>}
          end={<Button size='sm' variant='outline'>Login</Button>}
        >
          <NavLink active>Home</NavLink>
          <NavLink>Docs</NavLink>
          <NavLink>About</NavLink>
        </NavigationBar>
      </div>

      <div className={section}>
        <h2>NavigationBar Props</h2>
        <PropsTable
          props={[
            { name: 'brand', type: 'ReactNode', description: 'Brand/logo content' },
            { name: 'children', type: 'ReactNode', description: 'NavLink elements' },
            { name: 'end', type: 'ReactNode', description: 'End slot content (e.g. login button)' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>NavLink Props</h2>
        <PropsTable
          props={[
            { name: 'href', type: 'string', default: "'#'", description: 'Link URL' },
            { name: 'active', type: 'boolean', default: 'false', description: 'Mark as active' },
            { name: 'onClick', type: '() => void', description: 'Click handler (prevents default)' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: 'children', type: 'ReactNode', description: 'Link text' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Renders as <strong>&lt;nav&gt;</strong></li>
            <li>Active link has <strong>aria-current=&quot;page&quot;</strong></li>
            <li>Links are standard <strong>&lt;a&gt;</strong> elements</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── BackToTop ──────────────────────────────────────────────────

function BackToTopDemo() {
  return (
    <>
      <h1>BackToTop</h1>
      <p className={intro}>Fixed scroll-to-top button that appears after scrolling.</p>

      <div className={section}>
        <h2>Demo</h2>
        <p style={{ fontSize: 'var(--haze-text-sm)', color: 'var(--haze-color-text-secondary)' }}>
          Scroll down to see the button appear at the bottom-right corner.
        </p>
        <BackToTop threshold={100} />
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            { name: 'threshold', type: 'number', default: '300', description: 'Scroll distance before showing (px)' },
            { name: 'children', type: 'ReactNode', default: "'↑'", description: 'Button content' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Uses <strong>aria-label=&quot;Back to top&quot;</strong></li>
            <li>Smooth scroll animation</li>
            <li>Hidden with opacity and pointer-events when below threshold</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── Affix ──────────────────────────────────────────────────────

function AffixDemo() {
  return (
    <>
      <h1>Affix</h1>
      <p className={intro}>Fixed position element relative to the viewport.</p>

      <div className={section}>
        <h2>Demo</h2>
        <p style={{ fontSize: 'var(--haze-text-sm)', color: 'var(--haze-color-text-secondary)' }}>
          Affix positions children fixed to the viewport. Use <code>position</code> to set top or bottom, and <code>offset</code> for pixel offset.
        </p>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            { name: 'position', type: "'top' | 'bottom'", default: "'top'", description: 'Viewport edge' },
            { name: 'offset', type: 'number', default: '0', description: 'Pixel offset from edge' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: 'style', type: 'CSSProperties', description: 'Inline styles' },
            { name: 'children', type: 'ReactNode', description: 'Content to affix' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Uses CSS <strong>position: fixed</strong> with <strong>z-index: 100</strong></li>
            <li>Purely presentational wrapper</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── Container ──────────────────────────────────────────────────

function ContainerDemo() {
  return (
    <>
      <h1>Container</h1>
      <p className={intro}>Centered content container with max-width breakpoints.</p>

      <div className={section}>
        <h2>Sizes</h2>
        {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <div key={size} style={{ marginBottom: 'var(--haze-space-3)' }}>
            <Container size={size}>
              <div style={{ background: 'var(--haze-color-bg-subtle)', padding: 'var(--haze-space-3)', borderRadius: 'var(--haze-radius-md)', textAlign: 'center' }}>
                Size: {size}
              </div>
            </Container>
          </div>
        ))}
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl' | 'full'", default: "'lg'", description: 'Max-width breakpoint' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: 'children', type: 'ReactNode', description: 'Container content' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Renders as a plain <strong>&lt;div&gt;</strong></li>
            <li>Purely presentational layout component</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── Banner ─────────────────────────────────────────────────────

function BannerDemo() {
  return (
    <>
      <h1>Banner</h1>
      <p className={intro}>Dismissible alert banner with variant colors.</p>

      <div className={section}>
        <h2>Variants</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--haze-space-2)' }}>
          <Banner variant='info'>This is an informational banner.</Banner>
          <Banner variant='success'>Operation completed successfully.</Banner>
          <Banner variant='warning'>Please review your settings.</Banner>
          <Banner variant='danger' onClose={noop}>Something went wrong.</Banner>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            { name: 'visible', type: 'Control<boolean> | boolean', description: 'Controlled visibility' },
            { name: 'onClose', type: '() => void', description: 'Close handler; shows close button when provided' },
            { name: 'variant', type: "'info' | 'success' | 'warning' | 'danger'", default: "'info'", description: 'Color variant' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: 'children', type: 'ReactNode', description: 'Banner content' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Uses <strong>role=&quot;alert&quot;</strong></li>
            <li>Close button has <strong>aria-label=&quot;Close&quot;</strong></li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── ConfirmDialog ──────────────────────────────────────────────

function ConfirmDialogDemo() {
  const [, , openCtrl] = useControl(undefined, false);
  const [, setOpen] = useControl(openCtrl);

  return (
    <>
      <h1>ConfirmDialog</h1>
      <p className={intro}>Confirmation dialog with confirm/cancel actions.</p>

      <div className={section}>
        <h2>Demo</h2>
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
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            { name: 'open', type: 'Control<boolean> | boolean', description: 'Controlled open state' },
            { name: 'onClose', type: '() => void', description: 'Called when dialog closes' },
            { name: 'onConfirm', type: '() => void', description: 'Called on confirm' },
            { name: 'onCancel', type: '() => void', description: 'Called on cancel' },
            { name: 'title', type: 'ReactNode', description: 'Dialog title' },
            { name: 'confirmText', type: 'string', default: "'Confirm'", description: 'Confirm button text' },
            { name: 'cancelText', type: 'string', default: "'Cancel'", description: 'Cancel button text' },
            { name: 'variant', type: "'default' | 'danger'", default: "'default'", description: 'Confirm button style' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: 'children', type: 'ReactNode', description: 'Dialog body content' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Overlay click closes the dialog</li>
            <li>Confirm and cancel buttons are keyboard accessible</li>
            <li>Danger variant uses red confirm button</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── CodeBlock ──────────────────────────────────────────────────

function CodeBlockDemo() {
  return (
    <>
      <h1>CodeBlock</h1>
      <p className={intro}>Code display with language label and monospace styling.</p>

      <div className={section}>
        <h2>Demo</h2>
        <CodeBlock language='tsx'>
{`const greeting = "Hello, world!";
console.log(greeting);`}
        </CodeBlock>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            { name: 'language', type: 'string', description: 'Language label displayed in corner' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: 'children', type: 'ReactNode', description: 'Code content' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Renders as <strong>&lt;pre&gt;&lt;code&gt;</strong></li>
            <li>Language label is decorative (user-select: none)</li>
            <li>Horizontal scroll for long lines</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── AspectRatio ────────────────────────────────────────────────

function AspectRatioDemo() {
  return (
    <>
      <h1>AspectRatio</h1>
      <p className={intro}>Container that maintains a fixed aspect ratio.</p>

      <div className={section}>
        <h2>Demo</h2>
        <div style={{ maxWidth: 400 }}>
          <AspectRatio ratio={16 / 9}>
            <div style={{ width: '100%', height: '100%', background: 'var(--haze-color-bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              16:9
            </div>
          </AspectRatio>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            { name: 'ratio', type: 'number', default: '16/9', description: 'Aspect ratio (width / height)' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: 'children', type: 'ReactNode', description: 'Content to render inside' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Uses CSS <strong>padding-bottom</strong> technique for ratio</li>
            <li>Content is absolutely positioned inside</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── VirtualList ────────────────────────────────────────────────

function VirtualListDemo() {
  const items = Array.from({ length: 10000 }, (_, i) => `Item ${i + 1}`);

  return (
    <>
      <h1>VirtualList</h1>
      <p className={intro}>Virtualized list for rendering large datasets efficiently.</p>

      <div className={section}>
        <h2>Demo</h2>
        <VirtualList
          items={items}
          height={300}
          itemHeight={32}
          renderItem={(item) => (
            <div style={{ padding: '0 var(--haze-space-3)', lineHeight: '32px', borderBottom: '1px solid var(--haze-color-border)' }}>
              {item}
            </div>
          )}
        />
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            { name: 'items', type: 'T[]', description: 'Array of items to render' },
            { name: 'height', type: 'number', description: 'Container height in px' },
            { name: 'itemHeight', type: 'number', description: 'Height of each item in px' },
            { name: 'renderItem', type: '(item: T, index: number) => ReactNode', description: 'Item renderer' },
            { name: 'overscan', type: 'number', default: '5', description: 'Extra items to render outside viewport' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Only visible items are rendered in the DOM</li>
            <li>Uses absolute positioning for item placement</li>
            <li>Native scroll behavior is preserved</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── TagGroup ───────────────────────────────────────────────────

function TagGroupDemo() {
  return (
    <>
      <h1>TagGroup</h1>
      <p className={intro}>Group of tags with optional close buttons.</p>

      <div className={section}>
        <h2>Demo</h2>
        <TagGroup>
          <TagGroupItem>React</TagGroupItem>
          <TagGroupItem>TypeScript</TagGroupItem>
          <TagGroupItem onClose={noop}>Removable</TagGroupItem>
        </TagGroup>
      </div>

      <div className={section}>
        <h2>TagGroup Props</h2>
        <PropsTable
          props={[
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: 'children', type: 'ReactNode', description: 'TagGroupItem elements' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>TagGroupItem Props</h2>
        <PropsTable
          props={[
            { name: 'onClose', type: '() => void', description: 'Close handler; shows close button when provided' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: 'children', type: 'ReactNode', description: 'Tag content' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Group uses <strong>role=&quot;group&quot;</strong></li>
            <li>Close button has <strong>aria-label=&quot;Remove&quot;</strong></li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── BottomSheet ────────────────────────────────────────────────

function BottomSheetDemo() {
  const [, , openCtrl] = useControl(undefined, false);
  const [, setOpen] = useControl(openCtrl);

  return (
    <>
      <h1>BottomSheet</h1>
      <p className={intro}>Bottom sheet overlay panel for mobile-friendly interactions.</p>

      <div className={section}>
        <h2>Demo</h2>
        <div className={row}>
          <Button onClick={() => setOpen(true)}>Open Bottom Sheet</Button>
        </div>
        <BottomSheet open={openCtrl} onClose={() => setOpen(false)}>
          <p style={{ margin: 0 }}>Bottom sheet content. Click the backdrop to close.</p>
          <Button onClick={() => setOpen(false)} size='sm' variant='outline' style={{ marginTop: 'var(--haze-space-3)' }}>
            Close
          </Button>
        </BottomSheet>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            { name: 'open', type: 'Control<boolean> | boolean', description: 'Controlled open state' },
            { name: 'onClose', type: '() => void', description: 'Called when sheet closes' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: 'children', type: 'ReactNode', description: 'Sheet content' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Overlay click closes the sheet</li>
            <li>Sheet has a drag handle indicator</li>
            <li>Safe area insets are respected for mobile</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── SwipeAction ────────────────────────────────────────────────

function SwipeActionDemo() {
  return (
    <>
      <h1>SwipeAction</h1>
      <p className={intro}>Swipe-to-reveal actions for touch and pointer interactions.</p>

      <div className={section}>
        <h2>Demo</h2>
        <div style={{ maxWidth: 400, border: '1px solid var(--haze-color-border)', borderRadius: 'var(--haze-radius-md)' }}>
          <SwipeAction
            left={<div style={{ padding: 'var(--haze-space-3)', color: 'var(--haze-color-success)' }}>Archive</div>}
            right={<div style={{ padding: 'var(--haze-space-3)', color: 'var(--haze-color-danger)' }}>Delete</div>}
          >
            <div style={{ padding: 'var(--haze-space-4)', background: 'var(--haze-color-bg)' }}>Swipe left or right</div>
          </SwipeAction>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            { name: 'left', type: 'ReactNode', description: 'Left swipe action content' },
            { name: 'right', type: 'ReactNode', description: 'Right swipe action content' },
            { name: 'onSwipeLeft', type: '() => void', description: 'Called when swiped left past threshold' },
            { name: 'onSwipeRight', type: '() => void', description: 'Called when swiped right past threshold' },
            { name: 'threshold', type: 'number', default: '80', description: 'Swipe distance threshold in px' },
            { name: 'className', type: 'string', description: 'Additional CSS class' },
            { name: 'children', type: 'ReactNode', description: 'Main content' },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Uses pointer events for cross-device support</li>
            <li>Content slides with CSS transform</li>
            <li>Resets position on pointer release</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── Demo registry ─────────────────────────────────────────────

const demos: Record<string, () => ReactNode> = {
  button: ButtonDemo,
  input: InputDemo,
  select: SelectDemo,
  checkbox: CheckboxDemo,
  switch: SwitchDemo,
  badge: BadgeDemo,
  dialog: DialogDemo,
  tooltip: TooltipDemo,
  popover: PopoverDemo,
  card: CardDemo,
  radio: RadioDemo,
  textarea: TextareaDemo,
  slider: SliderDemo,
  tabs: TabsDemo,
  accordion: AccordionDemo,
  alert: AlertDemo,
  avatar: AvatarDemo,
  tag: TagDemo,
  skeleton: SkeletonDemo,
  icon: IconDemo,
  image: ImageDemo,
  flex: FlexDemo,
  breadcrumb: BreadcrumbDemo,
  disclosure: DisclosureDemo,
  menu: MenuDemo,
  numberinput: NumberInputDemo,
  fileinput: FileInputDemo,
  toast: ToastDemo,
  list: ListDemo,
  combobox: ComboboxDemo,
  table: TableDemo,
  carousel: CarouselDemo,
  datepicker: DatepickerDemo,
  tree: TreeDemo,
  divider: DividerDemo,
  spinner: SpinnerDemo,
  empty: EmptyDemo,
  progress: ProgressDemo,
  pagination: PaginationDemo,
  grid: GridDemo,
  drawer: DrawerDemo,
  stepper: StepperDemo,
  chatmessage: ChatMessageDemo,
  chatcontainer: ChatContainerDemo,
  chatinput: ChatInputDemo,
  streamingtext: StreamingTextDemo,
  markdownrenderer: MarkdownRendererDemo,
  toolcallcard: ToolCallCardDemo,
  thinkingindicator: ThinkingIndicatorDemo,
  steptimeline: StepTimelineDemo,
  approvalcard: ApprovalCardDemo,
  tokencounter: TokenCounterDemo,
  modelpicker: ModelPickerDemo,
  conversationlist: ConversationListDemo,
  diffviewer: DiffViewerDemo,
  logviewer: LogViewerDemo,
  command: CommandDemo,
  resizable: ResizableDemo,
  collapsible: CollapsibleDemo,
  transfer: TransferDemo,
  upload: UploadDemo,
  colorpicker: ColorPickerDemo,
  rating: RatingDemo,
  timeline: TimelineDemo,
  typography: TypographyDemo,
  stat: StatDemo,
  segmented: SegmentedDemo,
  chip: ChipDemo,
  scrollarea: ScrollAreaDemo,
  timepicker: TimePickerDemo,
  daterangepicker: DateRangePickerDemo,
  otpinput: OTPInputDemo,
  passwordinput: PasswordInputDemo,
  taginput: TagInputDemo,
  inlineedit: InlineEditDemo,
  dropdownmenu: DropdownMenuDemo,
  contextmenu: ContextMenuDemo,
  navigationbar: NavigationBarDemo,
  backtotop: BackToTopDemo,
  affix: AffixDemo,
  container: ContainerDemo,
  banner: BannerDemo,
  confirmdialog: ConfirmDialogDemo,
  codeblock: CodeBlockDemo,
  aspectratio: AspectRatioDemo,
  virtuallist: VirtualListDemo,
  taggroup: TagGroupDemo,
  bottomsheet: BottomSheetDemo,
  swipeaction: SwipeActionDemo,
};

export default function ComponentDetail() {
  const { params } = useMatched();
  const name = params.name ?? '';
  const Demo = demos[name];

  return (
    <div className={page}>
      {Demo ? <Demo /> : <h1>Component not found: {name}</h1>}
    </div>
  );
}
