import type { ReactNode } from 'react';

import type { CompoundOptionNode, CompoundOptionTypes } from '../../utils/compound-options';

import { walkCompoundOptions } from '../../utils/compound-options';

import ComboboxGroup from './ComboboxGroup';
import ComboboxOption from './ComboboxOption';

/**
 * One entry of the `options` prop: value, string label, an optional
 * `disabled` state (rendered dimmed/`aria-disabled`, clicks and Enter
 * rejected) and an optional `group` heading — consecutive options
 * sharing a `group` cluster into one `ComboboxGroup` section (the
 * cmdk shape); options without a `group` stay direct listbox children.
 */
export type ComboboxOptionData<T extends string | number = string> = {
  value: T;
  label: string;
  disabled?: boolean;
  group?: string;
};

/** Family membership for the shared compound walker: Combobox matches
 * its two components exactly — stray non-family children are ignored. */
const comboboxOptionTypes: CompoundOptionTypes = {
  group: (type) => type === ComboboxGroup,
  option: (type) => type === ComboboxOption,
};

/**
 * Folds the walked node stream into data rows. The label must be
 * textual (filtering compares strings): string/number children pass
 * through, anything else falls back to the stringified value, the same
 * tolerance Select's extraction shows. The group stamp is the nearest
 * enclosing *string* group title — a non-string label passes the
 * inherited stamp through, matching the original recursion's
 * `option.group ?? label` unwinding.
 */
const collectOptions = <T extends string | number = string>(
  nodes: CompoundOptionNode[],
  group: string | undefined
): ComboboxOptionData<T>[] =>
  nodes.flatMap((node): ComboboxOptionData<T>[] => {
    if (node.kind === 'group') {
      return collectOptions<T>(
        node.nodes,
        typeof node.label === 'string' ? node.label : group
      );
    }
    return [
      {
        value: node.value as T,
        label:
          typeof node.label === 'string' || typeof node.label === 'number'
            ? String(node.label)
            : String(node.value),
        disabled: node.disabled,
        group,
      },
    ];
  });

/**
 * Flattens declarative compound children — `<ComboboxOption>` rows,
 * optionally inside `<ComboboxGroup label>` sections — into the same
 * `ComboboxOptionData[]` the `options` prop takes. Stray non-family
 * children are ignored, and group nesting assigns the nearest
 * enclosing label.
 */
export function extractComboboxOptions<T extends string | number = string>(
  children: ReactNode
): ComboboxOptionData<T>[] {
  return collectOptions<T>(walkCompoundOptions(children, comboboxOptionTypes), undefined);
}
