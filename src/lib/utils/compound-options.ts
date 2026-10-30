import type { ReactNode } from 'react';

import { Children, isValidElement } from 'react';

/**
 * Shared walker for declarative compound-option children — the
 * `<Option>`/`<OptionGroup>` (Select) and `<ComboboxOption>`/
 * `<ComboboxGroup>` (Combobox) JSX shapes flatten through the same
 * isValidElement type-guard + recursive group expansion algorithm.
 * Split out of the two per-component hand-rolls
 * (components/Select/select-options.ts, components/Combobox/
 * combobox-options.ts) that had converged on it; both consumers keep
 * their public exports and fold this node stream into their own shapes
 * (Select: flat option list + group-preserved entries; Combobox:
 * stringified labels stamped with the nearest enclosing string group
 * title).
 *
 * Registry note: pure TS, no css — needs no split-css sharedLayers
 * entry. Select/Combobox are interactive client components (not on
 * rsc-safe.mjs), so no rsc-safe listing applies.
 */

/**
 * One node of the walked children stream: an option row, or a group
 * wrapper carrying its label and the expanded subtree in document
 * order. Group titles stay standalone group nodes so entry-structure
 * consumers can rebuild their sections, and labels stay raw
 * `ReactNode` — stringification is a consumer concern.
 */
export type CompoundOptionNode<
  T extends string | number | readonly string[] = string | number,
> =
  | { kind: 'group'; label: ReactNode; nodes: CompoundOptionNode<T>[] }
  | { kind: 'option'; value: T; label: ReactNode; disabled: boolean };

/**
 * Family membership tests by element `type`. Predicates rather than
 * type references: Select treats *any* non-group element as an option
 * candidate (plain `<option>` included), which a plain value cannot
 * express. Group is tested first — a child matching both arms belongs
 * to the group role.
 */
export type CompoundOptionTypes = {
  option: (type: unknown) => boolean;
  group: (type: unknown) => boolean;
};

/** Props of a family element, as far as the walker is concerned. */
type CompoundLikeProps = {
  label?: ReactNode;
  children?: ReactNode;
  value?: unknown;
  disabled?: boolean;
};

/**
 * Expands declarative compound children into the ordered node stream:
 * group wrappers recurse into their children, option elements
 * contribute their raw value/label/disabled (`disabled` normalized to
 * a strict boolean), options without a value are dropped, and stray
 * non-family children are ignored — the semantics both source modules
 * shipped. Values other than `undefined` pass through untouched;
 * dropping Select's multi-value (array) shape is the caller's call.
 */
export function walkCompoundOptions<
  T extends string | number | readonly string[] = string | number,
>(children: ReactNode, types: CompoundOptionTypes): CompoundOptionNode<T>[] {
  return Children.toArray(children).flatMap((child): CompoundOptionNode<T>[] => {
    if (!isValidElement<CompoundLikeProps>(child)) return [];
    if (types.group(child.type)) {
      return [
        {
          kind: 'group',
          label: child.props.label,
          nodes: walkCompoundOptions<T>(child.props.children, types),
        },
      ];
    }
    if (!types.option(child.type)) return [];
    const { value, disabled, children: label } = child.props;
    if (value === undefined) return [];
    return [{ kind: 'option', value: value as T, label, disabled: disabled === true }];
  });
}
