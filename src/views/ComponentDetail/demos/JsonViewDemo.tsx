// Wave 3 (component depth B) — demo not yet registered in the docs route
// table; switch this import to `@/lib` once JsonView lands in the barrel
// (Wave 5 wiring).
import { JsonView } from '@/lib/components/JsonView';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  maxWidth640,
  PropsSection,
} from './shared';

const release = {
  name: 'haze-ui',
  version: '1.13.0',
  stable: true,
  stars: 1280,
  maintainers: ['zhang', 'li'],
  links: { repo: 'https://github.com/haze-ui/haze-ui', docs: null },
  tags: ['react', 'linaria', 'oklch'],
};

const bigPayload = Array.from({ length: 150 }, (_, i) => ({
  id: i,
  label: `entry-${i}`,
}));

// ─── JsonView ─────────────────────────────────────────────────
export default function JsonViewDemo() {
  return (
    <DemoPage
      title='JsonView'
      description={
        <>
          Recursive JSON tree with collapsible branches, per-type value coloring
          and copy support — useful for inspecting tool payloads and API
          responses.
        </>
      }
    >
      <DemoSection title='Demo'>
        <div style={maxWidth640}>
          <JsonView data={release} copyable />
        </div>
      </DemoSection>

      <DemoSection title='Collapsed by depth'>
        <p>
          <code>defaultExpandedDepth</code> controls the initial disclosure —
          nodes at or beyond that depth start collapsed and expand on click.
        </p>
        <div style={maxWidth640}>
          <JsonView data={release} defaultExpandedDepth={1} />
        </div>
      </DemoSection>

      <DemoSection title='Large collections'>
        <p>
          Collections beyond 100 entries render their head plus a &ldquo;+N
          more&rdquo; hint instead of flooding the DOM.
        </p>
        <div style={maxWidth640}>
          <JsonView data={bigPayload} defaultExpandedDepth={0} />
        </div>
      </DemoSection>

      <PropsSection of='JsonViewProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Each branch toggle is a native <code>&lt;button&gt;</code> with{' '}
            <code>aria-expanded</code> (and <code>aria-controls</code> while
            expanded) — keyboard operable out of the box
          </li>
          <li>
            Value colors carry meaning redundantly — the literal text
            (<code>true</code>, <code>null</code>, quotes on strings) always
            identifies the type, never color alone
          </li>
          <li>
            Copy button exposes its action through{' '}
            <code>aria-label</code> and shows a check glyph on success
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component="jsonview" />
    </DemoPage>
  );
}
