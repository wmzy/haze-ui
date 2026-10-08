import { Button, Fieldset, Input } from '@/lib';

import PropsTable from '../PropsTable';

import { intro, section } from '../styles';

// ─── Fieldset ─────────────────────────────────────────────────
export default function FieldsetDemo() {
  return (
    <>
      <h1>Fieldset</h1>
      <p className={intro}>
        Semantic <code>&lt;fieldset&gt;</code> +{' '}
        <code>&lt;legend&gt;</code> grouping skinned with tokens — screen
        readers name the whole group from the legend; native{' '}
        <code>disabled</code> disables every control inside at once.
      </p>

      <div className={section}>
        <h2>Basic</h2>
        <Fieldset legend='Shipping address'>
          <Input aria-label='Street' placeholder='街道' />
          <Input aria-label='City' placeholder='城市' />
          <Button>保存地址</Button>
        </Fieldset>
      </div>

      <div className={section}>
        <h2>Disabled group</h2>
        <Fieldset legend='Payment (disabled)' disabled>
          <Input aria-label='Card number' placeholder='卡号' />
          <Button>支付</Button>
        </Fieldset>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of='FieldsetProps' />
      </div>
    </>
  );
}
