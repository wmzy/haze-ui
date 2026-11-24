import { LogViewer } from '@/lib';

import PropsTable from '../PropsTable';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── LogViewer ────────────────────────────────────────────────
export default function LogViewerDemo() {
  const logs = [
    { level: 'debug' as const, message: 'Initializing parser', timestamp: '10:00:00' },
    { level: 'info' as const, message: 'Server started on port 3000', timestamp: '10:00:01' },
    { level: 'info' as const, message: 'Connected to database', timestamp: '10:00:02' },
    { level: 'debug' as const, message: 'Cache warmed up', timestamp: '10:00:03' },
    { level: 'warn' as const, message: 'Cache miss for key: user_123', timestamp: '10:00:05' },
    { level: 'info' as const, message: 'Request completed', timestamp: '10:00:08' },
    { level: 'error' as const, message: 'Failed to fetch external API', timestamp: '10:00:10' },
    { level: 'warn' as const, message: 'Retrying request (1/3)', timestamp: '10:00:11' },
    { level: 'info' as const, message: 'Retry successful', timestamp: '10:00:13' },
  ];

  return (
    <DemoPage
      title='LogViewer'
      description='Structured log viewer with level-based filtering (debug, info, warn, error).'
    >
      <DemoSection title='Demo'>
        <div style={{ maxWidth: 560 }}>
          <LogViewer logs={logs} />
        </div>
      </DemoSection>

      <PropsSection of='LogViewerProps' />

      <DemoSection title='LogEntry Type'>
        <PropsTable of='LogEntry' />
      </DemoSection>

      <AccessibilitySection>
        <ul>
          <li>
            Filter buttons are native <strong>&lt;button&gt;</strong> elements
          </li>
          <li>Level badges use distinct colors for visual differentiation</li>
          <li>
            Scrollable body with <strong>max-height: 24rem</strong>
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='logviewer' />
    </DemoPage>
  );
}
