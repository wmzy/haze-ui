import {css} from '@linaria/core';
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

const page = css`
  padding: var(--pbl-space-8);
  max-width: 960px;

  h1 {
    font-size: var(--pbl-text-3xl);
    font-weight: var(--pbl-weight-bold);
    margin: 0 0 var(--pbl-space-8);
  }
`;

const section = css`
  margin-bottom: var(--pbl-space-10);

  h2 {
    font-size: var(--pbl-text-xl);
    font-weight: var(--pbl-weight-semibold);
    margin: 0 0 var(--pbl-space-4);
    padding-bottom: var(--pbl-space-2);
    border-bottom: 1px solid var(--pbl-color-border);
  }

  h3 {
    font-size: var(--pbl-text-base);
    font-weight: var(--pbl-weight-medium);
    color: var(--pbl-color-text-secondary);
    margin: var(--pbl-space-4) 0 var(--pbl-space-2);
  }
`;

const row = css`
  display: flex;
  align-items: center;
  gap: var(--pbl-space-3);
  flex-wrap: wrap;
  margin-bottom: var(--pbl-space-4);
`;

const fieldRow = css`
  display: flex;
  align-items: center;
  gap: var(--pbl-space-3);
  margin-bottom: var(--pbl-space-4);
  max-width: 320px;
`;

const label = css`
  display: flex;
  align-items: center;
  gap: var(--pbl-space-2);
  font-size: var(--pbl-text-sm);
  color: var(--pbl-color-text);
  cursor: pointer;
`;

function ButtonSection() {
  return (
    <div className={section} id='button'>
      <h2>Button</h2>
      <h3>Variants</h3>
      <div className={row}>
        <Button variant='solid'>Solid</Button>
        <Button variant='outline'>Outline</Button>
        <Button variant='ghost'>Ghost</Button>
      </div>
      <h3>Sizes</h3>
      <div className={row}>
        <Button size='sm'>Small</Button>
        <Button size='md'>Medium</Button>
        <Button size='lg'>Large</Button>
      </div>
    </div>
  );
}

function InputSection() {
  const [, , valueCtrl] = useControl(undefined, '');

  return (
    <div className={section} id='input'>
      <h2>Input</h2>
      <h3>Sizes</h3>
      <div className={fieldRow}><Input size='sm' placeholder='Small' /></div>
      <div className={fieldRow}><Input size='md' placeholder='Medium' /></div>
      <div className={fieldRow}><Input size='lg' placeholder='Large' /></div>
      <h3>Controlled</h3>
      <div className={fieldRow}><Input value={valueCtrl} placeholder='Type here...' /></div>
    </div>
  );
}

function SelectSection() {
  return (
    <div className={section} id='select'>
      <h2>Select</h2>
      <div className={fieldRow}>
        <Select>
          <Option value=''>Choose...</Option>
          <Option value='a'>Option A</Option>
          <Option value='b'>Option B</Option>
        </Select>
      </div>
    </div>
  );
}

function CheckboxSection() {
  return (
    <div className={section} id='checkbox'>
      <h2>Checkbox</h2>
      <div className={row}>
        <label className={label}><Checkbox /> Unchecked</label>
        <label className={label}><Checkbox checked /> Checked</label>
      </div>
    </div>
  );
}

function SwitchSection() {
  return (
    <div className={section} id='switch'>
      <h2>Switch</h2>
      <div className={row}>
        <Switch size='sm' />
        <Switch size='md' />
        <Switch size='lg' />
      </div>
    </div>
  );
}

function BadgeSection() {
  return (
    <div className={section} id='badge'>
      <h2>Badge</h2>
      <div className={row}>
        <Badge variant='default'>Default</Badge>
        <Badge variant='success'>Success</Badge>
        <Badge variant='warning'>Warning</Badge>
        <Badge variant='danger'>Danger</Badge>
        <Badge variant='info'>Info</Badge>
      </div>
    </div>
  );
}

function DialogSection() {
  const [, , openCtrl] = useControl(undefined, false);
  const [, setOpen] = useControl(openCtrl);

  return (
    <div className={section} id='dialog'>
      <h2>Dialog</h2>
      <div className={row}>
        <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      </div>
      <Dialog open={openCtrl} onClose={() => setOpen(false)}>
        <p style={{margin: 0}}>Modal dialog content. Press ESC to close.</p>
        <Button onClick={() => setOpen(false)} size='sm' variant='outline'>Close</Button>
      </Dialog>
    </div>
  );
}

