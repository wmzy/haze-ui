import type { ReactNode } from 'react';

import { createContext } from 'react';

import { useConfigDefaults } from '../ConfigProvider/useConfigDefaults';

import { group } from './tag-group-styles';

/** Item-level slot classes flow group → item without prop drilling.
 * Default `undefined` — the same as no slot classes set anywhere. */
const TagGroupItemClassNamesContext = createContext<TagGroupClassNames | undefined>(undefined);

/**
 * Semantic slot classes for TagGroup (AntD v6 `classNames` shape; keys
 * follow the data-slot names). `item`/`removeButton` forward onto every
 * TagGroupItem child through context, so row-level skins are set once
 * on the group. A ConfigProvider `TagGroup.classNames` section merges
 * under the prop, per key.
 */
type TagGroupClassNames = {
  /** The group wrapper (data-slot='tag-group'). */
  root?: string;
  /** Every item's chip span (data-slot='tag-group-item'). */
  item?: string;
  /** Every item's remove button (data-slot='remove-button'). */
  removeButton?: string;
};

type TagGroupProps = {
  children: ReactNode;
  className?: string;
  /** Slot classes (see {@link TagGroupClassNames}); item-level keys are
   * inherited by the TagGroupItem children. */
  classNames?: TagGroupClassNames;
};

/** Plain non-draggable tag row. For drag-and-drop reordering use
 * SortableTagGroup (which statically imports the @dnd-kit runtime);
 * this base component stays free of the dnd runtime. */
export default function TagGroup({ children, className, classNames }: TagGroupProps) {
  // ConfigProvider `TagGroup.classNames` merges under the prop, per key.
  const config = useConfigDefaults('TagGroup');
  const resolvedClassNames = config.classNames
    ? { ...config.classNames, ...classNames }
    : classNames;
  return (
    <TagGroupItemClassNamesContext.Provider value={resolvedClassNames}>
      <div data-slot="tag-group" x-class={[group, className, resolvedClassNames?.root]} role="group">
        {children}
      </div>
    </TagGroupItemClassNamesContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- classNames context 必须与 TagGroup/TagGroupItem 同文件存在（跟 ToastContainer / floating.tsx 同一条 suppression）
export { TagGroupItemClassNamesContext };

export type { TagGroupClassNames, TagGroupProps };
