import type { ReactNode, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { css } from '@linaria/core';
import { useCallback, useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import { useControl } from 'react-use-control';

import { useFocusScope } from '../../utils/focus-scope';
import { whenExitSettles } from '../../utils/presence';
import { useViewTransitionFlip } from '../../utils/view-transition';

/**
 * Imperative handle exposed through the React 19 `ref` prop (same API
 * choice as VirtualList). `open`/`close` are state writes going through
 * the same control path as every other open transition, so the animated
 * exit → native `close` event remains the single `onClose` exit — a
 * handle close never double-fires the callback.
 */
type DialogHandle = {
  /** Show the dialog (`showModal` + initial focus, as if `open` flipped true). */
  open: () => void;
  /**
   * Close the dialog through the animated exit; `onClose` fires exactly
   * once, via the native close event — never synchronously here.
   */
  close: () => void;
  /** Focus the element that held focus when the dialog last opened. */
  focusTrigger: () => void;
};

/**
 * Semantic slot classes (AntD v6 `classNames` 形态)：键名对应 Dialog 的
 * 结构部位，消费者类名追加在部位节点 x-class 数组末尾（可覆盖组件
 * 默认样式）。Dialog 的面板就是 `<dialog>` 元素本身、遮罩是它的
 * `::backdrop` 伪元素（无法挂类），因此只有这两个真实部位：
 *
 * - `root` — `<dialog>` 面板元素
 * - `header` — `title` prop 渲染出的 `<h2>` 标题（不传 title 时不存在）
 */
type DialogClassNames = {
  /** `<dialog>` 面板元素（含内边距/圆角/阴影的盒子）。 */
  root?: string;
  /** 标题 `<h2>`；仅在传 `title` prop 时渲染。 */
  header?: string;
};

/**
 * Component-level tokens: Dialog can be rethemed per-component by setting
 * `--haze-dialog-*` custom properties on `:root` or any ancestor. The
 * library never defines them — the stylesheet only carries fallback
 * chains, so unset variables keep the shipped look:
 *
 * - `--haze-dialog-width` — panel max-width (fallback `480px`)
 * - `--haze-dialog-radius` — panel corner radius (fallback `--haze-radius-xl`)
 * - `--haze-dialog-padding` — panel body padding (fallback `--haze-space-6`)
 * - `--haze-dialog-title-gap` — gap between title and body (fallback `--haze-space-4`)
 * - `--haze-dialog-title-font-size` — title text size (fallback `--haze-text-lg`)
 */
type DialogProps = {
  open?: ControlOrValue<boolean>;
  onClose?: () => void;
  /**
   * 对话框标题：渲染为 h2 并以生成的 id 关联 dialog 的
   * aria-labelledby，屏幕阅读器打开时才能朗读标题（原生 dialog 的
   * 可访问名默认为空）。不传时不生成空关联。
   */
  title?: ReactNode;
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
  /**
   * 语义槽位类名（AntD v6 `classNames` 形态）：按键把消费者类落到
   * Dialog 的结构部位（见 {@link DialogClassNames}）。槽位类追加在
   * 部位节点类列表末尾，可与根节点 `className` 并用（`className`
   * 同样落在 `<dialog>` 上，`classNames.root` 在其后）。不传时渲染
   * 输出零变化。
   */
  classNames?: DialogClassNames;
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
  className?: string;
  children: ReactNode;
  ref?: Ref<DialogHandle>;
};

const overlay = css`
  border: none;
  box-sizing: border-box;
  border-radius: var(--haze-dialog-radius, var(--haze-radius-xl));
  padding: var(--haze-dialog-padding, var(--haze-space-6));
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  box-shadow: var(--haze-shadow-xl);
  max-width: var(--haze-dialog-width, 480px);
  width: 100%;

  &[open][data-state='open'] {
    animation: haze-dialog-in var(--haze-duration-normal) var(--haze-ease);
  }

  &[open][data-state='closed'] {
    animation: haze-dialog-out var(--haze-duration-fast) var(--haze-ease);
  }

  &::backdrop {
    background: rgba(0, 0, 0, 0.4);
  }

  &[open][data-state='open']::backdrop {
    animation: haze-dialog-backdrop-in var(--haze-duration-normal)
      var(--haze-ease);
  }

  &[open][data-state='closed']::backdrop {
    animation: haze-dialog-backdrop-out var(--haze-duration-fast)
      var(--haze-ease);
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      var(--haze-shadow-xl),
      0 0 0 3px var(--haze-color-focus-ring);
  }

  @keyframes haze-dialog-in {
    from {
      opacity: 0;
      transform: scale(0.97);
    }
  }

  @keyframes haze-dialog-out {
    to {
      opacity: 0;
      transform: scale(0.97);
    }
  }

  @keyframes haze-dialog-backdrop-in {
    from {
      opacity: 0;
    }
  }

  @keyframes haze-dialog-backdrop-out {
    to {
      opacity: 0;
    }
  }

  /* Forced-colors: the panel's opaque background flattens onto Canvas
     and the dialog declares border:none — an open modal would blend
     into the page. A CanvasText boundary separates the panel from the
     Canvas behind it (the box-shadow is dropped by the UA), and the
     squashed focus ring is replaced by a Highlight outline. */
  @media (forced-colors: active) {
    border: 1px solid CanvasText;

    &:focus-visible {
      outline: 2px solid Highlight;
      outline-offset: -2px;
    }
  }
`;

const titleText = css`
  margin: 0 0 var(--haze-dialog-title-gap, var(--haze-space-4));
  font-size: var(--haze-dialog-title-font-size, var(--haze-text-lg));
  font-weight: var(--haze-weight-semibold);
`;

export default function Dialog({
  open: openControl,
  onClose,
  title,
  viewTransition = false,
  classNames,
  keepMounted = false,
  className,
  children,
  ref,
}: DialogProps) {
  const [open, setOpen] = useControl(openControl, false);
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
  const openerRef = useRef<HTMLElement | null>(null);
  // Opener capture for the imperative handle's focusTrigger(). Declared
  // BEFORE useFocusScope on purpose: effects run in declaration order,
  // and the scope's effect is what moves focus into the dialog —
  // capturing later would record the dialog itself. This mirrors the
  // element the scope restores focus to on close.
  useEffect(() => {
    if (!open) return;
    const active = document.activeElement;
    openerRef.current = active instanceof HTMLElement ? active : null;
  }, [open]);
  const internalRef = useRef<HTMLDialogElement | null>(null);
  // 声明在 showModal effect 之前：scope 激活时先记录 opener（此时的
  // activeElement 还没被 showModal 转进 dialog），关闭时由 scope 归还。
  // 原生 modal 已锁定 Tab，无需 trapped。
  const setScope = useFocusScope({ enabled: open, trapped: false });
  // 与 FormItem 的 haze-field-${useId} 同一套生成模式，保证前缀可读且不冲突。
  const titleId = `haze-dialog-title-${useId()}`;

  // Imperative surface: `ref.current?.open()/close()/focusTrigger()`.
  // open/close only write the state — the showModal/close effect and the
  // native close-event callback chain do the rest, keeping every exit
  // path single-sourced.
  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        flipOpen(true);
      },
      close: () => {
        flipOpen(false);
      },
      focusTrigger: () => {
        const target = openerRef.current;
        if (target?.isConnected) target.focus();
      },
    }),
    [flipOpen]
  );

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

  return (
    <dialog
      ref={setDialogRef}
      data-slot='content'
      data-state={open ? 'open' : 'closed'}
      aria-labelledby={title !== undefined ? titleId : undefined}
      hidden={dormant || undefined}
      inert={dormant || undefined}
      x-class={[overlay, className, classNames?.root]}
      onClose={() => {
        // 原生 close 事件到达时 DOM 已关闭（el.close() 已生效），这里
        // 的 setOpen(false) 只是把 React 状态同步回事实——发起关闭的
        // 交互路径已经拥有那次 view transition，这里再包会捕获两张
        // 相同的（已关闭）快照，因此保持直接写入。
        setOpen(false);
        onClose?.();
      }}
      onCancel={(e) => {
        // 原生 Esc/backdrop 的关闭请求会绕过退场动画立即关闭 dialog：
        // 阻止默认行为，统一改走 React 状态 → 退场动画 → el.close()。
        e.preventDefault();
        flipOpen(false);
      }}
      onClick={(e) => {
        if (e.target === internalRef.current) {
          // 只改状态：effect 里的 el.close() 会触发原生 close 事件，
          // onClose 在那个公共出口统一发生。这里再调一次 onClose?.()
          // 会双触发（backdrop 路径命中两次回调）。
          flipOpen(false);
        }
      }}
    >
      {title !== undefined && (
        <h2 id={titleId} data-slot='title' x-class={[titleText, classNames?.header]}>
          {title}
        </h2>
      )}
      {children}
    </dialog>
  );
}

export type { DialogProps, DialogHandle, DialogClassNames };
