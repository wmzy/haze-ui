import type {ComponentPropsWithoutRef, ReactElement, ReactNode} from 'react';
import type {ControlOrValue} from 'react-use-control';
import type {AccordionClassNames} from './AccordionContext';
import type {AccordionItemProps} from './AccordionItem';

import {css} from '@linaria/core';
import {Children, Fragment, cloneElement, isValidElement, useCallback} from 'react';
import {useControl} from 'react-use-control';

import {AccordionProvider} from './AccordionContext';
import AccordionItem from './AccordionItem';

/**
 * Controllable open state: the keys of the open items. Accepts either
 * form of the one-prop contract (`ControlOrValue`): a `Control<string[]>`
 * from a parent's `useControl` drives the accordion (controlled), while
 * a plain `string[]` seeds the uncontrolled state's initial value —
 * omitted, every item starts closed (`[]`).
 */
type AccordionProps = {
  open?: ControlOrValue<string[]>;
  /**
   * Fires on every user-driven open-state transition (header click or
   * keyboard activation) with the next key array — the same value the
   * `open` control receives. Parent-driven control flips do not echo
   * through here.
   */
  onOpenChange?: (keys: string[]) => void;
  /**
   * `false` (default): items open independently, `open` holds every
   * open key. `true`: at most one item open — activating a closed item
   * closes the rest (`open` keeps its array shape, length ≤ 1).
   */
  exclusive?: boolean;
  /**
   * Semantic slot classes (AntD v6 `classNames` shape): declared once
   * here and distributed to every item through context — see
   * {@link AccordionClassNames}. Omitting it changes nothing.
   */
  classNames?: AccordionClassNames;
  className?: string;
  /** `<AccordionItem>`s (arrays/Fragments flatten; other nodes pass through in place). */
  children: ReactNode;
} & ComponentPropsWithoutRef<'div'>;

const base = css`
  width: 100%;
`;

/**
 * tab-metas-style walk (see Tabs): flatten arrays/Fragments in DOM
 * order and inject each `<AccordionItem>` with its position — the
 * default key source for items without an explicit `itemKey`. Other
 * nodes pass through untouched, so wrappers and stray elements keep
 * their place. Runs every render; cloneElement preserves consumer
 * props and refs.
 */
const injectItemIndexes = (
  nodes: ReactNode,
  counter: {index: number}
): ReactNode =>
  Children.map(nodes, (node) => {
    if (!isValidElement(node)) return node;
    if (node.type === AccordionItem) {
      const {index} = counter;
      counter.index += 1;
      return cloneElement(node as ReactElement<AccordionItemProps>, {index});
    }
    if (node.type === Fragment) {
      return cloneElement(
        node,
        undefined,
        injectItemIndexes(
          (node.props as {children?: ReactNode}).children,
          counter
        )
      );
    }
    return node;
  });

export default function Accordion({
  open: openControl,
  onOpenChange,
  exclusive = false,
  classNames,
  className,
  children,
  ...rest
}: AccordionProps) {
  const [openKeys, setOpenKeys] = useControl(openControl, []);

  // Single state-change exit (DropdownMenu pattern): every item
  // activation funnels through here, so onOpenChange fires exactly once
  // per transition. Exclusive mode replaces the array — opening one
  // item closes the rest while keeping the array semantics (≤ 1 key).
  const toggleItem = useCallback(
    (key: string) => {
      const isOpen = openKeys.includes(key);
      const next = exclusive
        ? isOpen
          ? []
          : [key]
        : isOpen
          ? openKeys.filter((k) => k !== key)
          : [...openKeys, key];
      setOpenKeys(next);
      onOpenChange?.(next);
    },
    [openKeys, setOpenKeys, onOpenChange, exclusive]
  );

  return (
    <AccordionProvider value={{openKeys, toggleItem, classNames}}>
      <div
        data-slot='accordion'
        x-class={[base, className, classNames?.accordion]}
        {...rest}
      >
        {injectItemIndexes(children, {index: 0})}
      </div>
    </AccordionProvider>
  );
}

export type {AccordionProps, AccordionClassNames};
