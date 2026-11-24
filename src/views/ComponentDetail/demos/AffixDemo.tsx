import {
  AccessibilitySection,
  DemoPage,
  DemoSection,
  hintStyle,
  PropsSection,
} from './shared';

// ─── Affix ──────────────────────────────────────────────────────
export default function AffixDemo() {
  return (
    <DemoPage
      title='Affix'
      description='Fixed position element relative to the viewport.'
    >
      <DemoSection title='Demo'>
        <p style={hintStyle}>
          Affix positions children fixed to the viewport. Use <code>position</code> to set top or bottom, and <code>offset</code> for pixel offset.
        </p>
      </DemoSection>

      <PropsSection of='AffixProps' />

      <AccessibilitySection>
        <ul>
          <li>Uses CSS <strong>position: fixed</strong> with <strong>z-index: 100</strong></li>
          <li>Purely presentational wrapper</li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
