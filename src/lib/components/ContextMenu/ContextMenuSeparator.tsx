import { menuDivider } from '../../utils/menu-skins';

import { useContextMenuContext } from './ContextMenuContext';

type ContextMenuSeparatorProps = {
  className?: string;
};

export default function ContextMenuSeparator({ className }: ContextMenuSeparatorProps) {
  const classNames = useContextMenuContext().classNames;
  return (
    <div
      data-slot='separator'
      x-class={[menuDivider, classNames?.separator, className]}
      role="separator"
    />
  );
}

export type { ContextMenuSeparatorProps };
