import type { ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { MenuRadioGroupImpl } from '../../utils/menu-item-parts';

import { useMenuClassNames } from './MenuContext';

type MenuRadioGroupProps = {
  /** Selected value — controlled control or uncontrolled initial value ('' = none). */
  value?: ControlOrValue<string>;
  /** Fires when the selection changes, whatever drove it (click, Enter, Space). */
  onValueChange?: (value: string) => void;
  /** Optional non-interactive heading naming the radio group (aria-labelledby). */
  label?: ReactNode;
  className?: string;
  /** The group's `MenuRadioItem`s. */
  children: ReactNode;
};

/**
 * State container for a single-select cluster of `MenuRadioItem`s
 * (`role="group"`): owns the selected value through the standard
 * `ControlOrValue` prop and exposes it to the items.
 */
export default function MenuRadioGroup({
  value,
  onValueChange,
  label,
  className,
  children,
}: MenuRadioGroupProps) {
  const classNames = useMenuClassNames();
  return (
    <MenuRadioGroupImpl
      familyClass={classNames?.group}
      value={value}
      onValueChange={onValueChange}
      label={label}
      className={className}
    >
      {children}
    </MenuRadioGroupImpl>
  );
}

export type { MenuRadioGroupProps };
