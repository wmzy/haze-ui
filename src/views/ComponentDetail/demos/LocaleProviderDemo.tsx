import { useState } from 'react';

import { useControl } from 'react-use-control';

import { LocaleProvider, Pagination, ChatInput, Empty, defaultStrings  } from '@/lib';



import { fieldRow, codeBlock } from '../styles';

import {
  AccessibilitySection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── LocaleProvider ────────────────────────────────────────────
export default function LocaleProviderDemo() {
  const [zh, setZh] = useState(true);
  const [page, , pageCtrl] = useControl(undefined, 3);

  return (
    <DemoPage
      title='LocaleProvider'
      description={
        <>
          Layered string overrides for every user-visible literal in the
          library. Each component reads its section through
          <code> useStrings</code>; explicit props still win, and nested
          providers override their parents key by key.
        </>
      }
    >
      <DemoSection title='Overriding component copy'>
        <div className={fieldRow}>
          <button onClick={() => setZh((v) => !v)}>
            {zh ? 'Switch to defaults' : 'Switch to 中文'}
          </button>
        </div>
        <LocaleProvider
          strings={
            zh
              ? {
                  pagination: { previous: '上一页', next: '下一页' },
                  chatInput: { send: '发送', placeholder: '输入消息…' },
                }
              : undefined
          }
        >
          <Pagination total={50} pageSize={10} page={pageCtrl} />
          <div className={fieldRow}>
            <span data-testid='page'>page {page}</span>
          </div>
          <ChatInput onSend={() => undefined} />
        </LocaleProvider>
      </DemoSection>

      <DemoSection title='Built-in locales'>
        <p>
          Set <code>locale</code> to switch every component to a bundled
          language pack — <code>&quot;zh-CN&quot;</code> (and any other
          Chinese tag) serves Chinese copy. <code>strings</code> still
          layers on top of the selected pack, and any other locale falls
          back to the English default.
        </p>
        <LocaleProvider
          locale="zh-CN"
          strings={{ empty: { description: '筛选结果为空' } }}
        >
          <Pagination total={50} pageSize={10} />
          <Empty />
        </LocaleProvider>
        <pre className={codeBlock}>{`import { LocaleProvider } from 'haze-ui';

// Built-in pack: every component switches to Chinese copy
<LocaleProvider locale="zh-CN">
  <App />
</LocaleProvider>

// Custom copy still layers on top of the selected pack
<LocaleProvider
  locale="zh-CN"
  strings={{ empty: { description: '筛选结果为空' } }}
>
  <App />
</LocaleProvider>`}</pre>
      </DemoSection>

      <DemoSection title='Usage'>
        <pre className={codeBlock}>{`import { LocaleProvider } from 'haze-ui';

<LocaleProvider
  strings={{
    pagination: { previous: '上一页', next: '下一页' },
    chatInput: { send: '发送' },
  }}
>
  <App />
</LocaleProvider>`}</pre>
      </DemoSection>

      <DemoSection title='Dictionary shape'>
        <pre className={codeBlock}>{Object.keys(defaultStrings).join(', ')}</pre>
      </DemoSection>

      <PropsSection of='LocaleProviderProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Overrides replace aria labels and visible copy alike — keep
            localized labels descriptive for screen reader users
          </li>
          <li>
            Placeholders like <code>{'{count}'}</code> are expanded with
            runtime values, so translations stay plain strings
          </li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
