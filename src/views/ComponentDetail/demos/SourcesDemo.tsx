import { Sources } from '@/lib/components/Sources';

import { intro } from '../styles';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── Sources ──────────────────────────────────────────────────
const ragItems = [
  {
    id: 'tokens',
    title: 'Design tokens guide',
    url: 'https://example.com/design-tokens',
    snippet:
      'Every component reads its visual values from --haze-* custom properties, so a theme is just a token layer.',
  },
  {
    id: 'floating',
    title: 'CSS anchor positioning notes',
    url: 'https://example.com/anchor-positioning',
    snippet: 'Logical position-area values must spell out both axes.',
  },
  {
    id: 'internal',
    title: 'Internal review checklist',
    snippet: 'Unlinked sources render as plain text with no anchor.',
  },
];

export default function SourcesDemo() {
  return (
    <DemoPage
      title='Sources'
      description={
        <>
          Numbered citation list for RAG answers: ordered entries with badge,
          title link and an expandable excerpt, plus a compact footnote form.
        </>
      }
    >
      <DemoSection title='Full list'>
        <div style={{ maxWidth: 520 }}>
          <Sources items={ragItems} />
        </div>
        <p className={intro}>
          Hover or focus an entry to peek its excerpt; the chevron keeps it
          expanded.
        </p>
      </DemoSection>

      <DemoSection title='Pre-expanded entries'>
        <div style={{ maxWidth: 520 }}>
          <Sources items={ragItems} expanded={['tokens']} />
        </div>
      </DemoSection>

      <DemoSection title='Compact footnotes'>
        <p className={intro}>
          Answer text ends with <Sources items={ragItems} compact /> inline.
        </p>
      </DemoSection>

      <PropsSection of='SourcesProps' />

      <AccessibilitySection>
        <ul>
          <li>Semantic ordered list (compact form: a named nav landmark)</li>
          <li>
            External links open in a new tab with{' '}
            <code>rel=&quot;noopener noreferrer&quot;</code>
          </li>
          <li>
            Excerpt toggles carry <code>aria-expanded</code> /{' '}
            <code>aria-controls</code>; hover-revealed excerpts stay in the
            accessibility tree only while visible
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='sources' />
    </DemoPage>
  );
}
