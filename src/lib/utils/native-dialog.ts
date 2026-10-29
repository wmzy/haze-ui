import type {DialogHTMLAttributes, Dispatch, Ref, SetStateAction} from 'react';

import {useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';

import {useFocusScope} from './focus-scope';
import {whenExitSettles} from './presence';
import {useViewTransitionFlip} from './view-transition';

/**
 * The `<dialog>`-element props `useNativeDialogShell` owns and the caller
 * spreads onto its panel: the exit-animation state marker, the
 * keepMounted dormant attributes, and the native-event close trio.
 */
export type NativeDialogShellProps = Pick<
  DialogHTMLAttributes<HTMLDialogElement>,
  'hidden' | 'inert' | 'onClose' | 'onCancel' | 'onClick'
> & {
  'data-state': 'open' | 'closed';
};

/**
 * Imperative surface every native-`<dialog>` overlay exposes through the
 * React 19 `ref` prop (same API choice as VirtualList). `open`/`close`
 * are state writes going through the same control path as every other
 * open transition, so the animated exit → native `close` event remains
 * the single `onClose` exit — a handle close never double-fires the
 * callback.
 */
export type NativeDialogHandle = {
  /** Show the overlay (`showModal` + initial focus, as if `open` flipped true). */
  open: () => void;
  /**
   * Close through the animated exit; `onClose` fires exactly once, via
   * the native close event — never synchronously here.
   */
  close: () => void;
  /** Focus the element that held focus when the overlay last opened. */
  focusTrigger: () => void;
};

/**
 * The generic imperative surface every overlay exposes through the
 * React 19 `ref` prop, `<dialog>`-element or not (same API choice as
 * VirtualList): state-writing `open`/`close` plus the opener-focusing
 * `focusTrigger`. `NativeDialogHandle` (the native-`<dialog>` shells)
 * and BottomSheet's handle are both this shape.
 */
export type OverlayHandle = {
  /** Show the overlay, as if `open` flipped true. */
  open: () => void;
  /** Close the overlay through its single exit path. */
  close: () => void;
  /** Focus the element that held focus when the overlay last opened. */
  focusTrigger: () => void;
};

/**
 * The overlay half every shell shares, native-`<dialog>` or not: the
 * opener capture behind `focusTrigger()` and the imperative
 * `open`/`close`/`focusTrigger` handle. `useNativeDialogShell`
 * consumes it internally; BottomSheet (a Presence-driven div with its
 * own close path) consumes it directly.
 *
 * MUST be called before the shell's `useFocusScope`: effects run in
 * declaration order, and the scope's effect is what moves focus into
 * the panel — capturing the opener later would record the panel
 * itself. This mirrors the element the scope restores focus to on
 * close.
 *
 * `open`/`close` only write state through `flipOpen`/`close` — the
 * shell's exit machinery (animated exit → native `close` event, or
 * BottomSheet's shared `handleClose`) keeps every exit path
 * single-sourced.
 */
export function useOverlayHandle({
  open,
  flipOpen,
  close,
  ref,
}: {
  open: boolean;
  flipOpen: (next: boolean) => void;
  /** The shell's close path — the native shell only writes state;
   * BottomSheet's also fires its `onClose` (no native close event
   * exists to defer it to). */
  close: () => void;
  ref?: Ref<OverlayHandle>;
}): void {
  const openerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const active = document.activeElement;
    openerRef.current = active instanceof HTMLElement ? active : null;
  }, [open]);

  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        flipOpen(true);
      },
      close,
      focusTrigger: () => {
        const target = openerRef.current;
        if (target?.isConnected) target.focus();
      },
    }),
    [flipOpen, close]
  );
}

/**
 * The shared lifecycle of the native-`<dialog>` modal family (Dialog,
 * Drawer, ConfirmDialog): the keepMounted dormant tracking, the view-transition
 * open/close flip, the focus scope, the showModal/animated-close effect
 * and the native-event close trio, over the generic `useOverlayHandle`
 * (opener capture + imperative handle). The caller keeps the panel's
 * structure: classNames resolution, aria wiring and children stay at
 * the call site. (内部原语，不进 barrel。)
 *
 * @param open The controlled open state (useControl's value half).
 * @param setOpen useControl's writer half.
 * @param viewTransition The component's `viewTransition` prop.
 * @param onClose The component's `onClose` callback, fired from the
 *   native close event only.
 * @param keepMounted The component's `keepMounted` prop.
 * @param ref The component's imperative `ref` prop.
 */
