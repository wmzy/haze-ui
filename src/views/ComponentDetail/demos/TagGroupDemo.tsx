import { useControl } from 'react-use-control';

import { SortableTagGroup, TagGroup, TagGroupItem } from '@/lib';

import PropsTable from '../PropsTable';

import { fieldRow } from '../styles';

import { AccessibilitySection, DemoPage, DemoSection, noop } from './shared';

/** Reorders `list` by the index permutation SortableTagGroup reports. */
function applyOrder<T>(list: T[], order: number[]): T[] {
  return order.flatMap((index) => {
    const item = list[index];
    return item === undefined ? [] : [item];
  });
}

/** Sortable chips: the tag array lives in one control, onReorder reports the
 * new index order and the owner re-renders the children through it. */
function SortableTagGroupExample() {
  const [tags, setTags] = useControl(undefined, [
    'React',
    'TypeScript',
    'Linaria',
    'OKLCH',
  ]);

  return (
    <>
      <div className={fieldRow}>
        <SortableTagGroup onReorder={(order) => setTags(applyOrder(tags, order))}>
          {tags.map((tag) => (
            <TagGroupItem key={tag}>{tag}</TagGroupItem>
          ))}
        </SortableTagGroup>
      </div>
      <p>Current order: {tags.join(' → ')}</p>
    </>
  );
}

// ─── TagGroup ───────────────────────────────────────────────────
export default function TagGroupDemo() {
  return (
    <DemoPage
      title='TagGroup'
      description={
        <>
          Group of tags with optional close buttons, plus a sortable variant
          built on <a href='https://dndkit.com'>dnd-kit</a> (a haze-ui
          dependency, bundled only when you import{' '}
          <code>SortableTagGroup</code>/<code>SortableTagInput</code>).
          Reordering is parent-driven: <code>onReorder</code> reports the
          new index order and you re-render the children accordingly.
        </>
      }
    >
      <DemoSection title='Demo'>
        <TagGroup>
          <TagGroupItem>React</TagGroupItem>
          <TagGroupItem>TypeScript</TagGroupItem>
          <TagGroupItem onClose={noop}>Removable</TagGroupItem>
        </TagGroup>
      </DemoSection>

      <DemoSection title='Sortable chips'>
        <SortableTagGroupExample />
      </DemoSection>

      <DemoSection title='TagGroup Props'>
        <PropsTable of='TagGroupProps' />
      </DemoSection>

      <DemoSection title='TagGroupItem Props'>
        <PropsTable of='TagGroupItemProps' />
      </DemoSection>

      <AccessibilitySection>
        <ul>
          <li>Group uses <strong>role=&quot;group&quot;</strong></li>
          <li>Close button has <strong>aria-label=&quot;Remove&quot;</strong></li>
          <li>
            SortableTagGroup: focus a chip, press <strong>Space</strong> to
            lift, arrow keys to move, <strong>Space</strong> to drop,{' '}
            <strong>Escape</strong> to cancel
          </li>
        </ul>
      </AccessibilitySection>
    </DemoPage>
  );
}
