import { Spoiler } from '@/lib';

import PropsTable from '../PropsTable';

import { intro, section } from '../styles';

// ─── Spoiler ─────────────────────────────────────────────────
export default function SpoilerDemo() {
  return (
    <>
      <h1>Spoiler</h1>
      <p className={intro}>
        Collapsed-long-content gate ("Show more / Show less"): the
        content box is height-capped with a fade at the cut edge; the
        toggle is controllable via <code>expanded</code>.
      </p>

      <div className={section}>
        <h2>Basic</h2>
        <Spoiler maxHeight={80}>
          <p>这是一段长文（超过阈值时被截断并显示渐隐边缘）。</p>
          <p>当你点击“显示更多”后，全部内容展开。</p>
          <p>再次点击“收起”回到截断状态。expanded 是可控 prop。</p>
        </Spoiler>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of='SpoilerProps' />
      </div>
    </>
  );
}
