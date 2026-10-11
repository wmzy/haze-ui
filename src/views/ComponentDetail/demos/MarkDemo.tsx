import { Mark } from '@/lib';

import PropsTable from '../PropsTable';

import { intro, section, row } from '../styles';

// ─── Mark ─────────────────────────────────────────────────────
export default function MarkDemo() {
  return (
    <>
      <h1>Mark</h1>
      <p className={intro}>
        Text-level highlight — the semantic <code>&lt;mark&gt;</code>{' '}
        element skinned with the status tokens (warning, primary, success,
        danger).
      </p>

      <div className={section}>
        <h2>Tones</h2>
        <div className={row}>
          <Mark>warning</Mark>
          <Mark color='primary'>primary</Mark>
          <Mark color='success'>success</Mark>
          <Mark color='danger'>danger</Mark>
        </div>
      </div>

      <div className={section}>
        <h2>In context</h2>
        <p>
          你在全文搜索 “render”：共找到 <Mark>render</Mark> 三处与{' '}
          <Mark color='primary'>Render</Mark> 两处（大小写见 Highlight
          组件）。
        </p>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of='MarkProps' />
      </div>
    </>
  );
}
