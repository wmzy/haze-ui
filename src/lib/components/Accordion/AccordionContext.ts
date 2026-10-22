import {createContext, useContext} from 'react';

/**
 * Semantic slot classes (AntD v6 `classNames` shape) for the Accordion
 * family: keys mirror the data-slot values each part carries, declared
 * once on the `<Accordion>` root and distributed to every item through
 * context. Consumer classes are appended at the end of each part's
 * class list (able to override component defaults); per-item
 * `className` props stay available for one-off tweaks and still land
 * after the slot class.
 */
export type AccordionClassNames = {
  /** The wrapper `<div>` `<Accordion>` renders (`data-slot='accordion'`). */
  accordion?: string;
  /** Every item's `<details>` element (`data-slot='item'`). */
  item?: string;
  /** Every item's `<summary>` header (`data-slot='summary'`). */
  summary?: string;
  /** Every item's content wrapper `<div>` (`data-slot='content'`). */
  content?: string;
};

type AccordionContextValue = {
  /** Keys of the currently open items — the accordion's `open` state. */
  openKeys: string[];
  /**
   * Toggle one item's membership in `openKeys`. Exclusive accordions
   * replace the array (opening an item closes every other one), so the
   * state keeps its array shape with length ≤ 1.
   */
  toggleItem: (key: string) => void;
  /** Slot classes declared on `<Accordion>`. */
  classNames: AccordionClassNames | undefined;
};

const AccordionContext = createContext<AccordionContextValue | undefined>(undefined);

export const AccordionProvider = AccordionContext.Provider;

/**
 * Context lookup without the usual "must be used within <Accordion>"
 * throw: a bare `<AccordionItem>` outside an accordion keeps the plain
 * native details/summary behavior (the browser owns the toggle), which
 * is a supported standalone mode — items opt into the controllable
 * state only when the context (and a resolvable key) is present.
 */
export function useAccordionContext() {
  return useContext(AccordionContext);
}
