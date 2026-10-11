import { Avatar, Badge, Button, Indicator, Kbd } from '@/lib';

import PropsTable from '../PropsTable';

import { intro, section, row } from '../styles';

// ─── Indicator ────────────────────────────────────────────────
export default function IndicatorDemo() {
  return (
    <>
      <h1>Indicator</h1>
      <p className={intro}>
        Corner badge attached to a host element (avatar, icon button) —
        the notification-dot affordance. Dot without a label; count with
        one. Tone + corner position + zero semantics.
      </p>

      <div className={section}>
        <h2>Modes</h2>
        <div className={row}>
          <Indicator>
            <Avatar fallback='U' />
          </Indicator>
          <Indicator label={3}>
            <Avatar fallback='U' />
          </Indicator>
          <Indicator label='99+' color='warning'>
            <Avatar fallback='U' />
          </Indicator>
        </div>
      </div>

      <div className={section}>
        <h2>Zero semantics</h2>
        <div className={row}>
          <Indicator label={0}>
            <Badge>hidden by default</Badge>
          </Indicator>
          <Indicator label={0} showZero color='primary'>
            <Badge>showZero</Badge>
          </Indicator>
        </div>
      </div>

      <div className={section}>
        <h2>Position</h2>
        <div className={row}>
          <Indicator label={1} position='top-end'>
            <Button size='sm'>top-end</Button>
          </Indicator>
          <Indicator label={2} position='bottom-end' color='success'>
            <Button size='sm' variant='outline'>bottom-end</Button>
          </Indicator>
          <Indicator label={3} position='top-start' color='primary'>
            <Button size='sm' variant='ghost'>top-start · <Kbd>⌘K</Kbd></Button>
          </Indicator>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of='IndicatorProps' />
      </div>
    </>
  );
}
