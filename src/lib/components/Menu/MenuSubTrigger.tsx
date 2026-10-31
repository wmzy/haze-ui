import type { ReactNode } from 'react';

import { MenuSubTriggerImpl } from '../../utils/menu-item-parts';

import { useMenuClassNames } from './MenuContext';

type MenuSubTriggerProps = {
  disabled?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * The menuitem that opens a MenuSub submenu: hover opens it after a
 * short intent delay, click toggles, and the inline-end arrow (ArrowRight
 * in LTR, ArrowLeft under `dir="rtl"`) opens it with focus on its first
 * item.
 */
export default function MenuSubTrigger({
  disabled = false,
  className,
  children,
}: MenuSubTriggerProps) {
  const classNames = useMenuClassNames();
  return (
    <MenuSubTriggerImpl
      skin='menu'
      familyClass={classNames?.subTrigger}
      disabled={disabled}
      className={className}
    >
      {children}
    </MenuSubTriggerImpl>
  );
}

export type { MenuSubTriggerProps };
