import type { ReactNode } from 'react';

import { MenuSubTriggerImpl } from '../../utils/menu-item-parts';

import { useDropdownMenuContext } from './DropdownMenuContext';

type DropdownMenuSubTriggerProps = {
  disabled?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * The menuitem that opens a DropdownMenuSub submenu: hover opens it after
 * a short intent delay, click toggles, and the inline-end arrow
 * (ArrowRight in LTR, ArrowLeft under `dir="rtl"`) opens it with focus on
 * its first item.
 */
export default function DropdownMenuSubTrigger({
  disabled = false,
  className,
  children,
}: DropdownMenuSubTriggerProps) {
  const classNames = useDropdownMenuContext().classNames;
  return (
    <MenuSubTriggerImpl
      skin='popup'
      familyClass={classNames?.subTrigger}
      disabled={disabled}
      className={className}
    >
      {children}
    </MenuSubTriggerImpl>
  );
}

export type { DropdownMenuSubTriggerProps };
