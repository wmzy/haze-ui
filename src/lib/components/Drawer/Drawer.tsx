import type { ReactNode, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

import { useNativeDialogShell } from '../../utils/native-dialog';
import { dialogBackdrop } from '../../utils/dialog-skin';
import { focusRingVisible } from '../../utils/focus-ring';
import { mergeClassNames, useConfigDefaults } from '../ConfigProvider/useConfigDefaults';

/**
 * Imperative handle exposed through the React 19 `ref` prop (same API
 * choice as VirtualList). `open`/`close` are state writes going through
 * the same control path as every other open transition, so the animated
 * exit → native `close` event remains the single `onClose` exit — a
 * handle close never double-fires the callback.
 */
type DrawerHandle = {
  /** Show the drawer (`showModal` + initial focus, as if `open` flipped true). */
  open: () => void;
  /**
   * Close the drawer through the animated exit; `onClose` fires exactly
   * once, via the native close event — never synchronously here.
   */
  close: () => void;
  /** Focus the element that held focus when the drawer last opened. */
  focusTrigger: () => void;
};

/**
 * Semantic slot classes (AntD v6 `classNames` shape): keys land classes
 * on Drawer's structural parts. Drawer renders a single `<dialog>` —
 * `content` is that element's part (the placement class and any
 * `className` land on the same node). A `classNames` prop set via
 * ConfigProvider merges under the prop's keys.
 */
type DrawerClassNames = {
  /** The `<dialog>` panel itself (data-slot='content'). */
  content?: string;
};

type DrawerProps = {
  open?: ControlOrValue<boolean>;
  placement?: 'left' | 'right' | 'top' | 'bottom';
  /**
   * 面板尺寸预设（默认不传，保持历史 320px 不变）。映射：
   * left/right 控宽 —— sm 360px / md 480px / lg 640px；
   * top/bottom 控高 —— sm 240px / md 360px / lg 480px。
   * 实现为尺寸自定义属性：预设类只声明 `--haze-drawer-width` /
   * `--haze-drawer-height`，placement 类消费（`width:
   * var(--haze-drawer-width, 320px)`）——不存在同属性类竞争，预设
   * 的生效与 CSS 注入顺序无关；消费方也可用内联 style 或
   * `classNames.content` 上的同名自定义属性直接覆盖像素值。
   */
  size?: 'sm' | 'md' | 'lg';
  onClose?: () => void;
  /**
   * 开/关状态翻转是否包进 View Transitions API（默认 `false`，行为与
   * 不传完全一致）。开启后每次显隐翻转都运行在
   * `document.startViewTransition(() => flushSync(...))` 里（React 官方
   * 要求的同步 DOM 更新模式），页面获得原生过渡；命令式 handle、
   * Esc、背景点击等路径共用同一出口。引擎不支持
   * `startViewTransition` 或用户偏好 `prefers-reduced-motion: reduce`
   * 时自动退化为直接翻转。过渡外观由消费方的 `::view-transition-*`
   * 样式定义，组件自身的进退场动画照常运行在新快照内。
   */
  viewTransition?: boolean;
  className?: string;
  /** Slot classes (see {@link DrawerClassNames}). */
  classNames?: DrawerClassNames;
  /**
   * 关闭后内容保持挂载（Radix `forceMount` / Ark `hideMode="hidden"`
   * 语义）。`<dialog>` 元素本就常驻 DOM、children 随之常驻——表单
   * 草稿与内部状态天然跨开关存活；本 prop 额外固化关闭态的可达性
   * 契约：退场动画播完、原生 `close()` 落地后，面板带上 `hidden` +
   * `inert`（在 UA 对非 open dialog 的 display:none 之外，把子树
   * 显式排除出 AT 树与 Tab 序——消费者样式覆写关闭面板 display 的
   * 场景依然安全），焦点逻辑随 `open` 关闭而停用；重开时属性移除、
   * 进场动画重播。默认 `false`：不传时渲染输出与现有行为完全一致。
   */
  keepMounted?: boolean;
  children: ReactNode;
  ref?: Ref<DrawerHandle>;
};

const overlay = css`
  border: none;
  /* The placement classes size this box (width/height + max-width);
   * border-box keeps consumer padding and the forced-colors boundary
   * inside the declared size (the mobile-overflow contract, Dialog's
   * precedent). */
  box-sizing: border-box;
  padding: 0;
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  max-height: 100vh;
  max-width: 100vw;
  overflow: auto;

  &[open][data-state='open'] {
    animation: haze-drawer-in var(--haze-duration-normal) var(--haze-ease);
  }

  &[open][data-state='closed'] {
    animation: haze-drawer-out var(--haze-duration-fast) var(--haze-ease);
  }

  /* The scrim and its fades are the shared dialog-skin companion
   * (dialogBackdrop) composed next to this class, and the keyboard
   * ring is utils/focus-ring's focusRingVisible (likewise composed
   * below); only the placement slide below stays family-local. */

  /* 进出场位移由 placement 类注入变量，一对 keyframes 覆盖四个方向 */
  @keyframes haze-drawer-in {
    from {
      transform: translate(
        var(--haze-drawer-from-x, 0),
        var(--haze-drawer-from-y, 0)
      );
    }
  }

  @keyframes haze-drawer-out {
    to {
      transform: translate(
        var(--haze-drawer-from-x, 0),
        var(--haze-drawer-from-y, 0)
      );
    }
  }

  /* Forced-colors: the panel's opaque background flattens onto Canvas
     and the drawer declares border:none — an open drawer would blend
     into the page. A CanvasText boundary separates the panel from the
     Canvas behind it; the Highlight outline itself comes from the
     composed focusRingVisible — only its inset offset (an outer ring
     would overflow the viewport-pinned panel) stays here. */
  @media (forced-colors: active) {
    border: 1px solid CanvasText;

    &:focus-visible {
      outline-offset: -2px;
    }
  }
`;

/* physical: placement is a physical API ('left'/'right' edge of the
   viewport, matching the ±100% slide-in vars below); the pinned edge
   must not flip with direction. */
const placements = {
  left: css`
    height: 100vh;
    width: var(--haze-drawer-width, 320px);
    min-width: var(--haze-drawer-min-width, 280px);
    max-width: 85vw;
    /* physical: pins the left drawer to the physical left edge.
       UA dialog:modal margin is auto — both sides must be explicit,
       a lone margin-left 0 leaves the UA auto on the right and (with
       an auto on both sides) centers the drawer. */
    margin-left: 0;
    margin-right: auto;
    --haze-drawer-from-x: -100%;
    --haze-drawer-from-y: 0;
  `,
  right: css`
    height: 100vh;
    width: var(--haze-drawer-width, 320px);
    min-width: var(--haze-drawer-min-width, 280px);
    max-width: 85vw;
    /* physical: pins the right drawer to the physical right edge. */
    margin-left: auto;
    margin-right: 0;
    --haze-drawer-from-x: 100%;
    --haze-drawer-from-y: 0;
  `,
  top: css`
    width: 100vw;
    height: var(--haze-drawer-height, 320px);
    margin-top: 0;
    margin-bottom: auto;
    --haze-drawer-from-x: 0;
    --haze-drawer-from-y: -100%;
  `,
  bottom: css`
    width: 100vw;
    height: var(--haze-drawer-height, 320px);
    margin-top: auto;
    margin-bottom: 0;
    --haze-drawer-from-x: 0;
    --haze-drawer-from-y: 100%;
  `,
} as const;

/* Size presets: the classes only SET the sizing custom properties the
   placement classes consume above — no same-property class conflict, so
   a preset wins regardless of CSS emission order, and consumers keep a
   plain custom-property override entry (inline style or CSS on the
   dialog). Mapping documented on the `size` prop. */
const sizes = {
  sm: css`
    --haze-drawer-width: 360px;
    --haze-drawer-height: 240px;
  `,
  md: css`
    --haze-drawer-width: 480px;
    --haze-drawer-height: 360px;
  `,
  lg: css`
    --haze-drawer-width: 640px;
    --haze-drawer-height: 480px;
  `,
} as const;

export default function Drawer({
  open: openControl,
  placement = 'right',
  size,
  onClose,
  viewTransition = false,
  keepMounted = false,
  className,
  classNames,
  children,
  ref,
}: DrawerProps) {
  const [open, setOpen] = useControl(openControl, false);
  const config = useConfigDefaults('Drawer');
  // Per-key merge of the config section under the prop.
  const resolvedClassNames = mergeClassNames(config, classNames);
  // 面板生命周期（showModal/退场动画→close、keepMounted 休眠、命令式
  // handle、Esc/背景点击关闭三件套）与 Dialog 共用同一原语。
  const {setDialogRef, dialogProps} = useNativeDialogShell({
    open,
    setOpen,
    viewTransition,
    onClose,
    keepMounted,
    ref,
  });

  return (
    <dialog
      ref={setDialogRef}
      data-slot='content'
      {...dialogProps}
      x-class={[overlay, focusRingVisible, dialogBackdrop, placements[placement], size !== undefined && sizes[size], className, resolvedClassNames?.content]}
    >
      {children}
    </dialog>
  );
}

export type { DrawerClassNames, DrawerProps, DrawerHandle };
