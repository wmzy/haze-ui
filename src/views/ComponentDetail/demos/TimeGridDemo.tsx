import { useState } from 'react';

import { TimeGrid } from '@/lib/components/TimeGrid';

import PropsTable from '../PropsTable';

import A11yNote from '../A11yNote';

import { intro, section, row } from '../styles';

// ─── TimeGrid ────────────────────────────────────────────────────
export default function TimeGridDemo() {
  const [picked, setPicked] = useState('');

  return (
    <>
      <h1>TimeGrid</h1>
      <p className={intro}>
        Single-select grid of time slots generated from a window and a
        step — arrow keys roam and select, one tab stop per grid.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <div className={row}>
          <TimeGrid
            aria-label='Meeting time'
            from='09:00'
            to='18:00'
            step={60}
            onChange={setPicked}
            name='meeting'
          />
        </div>
        <p>Picked: {picked || '—'}</p>
      </div>

      <div className={section}>
        <h2>Step and columns</h2>
        <div className={row}>
          <TimeGrid aria-label='Shift start' from='08:00' to='12:00' step={30} columns={3} />
        </div>
      </div>

      <div className={section}>
        <h2>Disabled slots and 12-hour labels</h2>
        <div className={row}>
          <TimeGrid
            aria-label='Lunch slot'
            from='11:00'
            to='15:00'
            step={60}
            disabledValues={['12:00', '13:00']}
            formatLabel={(value) => {
              const [hours, minutes] = value.split(':').map(Number);
              const hour12 = hours! % 12 === 0 ? 12 : hours! % 12;
              return `${hour12}:${String(minutes).padStart(2, '0')} ${hours! < 12 ? 'AM' : 'PM'}`;
            }}
          />
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of='TimeGridProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>ARIA radio group: the root is <strong>role=&quot;radiogroup&quot;</strong> (name it with <code>aria-label</code>), every slot a <strong>&lt;button role=&quot;radio&quot;&gt;</strong> with <code>aria-checked</code></li>
            <li>Roving tabindex: the selected slot (else the first enabled one) is the grid's single tab stop</li>
            <li>Arrow keys move and select (left/right by slot, up/down by <code>columns</code>), Home/End jump the edges, disabled slots are skipped</li>
            <li>Pass <code>name</code> to submit the selected slot through native form data</li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}
