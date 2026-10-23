import type { ReactElement, ReactNode } from 'react';

import { Children, isValidElement } from 'react';

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

/** Props of a declarative <ComboboxOption> child, as far as option
 * extraction is concerned. */
type OptionLikeProps = {
  value?: string | number;
  disabled?: boolean;
  children?: ReactNode;
};

/** Props of a <ComboboxGroup> child. */
type GroupLikeProps = {
  label?: ReactNode;
  children?: ReactNode;
};

const isGroupElement = (
  child: ReactNode
): child is ReactElement<GroupLikeProps> =>
  isValidElement<GroupLikeProps>(child) && child.type === ComboboxGroup;

const isOptionElement = (
  child: ReactNode
): child is ReactElement<OptionLikeProps> =>
  isValidElement<OptionLikeProps>(child) && child.type === ComboboxOption;

/**
 * Flattens declarative compound children — `<ComboboxOption>` rows,
 * optionally inside `<ComboboxGroup label>` sections — into the same
 * `ComboboxOptionData[]` the `options` prop takes. The label must be
 * textual (filtering compares strings): string/number children pass
 * through, anything else falls back to the stringified value, the same
 * tolerance Select's extraction shows. Stray non-family children are
 * ignored, and group nesting assigns the nearest enclosing label.
 */
export function extractComboboxOptions<T extends string | number = string>(
  children: ReactNode
): ComboboxOptionData<T>[] {
  return Children.toArray(children).flatMap((child): ComboboxOptionData<T>[] => {
    if (isGroupElement(child)) {
      const group =
        typeof child.props.label === 'string' ? child.props.label : undefined;
      return extractComboboxOptions<T>(child.props.children).map((option) => ({
        ...option,
        group: option.group ?? group,
      }));
    }
    if (!isOptionElement(child)) return [];
    const { value, disabled, children: label } = child.props;
    if (value === undefined) return [];
    return [
      {
        value: value as T,
        label:
          typeof label === 'string' || typeof label === 'number'
            ? String(label)
            : String(value),
        disabled: disabled === true,
      },
    ];
  });
}
