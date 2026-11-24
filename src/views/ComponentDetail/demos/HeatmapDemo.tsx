import { Heatmap } from '@/lib/components/Heatmap';

import { row } from '../styles';

import {
  AccessibilitySection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// Deterministic pseudo-activity over the first 120 days of 2026 — a
// fixed wave pattern, no Math.random (stable demo source + snapshots).
const demoData = Array.from({ length: 120 }, (_, index) => {
  const date = new Date(Date.UTC(2026, 0, 1 + index))
    .toISOString()
    .slice(0, 10);
  const weekend = [0, 6].includes(new Date(Date.UTC(2026, 0, 1 + index)).getUTCDay());
  const value = weekend ? (index * 3) % 3 : ((index * 7) % 13) % 5;
  return { date, value };
});

// ─── Heatmap ─────────────────────────────────────────────────────
export default function HeatmapDemo() {
  return (
    <DemoPage
      title='Heatmap'
      description={
        <>
          GitHub-style activity calendar: week columns × weekday rows,
          intensity-binned by value against the data's maximum.
        </>
      }
    >
      <DemoSection title='Demo'>
        <div className={row}>
          <Heatmap
            data={demoData}
            summary='Activity over the first 120 days of 2026'
            getLabel={({ date, value }) =>
              `${value === 0 ? 'No activity' : `${value} activities`} on ${date}`
            }
          />
        </div>
      </DemoSection>

      <DemoSection title='Custom levels and labels'>
        <div className={row}>
          <Heatmap
            data={demoData}
            levels={7}
            summary='Seven intensity bins with Chinese labels'
            getLabel={({ date, value }) => `${date}：${value} 条动态`}
            getMonthLabel={(month) => `${month + 1}月`}
            getWeekdayLabel={(weekday) => ['日', '一', '二', '三', '四', '五', '六'][weekday] ?? ''}
          />
        </div>
      </DemoSection>

      <DemoSection title='Record data shape'>
        <div className={row}>
          <Heatmap
            data={{ '2026-02-02': 3, '2026-02-03': 1, '2026-02-06': 5 }}
            startDate='2026-02-01'
            endDate='2026-02-28'
            summary='February activity'
          />
        </div>
      </DemoSection>

      <PropsSection of='HeatmapProps' />

      <AccessibilitySection>
        <ul>
          <li>The calendar is a single <strong>role=&quot;img&quot;</strong> named by the <code>summary</code> prop — one announcement instead of hundreds of squares</li>
          <li>Each day square carries a native <strong>title</strong> tooltip from <code>getLabel</code>, plus <code>data-date</code> / <code>data-level</code> for custom tooltip wiring</li>
          <li>Intensity bins map onto <code>color-mix()</code> of the theme's primary and subtle background — light, dark and brand themes follow automatically</li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
