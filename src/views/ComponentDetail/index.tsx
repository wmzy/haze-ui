import type { ReactNode } from 'react';

import { css } from '@linaria/core';
import { useMatched } from '@native-router/react';
import { useControl } from 'react-use-control';

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
  margin-bottom: var(--pbl-space-6);

  h2 {
    font-size: var(--pbl-text-lg);
    font-weight: var(--pbl-weight-medium);
    color: var(--pbl-color-text-secondary);
    margin: 0 0 var(--pbl-space-3);
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
  max-width: 320px;
  margin-bottom: var(--pbl-space-4);
`;

const labelStyle = css`
  display: flex;
  align-items: center;
  gap: var(--pbl-space-2);
  font-size: var(--pbl-text-sm);
  color: var(--pbl-color-text);
  cursor: pointer;
`;

function ButtonDemo() {
  return (
    <>
      <h1>Button</h1>
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
          <Button variant='outline' disabled>
            Disabled Outline
          </Button>
          <Button variant='ghost' disabled>
            Disabled Ghost
          </Button>
        </div>
      </div>
    </>
  );
}

function InputDemo() {
  return (
    <>
      <h1>Input</h1>
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
        <h2>Controlled</h2>
        <div className={fieldRow}>
          <Input placeholder='Type here...' />
        </div>
      </div>
      <div className={section}>
        <h2>Disabled</h2>
        <div className={fieldRow}>
          <Input disabled placeholder='Disabled' />
        </div>
      </div>
    </>
  );
}

function SelectDemo() {
  return (
    <>
      <h1>Select</h1>
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
    </>
  );
}

function CheckboxDemo() {
  return (
    <>
      <h1>Checkbox</h1>
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
    </>
  );
}

function SwitchDemo() {
  return (
    <>
      <h1>Switch</h1>
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
    </>
  );
}

function BadgeDemo() {
  return (
    <>
      <h1>Badge</h1>
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
    </>
  );
}

const demos: Record<string, () => ReactNode> = {
  button: ButtonDemo,
  input: InputDemo,
  select: SelectDemo,
  checkbox: CheckboxDemo,
  switch: SwitchDemo,
  badge: BadgeDemo,
};

export default function ComponentDetail() {
  const { params } = useMatched();
  const name = params.name ?? '';
  const Demo = demos[name];

  return (
    <div x-class={[lightTheme, spacing, typography, page]}>
      {Demo ? <Demo /> : <h1>Component not found: {name}</h1>}
    </div>
  );
}
