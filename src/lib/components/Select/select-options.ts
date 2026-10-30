import type { ReactNode } from 'react';

import type { CompoundOptionNode, CompoundOptionTypes } from '../../utils/compound-options';

import { isValidElement } from 'react';

import { walkCompoundOptions } from '../../utils/compound-options';

import OptionGroup from './OptionGroup';

/** One selectable entry extracted from the Select's JSX children. The
 * value keeps the raw `<Option value>` type (no DOM stringification —
 * the floating paths compare raw values). */
export type SelectOptionData<T extends string | number = string> = {
  value: T;
  label: ReactNode;
  /** Option-level disabled state (from `<Option disabled>` or the
   * data-driven `options` prop): the row renders dimmed/aria-disabled
   * and both the click and keyboard pick paths reject it. */
  disabled?: boolean;
};

/**
 * One rendering slot of the Select's children: a top-level option, or a
 * labelled group of options (from `<OptionGroup>` / plain `<optgroup>`).
 * The flat keyboard-navigation order is the depth-first traversal of
 * this structure, so highlighting runs continuously across groups.
 */
export type SelectEntryData<T extends string | number = string> =
  | { kind: 'option'; option: SelectOptionData<T> }
  | { kind: 'group'; label: string; options: SelectOptionData<T>[] };

/** Family membership for the shared compound walker: `<OptionGroup>`
 * and plain `<optgroup>` wrap groups, and every other element is an
 * option candidate — plain `<option>` rows included. */
const selectOptionTypes: CompoundOptionTypes = {
  group: (type) => type === OptionGroup || type === 'optgroup',
  option: (type) => type !== OptionGroup && type !== 'optgroup',
};

/** The walker's node type for Select children: `<Option value>` may
 * hold the multi-value array shape, which the flat option paths drop. */
type SelectWalkNode = CompoundOptionNode<string | number | readonly string[]>;
type SelectOptionNode = Extract<SelectWalkNode, { kind: 'option' }>;

/** One walked option node → SelectOptionData. Array-valued options
 * (the multi-value shape) are not single selectable entries and drop
 * out here; a missing label falls back to the stringified value. The
 * JSX prop keeps the raw value — only the DOM stringifies it (the
 * native single-mode path maps it back; see SelectCore). */
const optionData = <T extends string | number>(
  node: SelectOptionNode
): SelectOptionData<T> | undefined => {
  if (Array.isArray(node.value)) return undefined;
  return {
    value: node.value as T,
    label: node.label ?? String(node.value),
    disabled: node.disabled,
  };
};

/** Depth-first option flattening of the walked node stream (groups in
 * document order). */
const walkNodes = <T extends string | number>(
  nodes: SelectWalkNode[]
): SelectOptionData<T>[] =>
  nodes.flatMap((node): SelectOptionData<T>[] => {
    if (node.kind === 'group') return walkNodes<T>(node.nodes);
    const option = optionData<T>(node);
    return option ? [option] : [];
  });

const walkSelectChildren = <
  T extends string | number | readonly string[],
>(children: ReactNode) =>
  walkCompoundOptions<T>(children, selectOptionTypes);

/**
 * Flattens the Select's children — <Option> and plain <option> elements
 * are both accepted — into the {value, label} list. <OptionGroup> /
 * <optgroup> wrappers contribute their nested options in document
 * order. Children without a resolvable value are ignored, the same way
 * a native select treats stray non-option nodes.
 */
export function extractSelectOptions<T extends string | number = string>(
  children: ReactNode
): SelectOptionData<T>[] {
  return walkNodes<T>(walkSelectChildren<string | number | readonly string[]>(children));
}

/**
 * Extracts the Select's children preserving the grouping structure:
 * top-level options stay single entries, <OptionGroup>/<optgroup>
 * wrappers become group entries with their nested options. Group
 * nesting is not recursive — a native <optgroup> cannot contain another
 * group — and groups left without any resolvable option are dropped.
 */
export function extractSelectEntries<T extends string | number = string>(
  children: ReactNode
): SelectEntryData<T>[] {
  return walkSelectChildren<string | number | readonly string[]>(children).flatMap(
    (node): SelectEntryData<T>[] => {
      if (node.kind === 'group') {
        const options = walkNodes<T>(node.nodes);
        if (options.length === 0) return [];
        return [
          {
            kind: 'group',
            label: typeof node.label === 'string' ? node.label : '',
            options,
          },
        ];
      }
      const option = optionData<T>(node);
      return option ? [{ kind: 'option', option }] : [];
    }
  );
}

/** Depth-first flattening of the entry structure (groups in document
 * order) — the order keyboard navigation walks. */
export function flattenSelectEntries<T extends string | number = string>(
  entries: SelectEntryData<T>[]
): SelectOptionData<T>[] {
  return entries.flatMap((entry) =>
    entry.kind === 'group' ? entry.options : [entry.option]
  );
}

/**
 * Textual form of an option's label for string-only contexts: the
 * search filter and the `+N` overflow tooltip. String/number labels
 * pass through; element labels contribute their concatenated text
 * content (nested arrays and elements are walked).
 */
export function selectOptionText(label: ReactNode): string {
  if (typeof label === 'string') return label;
  if (typeof label === 'number' || typeof label === 'boolean') return String(label);
  if (Array.isArray(label)) return label.map(selectOptionText).join('');
  if (isValidElement<{ children?: ReactNode }>(label)) {
    return selectOptionText(label.props.children);
  }
  return '';
}

/**
 * Case-insensitive substring filter over the entry structure. An empty
 * (or whitespace-only) query returns the entries unchanged; groups
 * whose options all miss the query are dropped entirely, keeping the
 * rendered list free of orphaned headers.
 */
export function filterSelectEntries<T extends string | number = string>(
  entries: SelectEntryData<T>[],
  query: string
): SelectEntryData<T>[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return entries;
  return entries.flatMap((entry): SelectEntryData<T>[] => {
    if (entry.kind === 'option') {
      return selectOptionText(entry.option.label).toLowerCase().includes(needle)
        ? [entry]
        : [];
    }
    const options = entry.options.filter((option) =>
      selectOptionText(option.label).toLowerCase().includes(needle)
    );
    return options.length > 0 ? [{ kind: 'group', label: entry.label, options }] : [];
  });
}
