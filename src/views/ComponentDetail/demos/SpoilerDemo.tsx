import { Spoiler } from '@/lib';

import { DemoPage, DemoSection, PropsSection } from './shared';

// ─── Spoiler ─────────────────────────────────────────────────
export default function SpoilerDemo() {
  return (
    <DemoPage
      title='Spoiler'
      description={
        <>
          Collapsed-long-content gate ("Show more / Show less"): the
          content box is height-capped with a fade at the cut edge; the
          toggle is controllable via <code>expanded</code>.
        </>
      }
    >
      <DemoSection title='Basic'>
        <Spoiler maxHeight={80}>
          <p>这是一段长文（超过阈值时被截断并显示渐隐边缘）。</p>
          <p>当你点击“显示更多”后，全部内容展开。</p>
          <p>再次点击“收起”回到截断状态。expanded 是可控 prop。</p>
        </Spoiler>
      </DemoSection>

      <PropsSection of='SpoilerProps' />
    </DemoPage>
  );
}
