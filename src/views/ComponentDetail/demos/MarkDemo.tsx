import { Mark } from '@/lib';

import { row } from '../styles';

import { DemoPage, DemoSection, PropsSection } from './shared';

// ─── Mark ─────────────────────────────────────────────────────
export default function MarkDemo() {
  return (
    <DemoPage
      title='Mark'
      description={
        <>
          Text-level highlight — the semantic <code>&lt;mark&gt;</code>{' '}
          element skinned with the status tokens (warning, primary, success,
          danger).
        </>
      }
    >
      <DemoSection title='Tones'>
        <div className={row}>
          <Mark>warning</Mark>
          <Mark color='default'>default</Mark>
          <Mark color='primary'>primary</Mark>
          <Mark color='success'>success</Mark>
          <Mark color='danger'>danger</Mark>
          <Mark color='info'>info</Mark>
        </div>
      </DemoSection>

      <DemoSection title='In context'>
        <p>
          你在全文搜索 “render”：共找到 <Mark>render</Mark> 三处与{' '}
          <Mark color='primary'>Render</Mark> 两处（大小写见 Highlight
          组件）。
        </p>
      </DemoSection>

      <PropsSection of='MarkProps' />
    </DemoPage>
  );
}
