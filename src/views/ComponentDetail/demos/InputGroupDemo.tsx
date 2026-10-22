import { Button, Input, Select } from '@/lib';
import { InputGroup, InputGroupAddon } from '@/lib/components/InputGroup';

import PropsTable from '../PropsTable';

import { intro, section, fieldRow } from '../styles';

// ─── InputGroup ────────────────────────────────────────────────
export default function InputGroupDemo() {
  return (
    <>
      <h1>InputGroup</h1>
      <p className={intro}>
        输入组合：前缀/后缀 <code>InputGroupAddon</code>（图标、文本）与
        <code>Input</code>/<code>Select</code> 在 CSS 层合体为一个控件——外沿
        圆角保留、内侧圆角与边缝抑制，addon 自带底色与边框区分。组合层零
        状态：字段值的受控/非受控完全由字段自己定义；尾部还可以直接挂一个
        <code>Button</code>（搜索框的经典形态）。请给字段本身{' '}
        <code>aria-label</code>，addon 文案会留在可访问树里作为语义前缀。
      </p>

      <div className={section}>
        <h2>Search box</h2>
        <InputGroup>
          <InputGroupAddon>
            <span aria-hidden='true'>🔍</span>
          </InputGroupAddon>
          <Input aria-label='搜索组件' placeholder='搜索组件…' />
          <Button>搜索</Button>
        </InputGroup>
      </div>

      <div className={section}>
        <h2>Text prefixes &amp; suffixes</h2>
        <InputGroup>
          <InputGroupAddon>https://</InputGroupAddon>
          <Input aria-label='域名' placeholder='example' />
          <InputGroupAddon>.dev</InputGroupAddon>
        </InputGroup>
      </div>

      <div className={section}>
        <h2>With Select</h2>
        <InputGroup>
          <InputGroupAddon>范围</InputGroupAddon>
          <Select aria-label='统计范围'>
            <option value='org'>整个组织</option>
            <option value='team'>当前团队</option>
            <option value='user'>仅我自己</option>
          </Select>
        </InputGroup>
      </div>

      <div className={section}>
        <h2>Sizes</h2>
        <div className={fieldRow}>
          <InputGroup size='sm'>
            <InputGroupAddon>¥</InputGroupAddon>
            <Input aria-label='小尺寸金额' placeholder='0.00' />
          </InputGroup>
          <InputGroup size='md'>
            <InputGroupAddon>¥</InputGroupAddon>
            <Input aria-label='中尺寸金额' placeholder='0.00' />
          </InputGroup>
          <InputGroup size='lg'>
            <InputGroupAddon>¥</InputGroupAddon>
            <Input aria-label='大尺寸金额' placeholder='0.00' />
          </InputGroup>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of='InputGroupProps' />
        <PropsTable of='InputGroupAddonProps' />
      </div>
    </>
  );
}
