import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { css } from '@linaria/core';
import { useEffect } from 'react';
import { useControl } from 'react-use-control';

import { ResizableGroup, ResizableHandle, ResizablePanel } from '../Resizable';

type WorkbenchProps = {
  /** Narrow icon rail column on the leading edge (ActivityRail is the intended content). */
  activityBar?: ReactNode;
  /** Where the activity rail docks: its own column (`'side'`, the
   *  default) or inside the sidebar column at its top (`'top'`)
   *  or bottom (`'bottom'`) — the Cursor-style layout, where the
   *  rail rides the sidebar as one unit. */
  activityBarPosition?: ControlOrValue<'side' | 'top' | 'bottom'>;
  /** Docked explorer column beside the editor; becomes a scrim-dismissed overlay under the mobile breakpoint. */
  sidebar?: ReactNode;
  /** Docked secondary column on the trailing edge; overlays like the sidebar on mobile. */
  auxiliaryBar?: ReactNode;
  /** Bottom tool region inside the main column (terminal/output); hidden on mobile. */
  panel?: ReactNode;
  /** Full-width strip under the middle row (StatusBar is the intended content). */
  statusBar?: ReactNode;
  /** Bottom navigation slot, rendered only under the mobile breakpoint where the activity bar is hidden. */
  tabBar?: ReactNode;
  /** Expanded sidebar width in px; a Control tracks handle drags live. */
  sidebarWidth?: ControlOrValue<number>;
  /** Sidebar collapsed state — desktop hides the column, mobile closes the overlay. */
  sidebarCollapsed?: ControlOrValue<boolean>;
  /**
   * Mobile sidebar overlay, in full-viewport form. Under the
   * mobile breakpoint this control owns the slide-out (the
   * docked `sidebarCollapsed` semantics are desktop-only
   * there); above the breakpoint it is inert. Defaults to
   * false — the mobile sidebar starts hidden and a consumer's
   * button (typically in `tabBar`, which only exists on
   * mobile) opens it.
   */
  mobileSidebarOpen?: ControlOrValue<boolean>;
  /** Expanded auxiliary bar width in px; a Control tracks handle drags live. */
  auxiliaryBarWidth?: ControlOrValue<number>;
  /** Auxiliary bar collapsed state — desktop hides the column, mobile closes the overlay. */
  auxiliaryBarCollapsed?: ControlOrValue<boolean>;
  /** Expanded bottom panel height in px; a Control tracks handle drags live. */
  panelHeight?: ControlOrValue<number>;
  /** Bottom panel collapsed state. */
  panelCollapsed?: ControlOrValue<boolean>;
  /** Maximized panel covers the whole main column; reversible through the same Control. */
  panelMaximized?: ControlOrValue<boolean>;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>;

/* px clamps forwarded to the Resizable panels. */
const SIDEBAR_MIN = 160;
const SIDEBAR_MAX = 480;
const SIDEBAR_DEFAULT = 300;
const AUXILIARY_MIN = 180;
const AUXILIARY_MAX = 480;
const AUXILIARY_DEFAULT = 300;
const PANEL_MIN = 120;
const PANEL_MAX = 720;
const PANEL_DEFAULT = 240;

/* Breakpoint matches the AppShell mobile query; everything below it is
 * pure CSS — no JS breakpoint state exists in this component.
 *
 * The breakpoint is evaluated against THIS element (a named
 * inline-size container), not the viewport: a host may render the
 * shell inside a width-constrained preview (the docs' device
 * presets cap the demo at 375px while the browser window stays
 * wide), and the mobile form must engage there too. Container
 * queries also make the fixed overlays' containing block this
 * element, so an open sidebar covers exactly the shell — the full
 * viewport on a real phone, the preview box on the docs page. */
const workbench = css`
  position: relative;
  display: grid;
  width: 100%;
  grid-template-rows: minmax(0, 1fr) auto auto;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    'body'
    'status'
    'tabs';
  container-type: inline-size;
  container-name: workbench;
  /* The shell owns scroll containment: only regions scroll, never the
   * shell (the height itself is the inline 100dvh below). Absent slots
   * leave their auto grid track empty, so it collapses to zero. */
  box-sizing: border-box;
  overflow: hidden;
`;

const body = css`
  grid-area: body;

  /* Mobile form: the row becomes a column, so the
   * activity bar (the side column's own DOM, kept in
   * place — see activityBar) stretches to a full-width
   * strip above the editor. The sidebar and auxiliary
   * panels are position:fixed overlays below the
   * breakpoint, so they leave the flow and the main
   * panel is the only in-flow item left to fill. */
  @container workbench (max-width: 768px) {
    flex-direction: column;

    & > [data-panel-id='main'] {
      flex: 1 1 0;
      min-height: 0;
    }
  }
`;

/* Fixed narrow column, sized by its content — the ActivityRail
 * track brings its own 48px width and hairline. It doubles as
 * the rail-track QUERY CONTAINER: ActivityRail lays itself out
 * horizontally once the track is wider than the vertical
 * column (see ActivityRail's @container rules), which is what
 * turns this column into a full-width bar under the mobile
 * breakpoint (the body becomes a column — see body). The
 * explicit flex-basis keeps inline-size containment from
 * collapsing the track to zero. */
const activityBar = css`
  flex: 0 0 var(--haze-space-12);
  box-sizing: border-box;
  overflow: hidden;
  container-type: inline-size;
  container-name: rail-track;
`;

/* The rail docked INSIDE the sidebar column (activityBarPosition
 * top/bottom): a flex item of the sidebar panel's column, riding
 * the sidebar as one unit. Its width is the sidebar's full
 * content box, which makes it a rail-track query container wide
 * enough for ActivityRail's horizontal layout. Its height is
 * content-driven: the flex basis is auto, so the rail's own
 * height:100% resolves to auto inside this auto-height box and
 * the track sizes to its items. */
const activityBarDocked = css`
  flex: 0 0 auto;
  box-sizing: border-box;
  overflow: hidden;
  width: 100%;
  container-type: inline-size;
  container-name: rail-track;
`;

/* Bottom-docked rail: pushed after the scroll region in the
 * sidebar panel's column. */
const activityBarDockedEnd = css`
  order: 1;
`;

/* Sidebar panel as the column container for a docked rail. */
const sidebarColumn = css`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  min-height: 0;
`;

/* The scroll region when it shares the sidebar panel with a
 * docked rail: it takes the remaining track instead of its
 * standalone height:100% (which would overflow the column). */
const regionFill = css`
  flex: 1 1 auto;
  min-height: 0;
  height: auto;
`;

/* Scroll region shared by the sidebar, auxiliary bar and panel slots. */
const region = css`
  height: 100%;
  box-sizing: border-box;
  overflow: auto;
`;

/* The main column's editor area: the flexible child of the vertical
 * group, scrollable on its own. */
const editor = css`
  flex: 1 1 0;
  min-height: 0;
  box-sizing: border-box;
  overflow: auto;
`;

/* The vertical group fills the main panel's stretched box (the group's
 * own flex properties are inert inside the non-flex panel). */
const verticalFill = css`
  height: 100%;
`;

const statusBarRegion = css`
  grid-area: status;
  box-sizing: border-box;
`;

/* Mobile-only bottom navigation: absent from the desktop grid, shown
 * under the breakpoint where the activity rail disappears. */
const tabBarRegion = css`
  display: none;
  grid-area: tabs;
  box-sizing: border-box;

  @container workbench (max-width: 768px) {
    display: block;
  }
`;

/* Click surface dismissing the mobile sidebar overlay. Inert
 * wherever the overlay is not in fixed mode; the dim layer
 * follows the ConfirmDialog/BottomSheet scrim precedent. Under
 * the breakpoint it appears only while the overlay is open
 * (data-open), so it never dims a shell whose sidebar starts
 * hidden. */
const scrim = css`
  display: none;
  box-sizing: border-box;

  @container workbench (max-width: 768px) {
    display: none;
    position: absolute;
    inset: 0;
    z-index: 90;
    background: rgba(0, 0, 0, 0.4);

    &[data-open] {
      display: block;
    }
  }
`;

/* ≤768px the docked sidebar column leaves the flex row and overlays
 * the viewport as a FULL-SCREEN slide-out. The inline flex basis is
 * inert on a fixed box. Visibility rides the data-open attribute
 * (the mobileSidebarOpen control): the overlay starts hidden — a
 * mobile shell shows its tab bar, not the sidebar, until the
 * consumer's button opens it. The docked data-collapsed semantics
 * are desktop-only; they no longer drive this overlay. */
const sidenavOverlay = css`
  @container workbench (max-width: 768px) {
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    z-index: 100;
    width: 100%;
    /* Opaque fill: the docked column rides the shell's
     * own background, but as an overlay the region is
     * transparent by default and the scrim's dim would
     * show through it (visually burying the sidebar
     * under the dim layer it sits above). */
    background: var(--haze-color-bg);
    box-shadow: var(--haze-shadow-lg);
    transform: translateX(-100%);
    visibility: hidden;
    transition:
      transform var(--haze-duration-normal) var(--haze-ease),
      visibility 0s linear var(--haze-duration-normal);

    &[data-open] {
      transform: none;
      visibility: visible;
      transition:
        transform var(--haze-duration-normal) var(--haze-ease),
        visibility 0s;
    }

    html[dir='rtl'] & {
      transform: translateX(100%);
    }
  }
`;

/* Mirror of sidenavOverlay anchored to the trailing edge. */
const auxOverlay = css`
  @container workbench (max-width: 768px) {
    position: absolute;
    inset-block: 0;
    inset-inline-end: 0;
    z-index: 100;
    width: min(var(--haze-workbench-auxiliary-width, 300px), 85%);
    background: var(--haze-color-bg);
    box-shadow: var(--haze-shadow-lg);
    transition: transform var(--haze-duration-normal) var(--haze-ease);

    &[data-collapsed] {
      transform: translateX(100%);
      visibility: hidden;
      transition:
        transform var(--haze-duration-normal) var(--haze-ease),
        visibility 0s linear var(--haze-duration-normal);
    }
  }
`;

/* Docked-only chrome: the bottom panel and every resize handle leave
 * the layout under the mobile breakpoint (the consumer's view owns the
 * mobile panel form). */
const mobileHidden = css`
  @container workbench (max-width: 768px) {
    display: none;
  }
`;

export default function Workbench({
  activityBar: activityBarSlot,
  activityBarPosition: activityBarPositionControl,
  sidebar: sidebarSlot,
  auxiliaryBar: auxiliaryBarSlot,
  panel: panelSlot,
  statusBar: statusBarSlot,
  tabBar: tabBarSlot,
  sidebarWidth: sidebarWidthControl,
  sidebarCollapsed: sidebarCollapsedProp,
  mobileSidebarOpen: mobileSidebarOpenControl,
  auxiliaryBarWidth: auxiliaryBarWidthControl,
  auxiliaryBarCollapsed: auxiliaryBarCollapsedProp,
  panelHeight: panelHeightControl,
  panelCollapsed: panelCollapsedProp,
  panelMaximized: panelMaximizedProp,
  className,
  style,
  children,
  ...rest
}: WorkbenchProps) {
  const [sidebarWidth, setSidebarWidth] = useControl(
    sidebarWidthControl,
    SIDEBAR_DEFAULT
  );
  const [auxiliaryBarWidth, setAuxiliaryBarWidth] = useControl(
    auxiliaryBarWidthControl,
    AUXILIARY_DEFAULT
  );
  const [panelHeight, setPanelHeight] = useControl(
    panelHeightControl,
    PANEL_DEFAULT
  );
  // The panels bind the same Control the scrim writes to, so handle
  // expanders, scrim clicks and external drivers stay one state source.
  const [sidebarCollapsed, setSidebarCollapsed, sidebarCollapsedCtrl] =
    useControl(sidebarCollapsedProp, false);
  // Mobile-only overlay state: the under-breakpoint sidebar form.
  // Starts closed — the mobile shell reveals the sidebar through
  // the consumer's button, not by default.
  const [mobileSidebarOpen, setMobileSidebarOpen, mobileSidebarOpenCtrl] =
    useControl(mobileSidebarOpenControl, false);
  // Escape dismisses the mobile sidebar overlay. The
  // full-width slide-out is opaque and edge-to-edge, so
  // it covers the scrim entirely — the dim layer has no
  // clickable surface of its own — and the keyboard is
  // the shell's built-in dismissal path.
  useEffect(() => {
    if (!mobileSidebarOpen) {
      return undefined;
    }
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', onKeydown);
    return () => document.removeEventListener('keydown', onKeydown);
  }, [mobileSidebarOpen, setMobileSidebarOpen]);
  // Layout choice for the rail: its own column or docked inside
  // the sidebar column.
  const [activityBarPosition] = useControl<
    'side' | 'top' | 'bottom'
  >(activityBarPositionControl, 'side');
  const [
    auxiliaryBarCollapsed,
    setAuxiliaryBarCollapsed,
    auxiliaryBarCollapsedCtrl,
  ] = useControl(auxiliaryBarCollapsedProp, false);
  const [, , panelCollapsedCtrl] = useControl(panelCollapsedProp, false);
  const [panelMaximized] = useControl(panelMaximizedProp, false);

  const commitHorizontal = (sizes: Record<string, number>): void => {
    // A collapsed neighbour reports 0 in the commit payload — it must
    // never clobber the remembered width.
    const nextSidebar = sizes.sidebar;
    if (nextSidebar !== undefined && nextSidebar > 0) {
      setSidebarWidth(nextSidebar);
    }
    const nextAuxiliary = sizes.auxiliary;
    if (nextAuxiliary !== undefined && nextAuxiliary > 0) {
      setAuxiliaryBarWidth(nextAuxiliary);
    }
  };

  const commitVertical = (sizes: Record<string, number>): void => {
    const nextPanel = sizes.panel;
    if (nextPanel !== undefined && nextPanel > 0) {
      setPanelHeight(nextPanel);
    }
  };

  return (
    <div
      data-slot="workbench"
      data-panel-maximized={panelMaximized || undefined}
      x-class={[workbench, className]}
      style={{ height: '100dvh', ...style }}
      {...rest}
    >
      <ResizableGroup
        direction="horizontal"
        className={body}
        onResizeCommit={commitHorizontal}
      >
        {activityBarSlot != null && activityBarPosition === 'side' && (
          <div data-slot="workbench-activity-bar" x-class={[activityBar]}>
            {activityBarSlot}
          </div>
        )}
        {sidebarSlot != null && (
          <ResizablePanel
            id="sidebar"
            defaultSize={sidebarWidth}
            minSize={SIDEBAR_MIN}
            maxSize={SIDEBAR_MAX}
            collapsible
            collapsed={sidebarCollapsedCtrl}
            className={
              activityBarPosition === 'side'
                ? sidenavOverlay
                : `${sidenavOverlay} ${sidebarColumn}`
            }
            data-open={mobileSidebarOpen || undefined}
            style={
              {
                '--haze-workbench-sidebar-width': `${sidebarWidth}px`,
              } as CSSProperties
            }
          >
            {activityBarSlot != null && activityBarPosition !== 'side' && (
              <div
                data-slot="workbench-activity-bar"
                x-class={[
                  activityBarDocked,
                  activityBarPosition === 'bottom' && activityBarDockedEnd,
                ]}
              >
                {activityBarSlot}
              </div>
            )}
            <div
              data-slot="workbench-sidebar"
              x-class={[region, activityBarPosition !== 'side' && regionFill]}
            >
              {sidebarSlot}
            </div>
          </ResizablePanel>
        )}
        {sidebarSlot != null && <ResizableHandle className={mobileHidden} />}
        <ResizablePanel id="main">
          <ResizableGroup
            direction="vertical"
            className={verticalFill}
            onResizeCommit={commitVertical}
          >
            {!panelMaximized && (
              <main data-slot="workbench-main" x-class={[editor]}>
                {children}
              </main>
            )}
            {panelSlot != null && !panelMaximized && (
              <ResizableHandle className={mobileHidden} />
            )}
            {panelSlot != null && (
              <ResizablePanel
                id="panel"
                defaultSize={panelMaximized ? undefined : panelHeight}
                minSize={PANEL_MIN}
                maxSize={PANEL_MAX}
                /* Maximized wins over collapsed (a collapsed maximized
                 * panel would blank the main column); the collapsed
                 * control keeps a stable identity across the toggle. */
                collapsible={!panelMaximized}
                collapsed={panelCollapsedCtrl}
                className={mobileHidden}
              >
                <div data-slot="workbench-panel" x-class={[region]}>
                  {panelSlot}
                </div>
              </ResizablePanel>
            )}
          </ResizableGroup>
        </ResizablePanel>
        {auxiliaryBarSlot != null && <ResizableHandle className={mobileHidden} />}
        {auxiliaryBarSlot != null && (
          <ResizablePanel
            id="auxiliary"
            defaultSize={auxiliaryBarWidth}
            minSize={AUXILIARY_MIN}
            maxSize={AUXILIARY_MAX}
            collapsible
            collapsed={auxiliaryBarCollapsedCtrl}
            className={auxOverlay}
            style={
              {
                '--haze-workbench-auxiliary-width': `${auxiliaryBarWidth}px`,
              } as CSSProperties
            }
          >
            <div data-slot="workbench-auxiliary-bar" x-class={[region]}>
              {auxiliaryBarSlot}
            </div>
          </ResizablePanel>
        )}
      </ResizableGroup>
      {statusBarSlot != null && (
        <div data-slot="workbench-status-bar" x-class={[statusBarRegion]}>
          {statusBarSlot}
        </div>
      )}
      {tabBarSlot != null && (
        <div data-slot="workbench-tab-bar" x-class={[tabBarRegion]}>
          {tabBarSlot}
        </div>
      )}
      {sidebarSlot != null && (
        <div
          data-slot="workbench-scrim"
          aria-hidden="true"
          x-class={[scrim]}
          data-open={mobileSidebarOpen || undefined}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      {auxiliaryBarSlot != null && !auxiliaryBarCollapsed && (
        <div
          data-slot="workbench-scrim"
          aria-hidden="true"
          x-class={[scrim]}
          onClick={() => setAuxiliaryBarCollapsed(true)}
        />
      )}
    </div>
  );
}

export type { WorkbenchProps };
