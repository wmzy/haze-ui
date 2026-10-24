import { useState } from 'react';

import { Button, Tag } from '@/lib';

import PropsTable from '../PropsTable';

import A11yNote from '../A11yNote';

import { intro, section, row } from '../styles';

import { CssVarsSection } from './shared';

// ─── Tag ───────────────────────────────────────────────────────
export default function TagDemo() {
  const [tags, setTags] = useState(['React', 'TypeScript', 'Linaria']);

  return (
    <>
      <h1>Tag</h1>
      <p className={intro}>
        Interactive labels for categorization and filtering.
      </p>

      <div className={section}>
        <h2>Colors</h2>
        <div className={row}>
          <Tag color='default'>Default</Tag>
          <Tag color='primary'>Primary</Tag>
          <Tag color='success'>Success</Tag>
          <Tag color='warning'>Warning</Tag>
          <Tag color='danger'>Danger</Tag>
          <Tag color='info'>Info</Tag>
        </div>
      </div>

      <div className={section}>
        <h2>Closable</h2>
        <div className={row}>
          {tags.map((t) => (
            <Tag
              key={t}
              closable
              onClose={() => setTags((prev) => prev.filter((x) => x !== t))}
            >
              {t}
            </Tag>
          ))}
          {tags.length === 0 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setTags(['React', 'TypeScript', 'Linaria'])}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      <div className={section}>
        <h2>Clickable tag links (as)</h2>
        <p
          style={{
            fontSize: 'var(--haze-text-sm)',
            color: 'var(--haze-color-text-secondary)',
            margin: '0 0 var(--haze-space-3)',
          }}
        >
          <code>as=&#123;'a'&#125;</code> renders the tag as a native{' '}
          <code>&lt;a&gt;</code>: <code>href</code>, <code>target</code> and
          the rest of the anchor surface flow through, with the UA
          underline reset so the tag looks identical to the{' '}
          <code>span</code> form. Don't combine an interactive{' '}
          <code>as</code> with <code>closable</code> — the remove button
          would nest inside a link (invalid HTML).
        </p>
        <div className={row}>
          <Tag as='a' href='#tag'>React</Tag>
          <Tag as='a' href='#tag' color='primary'>TypeScript</Tag>
          <Tag as='a' href='#tag' color='success' size='sm'>Linaria</Tag>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of='TagProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Close button has <strong>aria-label=&quot;Remove&quot;</strong>
            </li>
            <li>
              Close button is keyboard accessible via <strong>Tab</strong> +{' '}
              <strong>Enter</strong>
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='tag' />
    </>
  );
}
