import type { ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { SubmenuShell } from '../../utils/submenu';

import { useMenuClassNames } from './MenuContext';

type MenuSubProps = {
  /** Whether the submenu is open — controlled control or uncontrolled initial value. */
  open?: ControlOrValue<boolean>;
  /** Fires on every open transition, whatever drove it (keyboard, hover, click, light dismiss). */
  onOpenChange?: (open: boolean) => void;
  className?: string;
  /** `<MenuSubTrigger>` followed by `<MenuSubContent>`. */
  children: ReactNode;
};

/**
 * State container for a nested submenu inside a Menu. Wraps a
 * MenuSubTrigger + MenuSubContent pair; the open state is controllable
 * through the standard `ControlOrValue` prop. The mechanism and the
 * position:relative wrapper live in the shared shell (utils/submenu's
 * SubmenuShell); this skin only contributes the family's slot classes.
 */
export default function MenuSub({
  open,
  onOpenChange,
  className,
  children,
}: MenuSubProps) {
  const classNames = useMenuClassNames();
  return (
    <SubmenuShell
      open={open}
      onOpenChange={onOpenChange}
      familyClass={classNames?.sub}
      className={className}
    >
      {children}
    </SubmenuShell>
  );
}

export type { MenuSubProps };
