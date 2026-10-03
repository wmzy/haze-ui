import { createContext } from 'react';

/**
 * The rail's resolved orientation, injected by the
 * surrounding ActivityRail. Workbench overrides it with
 * 'horizontal' when the rail is docked inside the sidebar
 * column (top/bottom docking), so a plain `<ActivityRail>`
 * lays out as a strip there without the consumer repeating
 * a prop.
 *
 * Lives in a sibling file (not ActivityRail.tsx) so the
 * component file keeps a components-only export surface
 * for react-refresh.
 */
export const ActivityRailDockContext = createContext<
  'vertical' | 'horizontal'
>('vertical');
