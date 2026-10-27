import { menuDivider } from '../../utils/menu-skins';

import { useDropdownMenuContext } from './DropdownMenuContext';

type DropdownMenuSeparatorProps = {
  className?: string;
};

export default function DropdownMenuSeparator({ className }: DropdownMenuSeparatorProps) {
  const classNames = useDropdownMenuContext().classNames;
  return (
    <div
      data-slot='separator'
      x-class={[menuDivider, classNames?.separator, className]}
      role="separator"
    />
  );
}

export type { DropdownMenuSeparatorProps };
