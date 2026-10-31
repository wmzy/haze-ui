import type { ReactNode } from 'react';

import { MenuGroupImpl } from '../../utils/menu-item-parts';

import { useDropdownMenuContext } from './DropdownMenuContext';

type DropdownMenuGroupProps = {
  /** Non-interactive heading naming the group (aria-labelledby). */
  label: ReactNode;
  className?: string;
  /** The group's menu items. */
  children: ReactNode;
};

/**
 * A labeled, non-interactive section of menu items (`role="group"`
 * named by its heading, the ARIA APG menu group shape). The heading is
 * not a menu item: keyboard traversal, typeahead and the roving tab
 * stop skip it entirely.
 */
export default function DropdownMenuGroup({
  label,
  className,
  children,
}: DropdownMenuGroupProps) {
  const classNames = useDropdownMenuContext().classNames;
  return (
    <MenuGroupImpl familyClass={classNames?.group} label={label} className={className}>
      {children}
    </MenuGroupImpl>
  );
}

export type { DropdownMenuGroupProps };
