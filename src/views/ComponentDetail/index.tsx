import type {ReactNode} from 'react';

import {useState} from 'react';
import {useMatched} from '@native-router/react';
import {useControl} from 'react-use-control';

import {
  lightTheme,
  spacing,
  typography,
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
} from '@/lib';

import PropsTable from './PropsTable';
import A11yNote from './A11yNote';
import {page, intro, section, row, fieldRow, labelStyle} from './styles';

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
        <h2>Disabled</h2>
        <div className={row}>
          <Button disabled>Disabled Solid</Button>
          <Button variant='outline' disabled>Disabled Outline</Button>
          <Button variant='ghost' disabled>Disabled Ghost</Button>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {name: 'variant', type: "'solid' | 'outline' | 'ghost'", default: "'solid'", description: 'Visual style of the button'},
            {name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Size of the button'},
            {name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the button'},
            {name: 'className', type: 'string', description: 'Additional CSS class'},
            {name: '...rest', type: 'ButtonHTMLAttributes', description: 'All native button attributes (except type)'},
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Renders as native <strong>&lt;button&gt;</strong> with <strong>type=&quot;button&quot;</strong></li>
            <li>Supports <strong>Tab</strong> focus and <strong>Enter</strong>/<strong>Space</strong> activation</li>
            <li>Disabled state uses <strong>disabled</strong> attribute, removing from tab order</li>
            <li>Focus ring via <strong>:focus-visible</strong></li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── Input ─────────────────────────────────────────────────────

function InputDemo() {
  return (
    <>
      <h1>Input</h1>
      <p className={intro}>Single-line text input with controlled/uncontrolled support.</p>

      <div className={section}>
        <h2>Sizes</h2>
        <div className={fieldRow}><Input size='sm' placeholder='Small' /></div>
        <div className={fieldRow}><Input size='md' placeholder='Medium' /></div>
        <div className={fieldRow}><Input size='lg' placeholder='Large' /></div>
      </div>

      <div className={section}>
        <h2>Disabled</h2>
        <div className={fieldRow}><Input disabled placeholder='Disabled' /></div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {name: 'value', type: 'Control<string> | string', description: 'Controlled value or control object'},
            {name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Size of the input'},
            {name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the input'},
            {name: 'className', type: 'string', description: 'Additional CSS class'},
            {name: '...rest', type: 'InputHTMLAttributes', description: 'All native input attributes'},
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Renders as native <strong>&lt;input&gt;</strong></li>
            <li>Use <strong>aria-label</strong> or a visible <strong>&lt;label&gt;</strong> for screen readers</li>
            <li>Focus ring via <strong>:focus</strong> pseudo-class</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── Select ────────────────────────────────────────────────────

function SelectDemo() {
  return (
    <>
      <h1>Select</h1>
      <p className={intro}>Dropdown selection with native &lt;select&gt; semantics.</p>

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
          <Select disabled><Option value=''>Disabled</Option></Select>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {name: 'value', type: 'Control<string> | string', description: 'Controlled value or control object'},
            {name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Size of the select'},
            {name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the select'},
            {name: 'className', type: 'string', description: 'Additional CSS class'},
            {name: 'children', type: 'ReactNode', description: '<Option> elements'},
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Renders as native <strong>&lt;select&gt;</strong> with full keyboard support</li>
            <li>Use <strong>aria-label</strong> or a visible <strong>&lt;label&gt;</strong></li>
            <li><strong>Arrow keys</strong> navigate options, <strong>Enter</strong> selects</li>
          </ul>
        </A11yNote>
      </div>
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
          <label className={labelStyle}><Checkbox /> Unchecked</label>
          <label className={labelStyle}><Checkbox checked /> Checked</label>
        </div>
      </div>

      <div className={section}>
        <h2>Disabled</h2>
        <div className={row}>
          <label className={labelStyle}><Checkbox disabled /> Disabled</label>
          <label className={labelStyle}><Checkbox checked disabled /> Checked Disabled</label>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {name: 'checked', type: 'Control<boolean> | boolean', description: 'Controlled checked state or control object'},
            {name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the checkbox'},
            {name: 'className', type: 'string', description: 'Additional CSS class'},
            {name: '...rest', type: 'InputHTMLAttributes', description: 'All native input attributes'},
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Renders as native <strong>&lt;input type=&quot;checkbox&quot;&gt;</strong></li>
            <li><strong>Space</strong> toggles the checked state</li>
            <li>Wrap with <strong>&lt;label&gt;</strong> for accessible labeling</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── Switch ────────────────────────────────────────────────────

function SwitchDemo() {
  return (
    <>
      <h1>Switch</h1>
      <p className={intro}>Toggle between on/off states with a sliding control.</p>

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
            {name: 'checked', type: 'Control<boolean> | boolean', description: 'Controlled checked state or control object'},
            {name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Size of the switch'},
            {name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the switch'},
            {name: 'className', type: 'string', description: 'Additional CSS class'},
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Uses <strong>role=&quot;switch&quot;</strong> with <strong>aria-checked</strong></li>
            <li><strong>Space</strong> toggles the state</li>
            <li>Provide <strong>aria-label</strong> when no visible label is present</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── Badge ─────────────────────────────────────────────────────

function BadgeDemo() {
  return (
    <>
      <h1>Badge</h1>
      <p className={intro}>Small status indicators for labeling and categorization.</p>

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
            {name: 'variant', type: "'default' | 'success' | 'warning' | 'danger' | 'info'", default: "'default'", description: 'Color variant'},
            {name: 'size', type: "'sm' | 'md'", default: "'md'", description: 'Size of the badge'},
            {name: 'className', type: 'string', description: 'Additional CSS class'},
            {name: 'children', type: 'ReactNode', description: 'Badge content'},
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Renders as a <strong>&lt;span&gt;</strong> — purely decorative</li>
            <li>Add <strong>aria-label</strong> if the badge conveys meaning not present in surrounding text</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── Dialog ────────────────────────────────────────────────────

function DialogDemo() {
  const [, , openCtrl] = useControl(undefined, false);
  const [open, setOpen] = useControl(openCtrl);

  return (
    <>
      <h1>Dialog</h1>
      <p className={intro}>Modal dialog using the native &lt;dialog&gt; element.</p>

      <div className={section}>
        <h2>Demo</h2>
        <div className={row}>
          <Button onClick={() => setOpen(true)}>Open Dialog</Button>
        </div>
        <Dialog open={openCtrl} onClose={() => setOpen(false)}>
          <h3 style={{margin: '0 0 8px'}}>Dialog Title</h3>
          <p style={{margin: '0 0 16px', color: 'var(--pbl-color-text-secondary)'}}>
            This is a modal dialog. Press ESC or click the backdrop to close.
          </p>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </Dialog>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {name: 'open', type: 'Control<boolean> | boolean', default: 'false', description: 'Whether the dialog is open'},
            {name: 'onClose', type: '() => void', description: 'Called when the dialog is closed'},
            {name: 'className', type: 'string', description: 'Additional CSS class'},
            {name: 'children', type: 'ReactNode', description: 'Dialog content'},
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Uses native <strong>&lt;dialog&gt;</strong> with <strong>showModal()</strong> — automatic <strong>role=&quot;dialog&quot;</strong></li>
            <li><strong>ESC</strong> closes the dialog</li>
            <li>Focus is trapped within the dialog while open</li>
            <li>Backdrop click closes the dialog</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── Tooltip ───────────────────────────────────────────────────

function TooltipDemo() {
  return (
    <>
      <h1>Tooltip</h1>
      <p className={intro}>Informational popup triggered by hover or focus, using pure CSS.</p>

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
            {name: 'content', type: 'ReactNode', description: 'Tooltip content'},
            {name: 'position', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'", description: 'Tooltip placement'},
            {name: 'className', type: 'string', description: 'Additional CSS class'},
            {name: 'children', type: 'ReactNode', description: 'Trigger element'},
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Uses <strong>role=&quot;tooltip&quot;</strong> with <strong>aria-describedby</strong></li>
            <li>Visible on <strong>hover</strong> and <strong>focus-within</strong></li>
            <li>Content is always in the DOM for screen readers</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── Popover ───────────────────────────────────────────────────

function PopoverDemo() {
  return (
    <>
      <h1>Popover</h1>
      <p className={intro}>Click-triggered floating panel for additional content.</p>

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
            {name: 'content', type: 'ReactNode', description: 'Popover panel content'},
            {name: 'open', type: 'Control<boolean> | boolean', default: 'false', description: 'Whether the popover is open'},
            {name: 'className', type: 'string', description: 'Additional CSS class'},
            {name: 'children', type: 'ReactNode', description: 'Trigger element'},
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Trigger has <strong>aria-expanded</strong> and <strong>aria-controls</strong></li>
            <li>Panel is hidden with <strong>display: none</strong> when closed</li>
            <li>Click trigger to toggle open/close</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── Card ──────────────────────────────────────────────────────

function CardDemo() {
  return (
    <>
      <h1>Card</h1>
      <p className={intro}>Container for grouping related content with visual separation.</p>

      <div className={section}>
        <h2>Variants</h2>
        <div className={row} style={{alignItems: 'stretch'}}>
          <Card variant='elevated'>
            <h3 style={{margin: '0 0 4px'}}>Elevated</h3>
            <p style={{margin: 0, color: 'var(--pbl-color-text-secondary)', fontSize: 'var(--pbl-text-sm)'}}>Shadow-based elevation.</p>
          </Card>
          <Card variant='outlined'>
            <h3 style={{margin: '0 0 4px'}}>Outlined</h3>
            <p style={{margin: 0, color: 'var(--pbl-color-text-secondary)', fontSize: 'var(--pbl-text-sm)'}}>Border-based separation.</p>
          </Card>
          <Card variant='filled'>
            <h3 style={{margin: '0 0 4px'}}>Filled</h3>
            <p style={{margin: 0, color: 'var(--pbl-color-text-secondary)', fontSize: 'var(--pbl-text-sm)'}}>Background-based distinction.</p>
          </Card>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {name: 'variant', type: "'elevated' | 'outlined' | 'filled'", default: "'elevated'", description: 'Visual style of the card'},
            {name: 'className', type: 'string', description: 'Additional CSS class'},
            {name: 'children', type: 'ReactNode', description: 'Card content'},
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Renders as a <strong>&lt;div&gt;</strong> — add <strong>role</strong> and <strong>aria-label</strong> if the card represents a distinct landmark</li>
            <li>Purely presentational by default</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── Radio ─────────────────────────────────────────────────────

function RadioDemo() {
  return (
    <>
      <h1>Radio</h1>
      <p className={intro}>Single selection from a group of options using RadioGroup context.</p>

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
            {name: 'value', type: 'Control<string> | string', description: 'Controlled value or control object'},
            {name: 'name', type: 'string', description: 'HTML name attribute for the radio group'},
            {name: 'className', type: 'string', description: 'Additional CSS class'},
            {name: 'children', type: 'ReactNode', description: '<Radio> elements'},
          ]}
        />
      </div>

      <div className={section}>
        <h2>Radio Props</h2>
        <PropsTable
          props={[
            {name: 'value', type: 'string', description: 'Value of this radio option'},
            {name: 'className', type: 'string', description: 'Additional CSS class'},
            {name: 'children', type: 'ReactNode', description: 'Label text'},
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Uses native <strong>&lt;input type=&quot;radio&quot;&gt;</strong> inside <strong>&lt;fieldset&gt;</strong></li>
            <li><strong>Arrow keys</strong> navigate between options</li>
            <li><strong>Space</strong> selects the focused option</li>
            <li>Add a <strong>&lt;legend&gt;</strong> inside RadioGroup for group labeling</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── Textarea ──────────────────────────────────────────────────

function TextareaDemo() {
  return (
    <>
      <h1>Textarea</h1>
      <p className={intro}>Multi-line text input, styled consistently with Input.</p>

      <div className={section}>
        <h2>Sizes</h2>
        <div className={fieldRow}><Textarea size='sm' placeholder='Small' rows={3} /></div>
        <div className={fieldRow}><Textarea size='md' placeholder='Medium' rows={3} /></div>
        <div className={fieldRow}><Textarea size='lg' placeholder='Large' rows={3} /></div>
      </div>

      <div className={section}>
        <h2>Disabled</h2>
        <div className={fieldRow}><Textarea disabled placeholder='Disabled' rows={3} /></div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {name: 'value', type: 'Control<string> | string', description: 'Controlled value or control object'},
            {name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Size of the textarea'},
            {name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the textarea'},
            {name: 'className', type: 'string', description: 'Additional CSS class'},
            {name: '...rest', type: 'TextareaHTMLAttributes', description: 'All native textarea attributes'},
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Renders as native <strong>&lt;textarea&gt;</strong></li>
            <li>Use <strong>aria-label</strong> or a visible <strong>&lt;label&gt;</strong></li>
            <li>Supports <strong>resize: vertical</strong> by default</li>
          </ul>
        </A11yNote>
      </div>
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
      <p className={intro}>Range input for selecting a numeric value within a range.</p>

      <div className={section}>
        <h2>Demo</h2>
        <div className={fieldRow}>
          <Slider value={valueCtrl} min={0} max={100} step={1} />
          <span style={{fontSize: 'var(--pbl-text-sm)', color: 'var(--pbl-color-text-secondary)'}}>
            Value: {value}
          </span>
        </div>
      </div>

      <div className={section}>
        <h2>Disabled</h2>
        <div className={fieldRow}><Slider disabled /></div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {name: 'value', type: 'Control<number> | number', description: 'Controlled value or control object'},
            {name: 'min', type: 'number', default: '0', description: 'Minimum value'},
            {name: 'max', type: 'number', default: '100', description: 'Maximum value'},
            {name: 'step', type: 'number', default: '1', description: 'Step increment'},
            {name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the slider'},
            {name: 'className', type: 'string', description: 'Additional CSS class'},
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Renders as native <strong>&lt;input type=&quot;range&quot;&gt;</strong></li>
            <li><strong>Arrow keys</strong> adjust the value by step</li>
            <li>Use <strong>aria-label</strong> or a visible <strong>&lt;label&gt;</strong></li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── Tabs ──────────────────────────────────────────────────────

function TabsDemo() {
  const [, , tabCtrl] = useControl(undefined, 'tab1');

  return (
    <>
      <h1>Tabs</h1>
      <p className={intro}>Organize content into switchable panels with tabbed navigation.</p>

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
            {name: 'value', type: 'Control<string> | string', description: 'Active tab value'},
            {name: 'className', type: 'string', description: 'Additional CSS class'},
            {name: 'children', type: 'ReactNode', description: 'TabList and TabPanel elements'},
          ]}
        />
      </div>

      <div className={section}>
        <h2>Tab Props</h2>
        <PropsTable
          props={[
            {name: 'value', type: 'string', description: 'Unique value identifying this tab'},
            {name: 'className', type: 'string', description: 'Additional CSS class'},
            {name: 'children', type: 'ReactNode', description: 'Tab label'},
          ]}
        />
      </div>

      <div className={section}>
        <h2>TabPanel Props</h2>
        <PropsTable
          props={[
            {name: 'value', type: 'string', description: 'Matches the corresponding Tab value'},
            {name: 'className', type: 'string', description: 'Additional CSS class'},
            {name: 'children', type: 'ReactNode', description: 'Panel content'},
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Uses <strong>role=&quot;tablist&quot;</strong>, <strong>role=&quot;tab&quot;</strong>, <strong>role=&quot;tabpanel&quot;</strong></li>
            <li>Active tab has <strong>aria-selected=&quot;true&quot;</strong></li>
            <li>Tabs linked to panels via <strong>aria-controls</strong></li>
            <li><strong>Arrow keys</strong> navigate between tabs</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}

// ─── Accordion ─────────────────────────────────────────────────

function AccordionDemo() {
  return (
    <>
      <h1>Accordion</h1>
      <p className={intro}>Collapsible content sections using native &lt;details&gt;/&lt;summary&gt;.</p>

      <div className={section}>
        <h2>Demo</h2>
        <Accordion>
          <AccordionItem title='Section One'>
            Content for section one. This uses the native details/summary elements.
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
            {name: 'exclusive', type: 'boolean', default: 'false', description: 'Only one item open at a time (uses name attribute)'},
            {name: 'className', type: 'string', description: 'Additional CSS class'},
            {name: 'children', type: 'ReactNode', description: 'AccordionItem elements'},
          ]}
        />
      </div>

      <div className={section}>
        <h2>AccordionItem Props</h2>
        <PropsTable
          props={[
            {name: 'title', type: 'ReactNode', description: 'Header text shown in the summary'},
            {name: 'className', type: 'string', description: 'Additional CSS class'},
            {name: 'children', type: 'ReactNode', description: 'Collapsible content'},
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Uses native <strong>&lt;details&gt;</strong>/<strong>&lt;summary&gt;</strong> — built-in keyboard and screen reader support</li>
            <li><strong>Enter</strong>/<strong>Space</strong> toggles open/close</li>
            <li>Exclusive mode uses the HTML <strong>name</strong> attribute for mutual exclusion</li>
          </ul>
        </A11yNote>
      </div>
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
        <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--pbl-space-3)', maxWidth: 480}}>
          <Alert variant='info'>This is an informational alert.</Alert>
          <Alert variant='success'>Operation completed successfully.</Alert>
          <Alert variant='warning'>Please review before proceeding.</Alert>
          <Alert variant='danger'>An error occurred. Please try again.</Alert>
        </div>
      </div>

      <div className={section}>
        <h2>Closable</h2>
        <div style={{maxWidth: 480}}>
          <Alert key={key} variant='info' closable>
            This alert can be dismissed. Click the × button.
          </Alert>
          <Button variant='ghost' size='sm' onClick={() => setKey((k) => k + 1)}>
            Reset
          </Button>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable
          props={[
            {name: 'variant', type: "'info' | 'success' | 'warning' | 'danger'", default: "'info'", description: 'Color variant'},
            {name: 'closable', type: 'boolean', default: 'false', description: 'Show a close button'},
            {name: 'className', type: 'string', description: 'Additional CSS class'},
            {name: 'children', type: 'ReactNode', description: 'Alert content'},
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>Uses <strong>role=&quot;alert&quot;</strong> — announced by screen readers immediately</li>
            <li>Close button has <strong>aria-label=&quot;Close&quot;</strong></li>
            <li>Focus management: close button is keyboard accessible</li>
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
};

export default function ComponentDetail() {
  const {params} = useMatched();
  const name = params.name ?? '';
  const Demo = demos[name];

  return (
    <div x-class={[lightTheme, spacing, typography, page]}>
      {Demo ? <Demo /> : <h1>Component not found: {name}</h1>}
    </div>
  );
}
