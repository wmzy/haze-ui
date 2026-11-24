import type { ReactNode } from 'react';

import {
  MenuRadioGroupImpl,
  type MenuRadioGroupBaseProps,
} from '../../utils/menu-item-parts';

import { useMenuClassNames } from './MenuContext';

type MenuRadioGroupProps = MenuRadioGroupBaseProps & {
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
