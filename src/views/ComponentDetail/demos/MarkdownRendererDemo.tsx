import { MarkdownRenderer } from '@/lib';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── MarkdownRenderer ─────────────────────────────────────────
export default function MarkdownRendererDemo() {
  const md = `## Hello World

This is **bold** and *italic* text.

- Item one
- Item two
- Item three

\`\`\`js
console.log("Hello from code block");
\`\`\`

> This is a blockquote.`;

  return (
    <DemoPage
      title='MarkdownRenderer'
      description={
        <>
          Renders markdown content to styled HTML with headings, lists, code
          blocks, and more.
        </>
      }
    >
      <DemoSection title='Demo'>
        <div
          style={{
            maxWidth: 480,
            border: '1px solid var(--haze-color-border)',
            borderRadius: 'var(--haze-radius-md)',
            padding: 'var(--haze-space-4)',
          }}
        >
          <MarkdownRenderer content={md} />
        </div>
      </DemoSection>

      <PropsSection of='MarkdownRendererProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Renders semantic HTML: <strong>&lt;h1&gt;</strong>-<strong>&lt;h6&gt;</strong>,{' '}
            <strong>&lt;ul&gt;</strong>, <strong>&lt;ol&gt;</strong>,{' '}
            <strong>&lt;blockquote&gt;</strong>
          </li>
          <li>
            Links open in new tab with <strong>rel=&quot;noopener&quot;</strong>
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='markdownrenderer' />
    </DemoPage>
  );
}
