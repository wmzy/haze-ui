import { menuDivider } from '../../utils/menu-skins';

import { useMenuClassNames } from './MenuContext';

export default function MenuDivider() {
  const classNames = useMenuClassNames();
  return (
    <div
      data-slot='separator'
      x-class={[menuDivider, classNames?.divider]}
      role='separator'
    />
  );
}