function TooltipSection() {
  return (
    <div className={section} id='tooltip'>
      <h2>Tooltip</h2>
      <div className={row}>
        <Tooltip content='Hello!' position='top'>
          <Button variant='outline'>Hover me</Button>
        </Tooltip>
        <Tooltip content='Right side' position='right'>
          <Button variant='outline'>Right</Button>
        </Tooltip>
      </div>
    </div>
  );
}

function PopoverSection() {
  return (
    <div className={section} id='popover'>
      <h2>Popover</h2>
      <div className={row}>
        <Popover content={<span>Popover content</span>}>
          <Button variant='outline'>Toggle</Button>
        </Popover>
      </div>
    </div>
  );
}

function CardSection() {
  return (
    <div className={section} id='card'>
      <h2>Card</h2>
      <div className={row} style={{alignItems: 'stretch'}}>
        <Card variant='elevated'>
          <strong>Elevated</strong>
          <p style={{margin: '4px 0 0', fontSize: 'var(--pbl-text-sm)', color: 'var(--pbl-color-text-secondary)'}}>Shadow card</p>
        </Card>
        <Card variant='outlined'>
          <strong>Outlined</strong>
          <p style={{margin: '4px 0 0', fontSize: 'var(--pbl-text-sm)', color: 'var(--pbl-color-text-secondary)'}}>Border card</p>
        </Card>
        <Card variant='filled'>
          <strong>Filled</strong>
          <p style={{margin: '4px 0 0', fontSize: 'var(--pbl-text-sm)', color: 'var(--pbl-color-text-secondary)'}}>Background card</p>
        </Card>
      </div>
    </div>
  );
}

function RadioSection() {
  return (
    <div className={section} id='radio'>
      <h2>Radio</h2>
      <RadioGroup>
        <Radio value='a'>Option A</Radio>
        <Radio value='b'>Option B</Radio>
        <Radio value='c'>Option C</Radio>
      </RadioGroup>
    </div>
  );
}

function TextareaSection() {
  return (
    <div className={section} id='textarea'>
      <h2>Textarea</h2>
      <div className={fieldRow}>
        <Textarea placeholder='Write something...' rows={3} />
      </div>
    </div>
  );
}

function SliderSection() {
  return (
    <div className={section} id='slider'>
      <h2>Slider</h2>
      <div className={fieldRow}>
        <Slider min={0} max={100} />
      </div>
    </div>
  );
}

function TabsSection() {
  const [, , tabCtrl] = useControl(undefined, 'a');

  return (
    <div className={section} id='tabs'>
      <h2>Tabs</h2>
      <Tabs value={tabCtrl}>
        <TabList>
          <Tab value='a'>Tab A</Tab>
          <Tab value='b'>Tab B</Tab>
        </TabList>
        <TabPanel value='a'>Panel A content</TabPanel>
        <TabPanel value='b'>Panel B content</TabPanel>
      </Tabs>
    </div>
  );
}

function AccordionSection() {
  return (
    <div className={section} id='accordion'>
      <h2>Accordion</h2>
      <Accordion>
        <AccordionItem title='Section 1'>Content for section 1.</AccordionItem>
        <AccordionItem title='Section 2'>Content for section 2.</AccordionItem>
      </Accordion>
    </div>
  );
}

function AlertSection() {
  return (
    <div className={section} id='alert'>
      <h2>Alert</h2>
      <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--pbl-space-2)', maxWidth: 480}}>
        <Alert variant='info'>Informational alert.</Alert>
        <Alert variant='success'>Success alert.</Alert>
        <Alert variant='warning'>Warning alert.</Alert>
        <Alert variant='danger'>Danger alert.</Alert>
      </div>
    </div>
  );
}

export default function ComponentDoc() {
  return (
    <div x-class={[lightTheme, spacing, typography, page]}>
      <h1>Components</h1>
      <ButtonSection />
      <InputSection />
      <SelectSection />
      <CheckboxSection />
      <SwitchSection />
      <BadgeSection />
      <DialogSection />
      <TooltipSection />
      <PopoverSection />
      <CardSection />
      <RadioSection />
      <TextareaSection />
      <SliderSection />
      <TabsSection />
      <AccordionSection />
      <AlertSection />
    </div>
  );
}
