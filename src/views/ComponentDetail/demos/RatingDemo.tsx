import { useControl } from 'react-use-control';

import { Rating } from '@/lib';

import { row } from '../styles';

import {
  AccessibilitySection,
  DemoPage,
  DemoSection,
  hintStyle,
  PropsSection,
} from './shared';

// ─── Rating ─────────────────────────────────────────────────────
export default function RatingDemo() {
  const [, , valueCtrl] = useControl(undefined, 3);
  const [value] = useControl(valueCtrl);

  return (
    <DemoPage title='Rating' description='Star rating with half-star support.'>
      <DemoSection title='Demo'>
        <div className={row}>
          <Rating value={valueCtrl} />
          <span style={hintStyle}>{value} stars</span>
        </div>
      </DemoSection>

      <DemoSection title='Half Stars'>
        <div className={row}>
          <Rating allowHalf />
        </div>
      </DemoSection>

      <PropsSection of='RatingProps' />

      <AccessibilitySection>
        <ul>
          <li>Uses <strong>role=&quot;radiogroup&quot;</strong> with individual <strong>role=&quot;radio&quot;</strong> stars</li>
          <li>Each star has <strong>aria-checked</strong> and <strong>aria-label</strong></li>
          <li>Click to select, hover to preview</li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
