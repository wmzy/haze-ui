import type { ReactNode, Ref } from 'react';

import {
  pickerOptionActive,
  pickerOptionRow,
  pickerOptionRowComfortable,
  pickerOptionSelected,
} from '../../utils/picker-trigger';

type ComboboxOptionProps<T extends string | number = string> = {
  value: T;
  highlighted?: boolean;
  selected?: boolean;
  /**
   * Option-level disabled state (from the `options` data or the
   * declarative `disabled` prop): the row renders dimmed and
   * `aria-disabled`, and both the click and keyboard pick paths reject
   * it — the maxCount lock's inert-row contract.
   */
  disabled?: boolean;
  /**
   * DOM id of this option — what the combobox input points at via
   * aria-activedescendant while the row holds the keyboard highlight.
   */
  id?: string;
  /**
   * Ref to the row element (React 19 ref-as-prop). Combobox points it
   * at the keyboard-highlighted row to keep it scrolled into view.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Size of the whole option set, per aria-setsize. Must count every
   * option, not just the rows a windowed (virtualized) list mounted.
   */
  setSize?: number;
  /** 1-based position of this option in the set, per aria-posinset. */
  posInSet?: number;
  onSelect?: (value: T) => void;
  className?: string;
  children: ReactNode;
};

export default function ComboboxOption<T extends string | number = string>({
  value,
  highlighted = false,
  selected = false,
  disabled = false,
  id,
  ref,
  setSize,
  posInSet,
  onSelect,
  className,
  children,
}: ComboboxOptionProps<T>) {
  return (
    <div
      ref={ref}
      data-slot='option'
      role='option'
      id={id}
      // ARIA 1.2 combobox: both the keyboard-highlighted (visual focus)
      // option and the selected value carry aria-selected=true — two
      // distinct concepts sharing the attribute's true state.
      aria-selected={selected || highlighted}
      aria-disabled={disabled || undefined}
      data-disabled={disabled || undefined}
      aria-setsize={setSize}
      aria-posinset={posInSet}
      x-class={[
        pickerOptionRow,
        pickerOptionRowComfortable,
        highlighted && pickerOptionActive,
        selected && pickerOptionSelected,
        className,
      ]}
      onClick={() => {
        if (!disabled) onSelect?.(value);
      }}
    >
      {children}
    </div>
  );
}

export type { ComboboxOptionProps };
