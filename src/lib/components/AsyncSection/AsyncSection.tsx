import type { ReactNode } from 'react';

import { css } from '@linaria/core';

import { useStrings } from '../LocaleProvider';
import {
  calloutBorders,
  calloutColors,
  calloutSurface,
} from '../../utils/callout-skin';
import { quietButton } from '../../utils/quiet-button-skin';
import { SpinnerGlyph, spinAnimation } from '../../utils/spinner-glyph';

type AsyncSectionProps = {
  /**
   * 为真时渲染加载占位（Spinner + loadingText）。优先级最高：错误未
   * 清除时点重试（loading 与 error 同时为真）显示的是加载态。
   */
  loading?: boolean;
  /**
   * 非空值（null/undefined 之外）时渲染错误态（Alert 样式框 + Retry）。
   * Error 实例自动取 message 作为文案，其余值落在通用兜底文案上。
   */
  error?: unknown;
  /** Retry 按钮回调；不传时不渲染按钮，只显示错误信息。 */
  onRetry?: () => void;
  loadingText?: string;
  errorText?: string;
  retryText?: string;
  className?: string;
  children: ReactNode;
};

const base = css`
  font-family: var(--haze-font-sans);
  color: var(--haze-color-text);
`;

const placeholder = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--haze-space-3);
  padding: var(--haze-space-8) var(--haze-space-4);
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-sm);
`;

/* The glyph and the spin loop (incl. the reduced-motion collapse)
 * come from utils/spinner-glyph.tsx — shared with Spinner and Toast's
 * loading variant; this box owns only the 24px geometry. */
const spinnerBox = css`
  display: inline-flex;
  width: 24px;
  height: 24px;
`;

// 与 Alert danger 变体同一套配色（共享 callout 皮肤：subtle 背景 + 25%
// color-mix 边框），保持错误语义的视觉一致。本地 delta 只留纵向堆叠布局：
// message 在上、Retry 在下，flex-start 对齐，多行 message 走 normal 行高。
// 属性与 calloutSurface / 调色层 / 边框层完全不相交，注入顺序无关。
const errorBoxDelta = css`
  flex-direction: column;
  align-items: flex-start;
  gap: var(--haze-space-4);
  line-height: var(--haze-leading-normal);
`;

const errorMessage = css`
  margin: 0;
  color: var(--haze-color-danger);
`;

// The retry button wears the shared quiet-button skin
// (utils/quiet-button-skin.ts) — this file kept a byte-identical
// hand-rolled copy before the split.

export default function AsyncSection({
  loading = false,
  error,
  onRetry,
  loadingText,
  errorText,
  retryText,
  className,
  children,
}: AsyncSectionProps) {
  const strings = useStrings('asyncSection');
  const loadingLabel = loadingText ?? strings.loading;
  const retryLabel = retryText ?? strings.retry;
  if (loading) {
    return (
      <section data-slot='async-section' x-class={[base, className]} aria-busy="true">
        <div data-slot='loading' x-class={[placeholder]} role="status">
          <span data-slot='spinner' x-class={[spinnerBox, spinAnimation]} aria-hidden="true">
            <SpinnerGlyph />
          </span>
          {loadingLabel}
        </div>
      </section>
    );
  }

  if (error !== null && error !== undefined) {
    const message =
      errorText ??
      (error instanceof Error && error.message ? error.message : undefined) ??
      strings.error;
    return (
      <section data-slot='async-section' x-class={[base, className]}>
        <div
          data-slot='error'
          x-class={[
            calloutSurface,
            calloutColors.danger,
            calloutBorders.danger,
            errorBoxDelta,
          ]}
          role="alert"
        >
          <p data-slot='message' x-class={[errorMessage]}>{message}</p>
          {onRetry && (
            <button data-slot='retry-button' type="button" x-class={[quietButton]} onClick={onRetry}>
              {retryLabel}
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section data-slot='async-section' x-class={[base, className]}>
      {children}
    </section>
  );
}

export type { AsyncSectionProps };
