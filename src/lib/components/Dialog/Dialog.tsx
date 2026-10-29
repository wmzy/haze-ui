import type { ReactNode, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { css } from '@linaria/core';
import { useId } from 'react';
import { useControl } from 'react-use-control';

import { useNativeDialogShell } from '../../utils/native-dialog';
import { dialogBackdrop, dialogPanelMotion } from '../../utils/dialog-skin';

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

  &:focus-visible {
    outline: none;
    box-shadow:
      var(--haze-shadow-xl),
      0 0 0 3px var(--haze-color-focus-ring);
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
  // 面板生命周期（showModal/退场动画→close、keepMounted 休眠、命令式
  // handle、Esc/背景点击关闭三件套）与 Drawer 共用同一原语。
  const {setDialogRef, dialogProps} = useNativeDialogShell({
    open,
    setOpen,
    viewTransition,
    onClose,
    keepMounted,
    ref,
  });
  // 与 FormItem 的 haze-field-${useId} 同一套生成模式，保证前缀可读且不冲突。
  const titleId = `haze-dialog-title-${useId()}`;

  return (
    <dialog
      ref={setDialogRef}
      data-slot='content'
      {...dialogProps}
      aria-labelledby={title !== undefined ? titleId : undefined}
      x-class={[overlay, dialogPanelMotion, dialogBackdrop, className, classNames?.root]}
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
