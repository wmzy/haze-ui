import type { ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { SubmenuShell } from '../../utils/submenu';

import { useDropdownMenuContext } from './DropdownMenuContext';

type DropdownMenuSubProps = {
  /** Whether the submenu is open — controlled control or uncontrolled initial value. */
  open?: ControlOrValue<boolean>;
  /** Fires on every open transition, whatever drove it (keyboard, hover, click, light dismiss). */
  onOpenChange?: (open: boolean) => void;
  className?: string;
  /** `<DropdownMenuSubTrigger>` followed by `<DropdownMenuSubContent>`. */
  children: ReactNode;
};

/**
 * State container for a nested submenu inside a DropdownMenu. Wraps a
 * DropdownMenuSubTrigger + DropdownMenuSubContent pair; the open state
 * is controllable through the standard `ControlOrValue` prop. The
 * mechanism and the position:relative wrapper live in the shared shell
 * (utils/submenu's SubmenuShell); this skin only contributes the
 * family's slot classes.
 */
export default function DropdownMenuSub({
  open,
  onOpenChange,
  className,
  children,
}: DropdownMenuSubProps) {
  const classNames = useDropdownMenuContext().classNames;
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

export type { DropdownMenuSubProps };