export function useNativeDialogShell({
  open,
  setOpen,
  viewTransition,
  onClose,
  keepMounted,
  ref,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  viewTransition: boolean;
  onClose?: () => void;
  keepMounted: boolean;
  ref?: Ref<NativeDialogHandle>;
}): {
  /** Ref callback merging the internal node ref with the focus scope. */
  setDialogRef: (node: HTMLDialogElement | null) => void;
  /** Spread onto the caller's `<dialog>` panel element. */
  dialogProps: NativeDialogShellProps;
} {
  // keepMounted 的休眠标记：镜像原生 open 属性的缺席——退场动画播完、
  // el.close() 真正落地后才置 true（提前挂 hidden 会用 display:none
  // 掐断正在播放的退场动画）。重开的清除走 render-time 调整：与
  // data-state 翻回 open 同一次提交清除，effect 里清会先画一帧 hidden。
  const [panelDormant, setPanelDormant] = useState(!open);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setPanelDormant(false);
  }
  // open/close 翻转的统一出口：viewTransition 开启时每次翻转包在
  // document.startViewTransition(() => flushSync(...)) 里（不支持或
  // reduce 偏好时退化为直接 setOpen）。
  const flipOpen = useViewTransitionFlip(viewTransition, setOpen);
  // 通用层（opener 捕获 + 命令式 handle，见 useOverlayHandle）：声明在
  // useFocusScope 之前——scope 的 effect 会把焦点移进面板，晚捕获会
  // 记下面板自己。close 只写状态：showModal/close effect 与原生 close
  // 事件的回调链负责其余，每个关闭路径保持单源。
  const closeViaFlip = useCallback(() => flipOpen(false), [flipOpen]);
  useOverlayHandle({ open, flipOpen, close: closeViaFlip, ref });
  const internalRef = useRef<HTMLDialogElement | null>(null);
  // 声明在 showModal effect 之前：scope 激活时先记录 opener（此时的
  // activeElement 还没被 showModal 转进面板），关闭时由 scope 归还。
  // 原生 modal 已锁定 Tab，无需 trapped。
  const setScope = useFocusScope({enabled: open, trapped: false});

  const setDialogRef = useCallback(
    (node: HTMLDialogElement | null) => {
      internalRef.current = node;
      setScope(node);
    },
    [setScope]
  );

  useEffect(() => {
    const el = internalRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      // 退场动画（data-state=closed 驱动 CSS animation）结束后再真正
      // close()，原生 close 事件（onClose 回调链路）保持由 close 触发。
      // jsdom 无 CSS 时长 → whenExitSettles 跨 2 个 rAF 立即完成。
      const settle = whenExitSettles(el);
      const finish = () => {
        // settle 期间被重新打开时 data-state 已翻回 open，本退场流作废
        if (el.getAttribute('data-state') === 'closed') {
          el.close();
          setPanelDormant(true);
        }
      };
      if (settle) void settle.then(finish);
      else finish();
    }
  }, [open]);

  // keepMounted 休眠态：关闭且原生面板已落地 close() 后，hidden + inert
  // 把子树排除出 AT 树与 Tab 序（焦点 scope 随 open 停用，无困焦/归还）。
  // 不传 keepMounted 时两个属性恒为 undefined，渲染输出与现有行为一致。
  const dormant = keepMounted && panelDormant;

  return {
    setDialogRef,
    dialogProps: {
      'data-state': open ? 'open' : 'closed',
      hidden: dormant || undefined,
      inert: dormant || undefined,
      onClose: () => {
        // 原生 close 事件到达时 DOM 已关闭（el.close() 已生效），这里
        // 的 setOpen(false) 只是把 React 状态同步回事实——发起关闭的
        // 交互路径已经拥有那次 view transition，这里再包会捕获两张
        // 相同的（已关闭）快照，因此保持直接写入。
        setOpen(false);
        onClose?.();
      },
      onCancel: (e) => {
        // 原生 Esc/backdrop 的关闭请求会绕过退场动画立即关闭面板：
        // 阻止默认行为，统一改走 React 状态 → 退场动画 → el.close()。
        e.preventDefault();
        flipOpen(false);
      },
      onClick: (e) => {
        if (e.target === internalRef.current) {
          // 只改状态：effect 里的 el.close() 会触发原生 close 事件，
          // onClose 在那个公共出口统一发生。这里再调一次 onClose?.()
          // 会双触发（backdrop 路径命中两次回调）。
          flipOpen(false);
        }
      },
    },
  };
}
