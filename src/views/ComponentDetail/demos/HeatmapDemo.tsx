import { Heatmap } from '@/lib/components/Heatmap';

import PropsTable from '../PropsTable';

import A11yNote from '../A11yNote';

import { intro, section, row } from '../styles';

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
    <>
      <h1>Heatmap</h1>
      <p className={intro}>
        GitHub-style activity calendar: week columns × weekday rows,
        intensity-binned by value against the data's maximum.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div className={row}>
          <Heatmap
            data={demoData}
            summary='Activity over the first 120 days of 2026'
            getLabel={({ date, value }) =>
              `${value === 0 ? 'No activity' : `${value} activities`} on ${date}`
            }
          />
        </div>
      </div>

      <div className={section}>
        <h2>Custom levels and labels</h2>
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
      </div>

      <div className={section}>
        <h2>Record data shape</h2>
        <div className={row}>
          <Heatmap
            data={{ '2026-02-02': 3, '2026-02-03': 1, '2026-02-06': 5 }}
            startDate='2026-02-01'
            endDate='2026-02-28'
            summary='February activity'
          />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of='HeatmapProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>The calendar is a single <strong>role=&quot;img&quot;</strong> named by the <code>summary</code> prop — one announcement instead of hundreds of squares</li>
            <li>Each day square carries a native <strong>title</strong> tooltip from <code>getLabel</code>, plus <code>data-date</code> / <code>data-level</code> for custom tooltip wiring</li>
            <li>Intensity bins map onto <code>color-mix()</code> of the theme's primary and subtle background — light, dark and brand themes follow automatically</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}
