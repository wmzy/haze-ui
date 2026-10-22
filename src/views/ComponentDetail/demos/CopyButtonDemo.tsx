import { CopyButton, Snippet } from '@/lib/components/CopyButton';
import VisuallyHidden from '@/lib/components/VisuallyHidden/VisuallyHidden';

import PropsTable from '../PropsTable';

import A11yNote from '../A11yNote';

import { intro, section, row, fieldRow } from '../styles';

import { CssVarsSection } from './shared';

// ─── CopyButton / Snippet ──────────────────────────────────────
export default function CopyButtonDemo() {
  return (
    <>
      <h1>CopyButton</h1>
      <p className={intro}>
        一键复制按钮：点击把 <code>value</code>（或 <code>getValue()</code>{' '}
        的求值结果）写入剪贴板，随后进入 2 秒（<code>copiedTimeout</code>）的
        「已复制」态——图标从复制换成对勾、可访问名从 Copy 换成 Copied，并用一个
        视觉隐藏的 <code>role='status'</code> 向读屏播报状态变化。皮肤就是{' '}
        <code>Button</code>（含 ConfigProvider 的尺寸默认层级）。
        <code>Snippet</code> 是它的代码片段形态：等宽内容格 + 尾部停靠的小号复制按钮。
      </p>

      <div className={section}>
        <h2>Basic</h2>
        <div className={fieldRow}>
          <CopyButton value="pnpm add haze-ui" aria-label="复制安装命令" />
          <CopyButton value="copied text" size="sm" aria-label="复制（小）" />
          <CopyButton value="copied text" size="lg" aria-label="复制（大）" />
        </div>
      </div>

      <div className={section}>
        <h2>Variants &amp; labels</h2>
        <div className={fieldRow}>
          <CopyButton value="outline" variant="outline" aria-label="复制（描边）" />
          <CopyButton value="solid" variant="solid" aria-label="复制（实心）" />
          <CopyButton value="ghost" variant="ghost" aria-label="复制（幽灵）" />
          <CopyButton value="labeled" square={false} aria-label="复制（带文案）">
            {(copied) => (copied ? '已复制！' : '复制我')}
          </CopyButton>
        </div>
      </div>

      <div className={section}>
        <h2>Lazy value (getValue)</h2>
        <div className={row}>
          <CopyButton
            getValue={() => `captured at ${new Date().toISOString()}`}
            aria-label="复制当前时间戳"
          />
          <CopyButton
            getValue={() => window.location.href}
            variant="ghost"
            aria-label="复制当前页面地址"
          >
            {(copied) => (copied ? '地址已复制' : '复制本页地址')}
          </CopyButton>
        </div>
      </div>

      <div className={section}>
        <h2>Snippet</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--haze-space-3)', alignItems: 'flex-start' }}>
          <Snippet value="pnpm add haze-ui" />
          <Snippet value="https://haze-ui.dev/docs/getting-started" />
          <Snippet value="sk-live-9f2b7c4e-8a1d-4e6f-b3c2-1a9d8e7f6c5b">
            <span aria-hidden="true">sk-live-••••••••6c5b</span>
            <VisuallyHidden>sk-live 开头的密钥，已隐藏</VisuallyHidden>
          </Snippet>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of="CopyButtonProps" />
        <PropsTable of="SnippetProps" />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              A real <strong>&lt;button&gt;</strong> (Button&apos;s skin): keyboard
              and focus work out of the box
            </li>
            <li>
              Accessible name swaps <strong>Copy → Copied</strong> with the state;
              a visually hidden <strong>role=&quot;status&quot;</strong> announces
              the transition (WCAG 4.1.3)
            </li>
            <li>
              <code>copyLabel</code>/<code>copiedLabel</code> rename both states
              (e.g. for i18n)
            </li>
            <li>
              Snippet&apos;s clipboard payload is always <code>value</code> — the
              masked <code>children</code> never reach the clipboard
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component="copy-button" />
    </>
  );
}
