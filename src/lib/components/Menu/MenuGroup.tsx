import { MenuGroupImpl, type MenuGroupBaseProps } from '../../utils/menu-item-parts';

import { useMenuClassNames } from './MenuContext';

type MenuGroupProps = MenuGroupBaseProps;

/**
 * A labeled, non-interactive section of menu items (`role="group"`
 * named by its heading, the ARIA APG menu group shape). The heading is
 * not a menu item: keyboard traversal, typeahead and the roving tab
 * stop skip it entirely.
 */
export default function MenuGroup({ label, className, children }: MenuGroupProps) {
  const classNames = useMenuClassNames();
  return (
    <MenuGroupImpl familyClass={classNames?.group} label={label} className={className}>
      {children}
    </MenuGroupImpl>
  );
}

export type { MenuGroupProps };
