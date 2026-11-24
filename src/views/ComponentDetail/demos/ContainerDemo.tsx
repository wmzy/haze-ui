import { Container } from '@/lib';

import {
  AccessibilitySection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── Container ──────────────────────────────────────────────────
export default function ContainerDemo() {
  return (
    <DemoPage
      title='Container'
      description='Centered content container with max-width breakpoints.'
    >
      <DemoSection title='Sizes'>
        {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <div key={size} style={{ marginBottom: 'var(--haze-space-3)' }}>
            <Container size={size}>
              <div style={{ background: 'var(--haze-color-bg-subtle)', padding: 'var(--haze-space-3)', borderRadius: 'var(--haze-radius-md)', textAlign: 'center' }}>
                Size: {size}
              </div>
            </Container>
          </div>
        ))}
      </DemoSection>

      <PropsSection of='ContainerProps' />

      <AccessibilitySection>
        <ul>
          <li>Renders as a plain <strong>&lt;div&gt;</strong></li>
          <li>Purely presentational layout component</li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
