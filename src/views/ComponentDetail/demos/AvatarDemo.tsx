import { Avatar } from '@/lib';

import { row } from '../styles';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── Avatar ────────────────────────────────────────────────────
export default function AvatarDemo() {
  return (
    <DemoPage
      title='Avatar'
      description='Circular image container with fallback support.'
    >
      <DemoSection title='Sizes'>
        <div className={row}>
          <Avatar size='sm' src='https://i.pravatar.cc/64?u=a' alt='Alice' />
          <Avatar size='md' src='https://i.pravatar.cc/80?u=b' alt='Bob' />
          <Avatar size='lg' src='https://i.pravatar.cc/112?u=c' alt='Carol' />
        </div>
      </DemoSection>

      <DemoSection title='Fallback'>
        <div className={row}>
          <Avatar size='md' alt='Dave' />
          <Avatar size='md' fallback='🎨' />
        </div>
      </DemoSection>

      <PropsSection of='AvatarProps' />

      <AccessibilitySection>
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
      </AccessibilitySection>

      <CssVarsSection component='avatar' />
    </DemoPage>
  );
}
