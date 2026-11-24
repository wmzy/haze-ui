// Wave 3 (component depth B) — demo not yet registered in the docs route
// table; switch this import to `@/lib` once Descriptions lands in the
// barrel (Wave 5 wiring).
import { Descriptions } from '@/lib/components/Descriptions';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  maxWidth640,
  PropsSection,
} from './shared';

// ─── Descriptions ─────────────────────────────────────────────
export default function DescriptionsDemo() {
  return (
    <DemoPage
      title='Descriptions'
      description={
        <>
          Data-driven key/value list on a CSS Grid — semantic <code>dl/dt/dd</code>{' '}
          markup with column spanning, a bordered variant and two densities.
        </>
      }
    >
      <DemoSection title='Basic'>
        <div style={maxWidth640}>
          <Descriptions
            title="Package info"
            items={[
              { key: 'name', label: 'Name', children: 'haze-ui' },
              { key: 'version', label: 'Version', children: '1.13.0' },
              { key: 'license', label: 'License', children: 'MIT' },
              { key: 'url', label: 'Homepage', children: 'https://haze-ui.dev' },
              { key: 'keywords', label: 'Keywords', children: 'react, ui, linaria' },
              { key: 'downloads', label: 'Downloads', children: '24,180 / month' },
            ]}
          />
        </div>
      </DemoSection>

      <DemoSection title='Bordered with spans'>
        <p>
          <code>span</code> is measured in description columns: the audit note
          below stretches across all three columns.
        </p>
        <div style={maxWidth640}>
          <Descriptions
            bordered
            items={[
              { key: 'user', label: 'User', children: 'zhang@example.com' },
              { key: 'plan', label: 'Plan', children: 'Team (annual)' },
              { key: 'seats', label: 'Seats', children: '12' },
              {
                key: 'note',
                label: 'Audit note',
                children: 'Billing owner transferred to platform team on 2026-09-01.',
                span: 3,
              },
              { key: 'region', label: 'Region', children: 'ap-northeast-1' },
              {
                key: 'quota',
                label: 'Quota',
                children: 'Unlimited builds',
                span: 2,
              },
            ]}
          />
        </div>
      </DemoSection>

      <DemoSection title='Compact size'>
        <div style={maxWidth640}>
          <Descriptions
            bordered
            size="sm"
            columns={2}
            items={[
              { key: 'cpu', label: 'CPU', children: '8 vCPU' },
              { key: 'mem', label: 'Memory', children: '32 GiB' },
              { key: 'disk', label: 'Disk', children: '512 GiB NVMe' },
              { key: 'net', label: 'Network', children: '10 Gbps' },
            ]}
          />
        </div>
      </DemoSection>

      <PropsSection of='DescriptionsProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Rendered as a definition list (<code>dl</code> with{' '}
            <code>dt</code>/<code>dd</code> pairs) — the semantic match for
            name→value groups, announced as a description list instead of a
            data table
          </li>
          <li>
            No interactive elements — the component is purely presentational
          </li>
          <li>Long values wrap (<code>overflow-wrap: anywhere</code>)</li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component="descriptions" />
    </DemoPage>
  );
}
