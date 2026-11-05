import { menuDivider } from '../../utils/menu-skins';

import { useMenuClassNames } from './MenuContext';

type MenuDividerProps = {
  className?: string;
};

export default function MenuDivider({ className }: MenuDividerProps) {
  const classNames = useMenuClassNames();
  return (
    <div
      data-slot='separator'
      x-class={[menuDivider, classNames?.divider, className]}
      role='separator'
    />
  );
}

export type { MenuDividerProps };
