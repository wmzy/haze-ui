import { useState } from 'react';

import { ConversationList, ConversationItem } from '@/lib';

import PropsTable from '../PropsTable';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
} from './shared';

// ─── ConversationList ─────────────────────────────────────────
export default function ConversationListDemo() {
  const [active, setActive] = useState('chat-1');

  const conversations = [
    { id: 'chat-1', title: 'New Chat', subtitle: 'Start a conversation' },
    { id: 'chat-2', title: 'Project Planning', subtitle: 'Yesterday' },
    { id: 'chat-3', title: 'Code Review', subtitle: '3 days ago' },
    { id: 'chat-4', title: 'Bug Investigation', subtitle: 'Last week' },
  ];

  return (
    <DemoPage
      title='ConversationList'
      description='Sidebar list of conversations with active state and subtitle support.'
    >
      <DemoSection title='Demo'>
        <div
          style={{
            maxWidth: 280,
            border: '1px solid var(--haze-color-border)',
            borderRadius: 'var(--haze-radius-md)',
            overflow: 'hidden',
          }}
        >
          <ConversationList>
            {conversations.map((c) => (
              <ConversationItem
                key={c.id}
                title={c.title}
                subtitle={c.subtitle}
                active={active === c.id}
                onClick={() => setActive(c.id)}
              />
            ))}
          </ConversationList>
        </div>
      </DemoSection>

      <DemoSection title='ConversationList Props'>
        <PropsTable of='ConversationListProps' />
      </DemoSection>

      <DemoSection title='ConversationItem Props'>
        <PropsTable of='ConversationItemProps' />
      </DemoSection>

      <AccessibilitySection>
        <ul>
          <li>
            Active item has <strong>aria-current=&quot;true&quot;</strong>
          </li>
          <li>
            Items render as <strong>&lt;button&gt;</strong> for keyboard
            accessibility
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='conversationlist' />
    </DemoPage>
  );
}
