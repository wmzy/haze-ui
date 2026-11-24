import { Avatar, AvatarGroup } from '@/lib';

import { row } from '../styles';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── AvatarGroup ───────────────────────────────────────────────
export default function AvatarGroupDemo() {
  return (
    <DemoPage
      title='AvatarGroup'
      description='Overlapping avatar stack with an overflow counter for large teams.'
    >
      <DemoSection title='Basic stack'>
        <div className={row}>
          <AvatarGroup>
            <Avatar src='https://i.pravatar.cc/64?u=a' alt='Alice' />
            <Avatar src='https://i.pravatar.cc/64?u=b' alt='Bob' />
            <Avatar src='https://i.pravatar.cc/64?u=c' alt='Carol' />
          </AvatarGroup>
        </div>
      </DemoSection>

      <DemoSection title='Max with overflow counter'>
        <div className={row}>
          <AvatarGroup max={3}>
            <Avatar src='https://i.pravatar.cc/64?u=a' alt='Alice' />
            <Avatar src='https://i.pravatar.cc/64?u=b' alt='Bob' />
            <Avatar src='https://i.pravatar.cc/64?u=c' alt='Carol' />
            <Avatar src='https://i.pravatar.cc/64?u=d' alt='Dave' />
            <Avatar src='https://i.pravatar.cc/64?u=e' alt='Eve' />
          </AvatarGroup>
        </div>
      </DemoSection>

      <DemoSection title='Total override'>
        <p>
          When the full set is virtualized or paginated, pass{' '}
          <code>total</code> to display it instead of the rendered remainder.
        </p>
        <div className={row}>
          <AvatarGroup max={2} total={99}>
            <Avatar src='https://i.pravatar.cc/64?u=a' alt='Alice' />
            <Avatar src='https://i.pravatar.cc/64?u=b' alt='Bob' />
            <Avatar src='https://i.pravatar.cc/64?u=c' alt='Carol' />
            <Avatar src='https://i.pravatar.cc/64?u=d' alt='Dave' />
            <Avatar src='https://i.pravatar.cc/64?u=e' alt='Eve' />
          </AvatarGroup>
        </div>
      </DemoSection>

      <DemoSection title='Sizes follow the stacked avatars'>
        <div className={row}>
          <AvatarGroup max={3}>
            <Avatar size='lg' src='https://i.pravatar.cc/112?u=a' alt='Alice' />
            <Avatar size='lg' src='https://i.pravatar.cc/112?u=b' alt='Bob' />
            <Avatar size='lg' src='https://i.pravatar.cc/112?u=c' alt='Carol' />
            <Avatar size='lg' src='https://i.pravatar.cc/112?u=d' alt='Dave' />
          </AvatarGroup>
        </div>
      </DemoSection>

      <PropsSection of='AvatarGroupProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Add <strong>aria-label</strong> to describe the group, e.g.
            aria-label=&quot;Team members&quot;
          </li>
          <li>
            The overflow chip exposes its count as text (“+2”), readable by
            screen readers
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='avatarGroup' />
    </DemoPage>
  );
}
