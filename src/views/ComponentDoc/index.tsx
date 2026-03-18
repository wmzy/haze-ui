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
      <h3>Disabled</h3>
      <div className={row}>
        <Button disabled>Disabled Solid</Button>
        <Button variant='outline' disabled>Disabled Outline</Button>
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
      <div className={fieldRow}>
        <Input size='sm' placeholder='Small' />
      </div>
      <div className={fieldRow}>
        <Input size='md' placeholder='Medium' />
      </div>
      <div className={fieldRow}>
        <Input size='lg' placeholder='Large' />
      </div>
      <h3>Controlled</h3>
      <div className={fieldRow}>
        <Input value={valueCtrl} placeholder='Type here...' />
      </div>
      <h3>Disabled</h3>
      <div className={fieldRow}>
        <Input disabled placeholder='Disabled' />
      </div>
    </div>
  );
}

function SelectSection() {
  return (
    <div className={section} id='select'>
      <h2>Select</h2>
      <h3>Sizes</h3>
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
      <h3>Disabled</h3>
      <div className={fieldRow}>
        <Select disabled>
          <Option value=''>Disabled</Option>
        </Select>
      </div>
    </div>
  );
}

function CheckboxSection() {
  return (
    <div className={section} id='checkbox'>
      <h2>Checkbox</h2>
      <h3>Default</h3>
      <div className={row}>
        <label className={label}>
          <Checkbox /> Unchecked
        </label>
        <label className={label}>
          <Checkbox checked /> Checked
        </label>
      </div>
      <h3>Disabled</h3>
      <div className={row}>
        <label className={label}>
          <Checkbox disabled /> Disabled
        </label>
        <label className={label}>
          <Checkbox checked disabled /> Checked Disabled
        </label>
      </div>
    </div>
  );
}

function SwitchSection() {
  return (
    <div className={section} id='switch'>
      <h2>Switch</h2>
      <h3>Sizes</h3>
      <div className={row}>
        <Switch size='sm' />
        <Switch size='md' />
        <Switch size='lg' />
      </div>
      <h3>Disabled</h3>
      <div className={row}>
        <Switch disabled />
        <Switch checked disabled />
      </div>
    </div>
  );
}

function BadgeSection() {
  return (
    <div className={section} id='badge'>
      <h2>Badge</h2>
      <h3>Variants</h3>
      <div className={row}>
        <Badge variant='default'>Default</Badge>
        <Badge variant='success'>Success</Badge>
        <Badge variant='warning'>Warning</Badge>
        <Badge variant='danger'>Danger</Badge>
        <Badge variant='info'>Info</Badge>
      </div>
      <h3>Sizes</h3>
      <div className={row}>
        <Badge size='sm'>Small</Badge>
        <Badge size='md'>Medium</Badge>
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
    </div>
  );
}
