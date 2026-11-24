import { Button, Fieldset, Input } from '@/lib';

import { DemoPage, DemoSection, PropsSection } from './shared';

// ─── Fieldset ─────────────────────────────────────────────────
export default function FieldsetDemo() {
  return (
    <DemoPage
      title='Fieldset'
      description={
        <>
          Semantic <code>&lt;fieldset&gt;</code> +{' '}
          <code>&lt;legend&gt;</code> grouping skinned with tokens — screen
          readers name the whole group from the legend; native{' '}
          <code>disabled</code> disables every control inside at once.
        </>
      }
    >
      <DemoSection title='Basic'>
        <Fieldset legend='Shipping address'>
          <Input aria-label='Street' placeholder='街道' />
          <Input aria-label='City' placeholder='城市' />
          <Button>保存地址</Button>
        </Fieldset>
      </DemoSection>

      <DemoSection title='Disabled group'>
        <Fieldset legend='Payment (disabled)' disabled>
          <Input aria-label='Card number' placeholder='卡号' />
          <Button>支付</Button>
        </Fieldset>
      </DemoSection>

      <PropsSection of='FieldsetProps' />
    </DemoPage>
  );
}
