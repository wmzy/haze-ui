//
// ErrorBoundary — catches render-time errors thrown anywhere in its subtree
// and swaps the subtree for a fallback.
//
// Why a class component (a deliberate exception to the "no classes" rule in
// CONVENTIONS.md): React error boundaries exist only through the class
// lifecycle pair `static getDerivedStateFromError` + `componentDidCatch` —
// React ships no hook equivalent, so the library's controllable-state
// protocol (useControl / Control<T> | T) cannot apply here. The error state
// is therefore internal and uncontrolled on purpose; consumers reset it
// imperatively via the `resetErrorBoundary` callback handed to the fallback,
// or reactively via `resetKeys`. The prop surface follows the
// community-standard react-error-boundary API shape (implemented locally —
// no dependency added).
//
// The happy path renders `children` verbatim with no wrapper DOM, so there
// is no element to spread native attributes onto; props stay semantic.
// `className` merges into the default fallback's root only (custom
// fallbacks own their markup).
//
import type { ErrorInfo, ReactNode } from 'react';

import { Component } from 'react';
import { css } from '@linaria/core';

import { useStrings } from '../LocaleProvider';

/** Arguments handed to a render-prop fallback. */
type FallbackRenderArgs = {
  error: Error;
  /** React's component stack; `undefined` on the first render pass before
   * `componentDidCatch` has stored it. */
  info?: ErrorInfo;
  resetErrorBoundary: () => void;
};

type ErrorBoundaryProps = {
  children: ReactNode;
  /** Replacement UI for the errored subtree — a node, or a render prop
   * receiving the error and the reset callback. `undefined` selects the
   * default danger fallback; `null` renders nothing. */
  fallback?: ReactNode | ((args: FallbackRenderArgs) => ReactNode);
  /** Called with the caught error and React's ErrorInfo (for logging /
   * reporting). */
  onError?: (error: Error, info: ErrorInfo) => void;
  /** While an error is showing, a shallow-compare change of these keys
   * (per-item `Object.is`) resets the boundary — the classic "retry when
   * the query key changes" pattern. */
  resetKeys?: readonly unknown[];
  /** Fires right before a `resetKeys` change resets the boundary (only
   * while an error is showing, mirroring react-error-boundary). */
  onResetKeysChange?: (
    prev: readonly unknown[] | undefined,
    next: readonly unknown[] | undefined,
  ) => void;
  /** Merged into the default fallback's root element. */
  className?: string;
};

type ErrorBoundaryState = {
  error: Error | undefined;
  info: ErrorInfo | undefined;
};

/** Shallow `resetKeys` comparison — same identity, or per-item `Object.is`. */
function resetKeysChanged(
  prev: readonly unknown[] | undefined,
  next: readonly unknown[] | undefined,
): boolean {
  if (prev === next) return false;
  if (prev === undefined || next === undefined) return true;
  if (prev.length !== next.length) return true;
  return next.some((key, index) => !Object.is(key, prev[index]));
}

// 与 Alert danger 变体 / AsyncSection 错误框同一套配色（subtle 背景 +
// 25% color-mix 边框），保持错误语义的视觉一致。
const fallbackBox = css`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--haze-space-3);
  padding: var(--haze-space-3) var(--haze-space-4);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-danger-subtle);
  border: 1px solid
    color-mix(in srgb, var(--haze-color-danger) 25%, transparent);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  line-height: var(--haze-leading-normal);
`;

const fallbackTitle = css`
  margin: 0;
  color: var(--haze-color-danger);
  font-weight: var(--haze-weight-semibold);
`;

const fallbackMessage = css`
  margin: 0;
  color: var(--haze-color-danger);
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  overflow-wrap: anywhere;
`;

const fallbackButton = css`
  display: inline-flex;
  align-items: center;
  gap: var(--haze-space-2);
  padding: var(--haze-space-1) var(--haze-space-3);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: transparent;
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-medium);
  line-height: var(--haze-leading-tight);
  cursor: pointer;
  user-select: none;
  transition:
    background var(--haze-duration-fast),
    border-color var(--haze-duration-fast);

  &:hover {
    border-color: var(--haze-color-border-hover);
    background: var(--haze-color-bg-subtle);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--haze-color-focus-ring);
  }

  /* Forced-colors: the box-shadow focus ring is dropped by the UA —
     a Highlight outline replaces it (media-gated, normal rendering
     untouched). */
  @media (forced-colors: active) {
    &:focus-visible {
      outline: 2px solid Highlight;
    }
  }
`;

/** Default fallback UI: danger-skinned alert with the error message and a
 * reset button (copy from the locale packs). A function component so it can
 * consume `useStrings` — the class cannot call hooks. */
function DefaultFallback({
  error,
  className,
  onReset,
}: {
  error: Error;
  className?: string;
  onReset: () => void;
}) {
  const strings = useStrings('errorBoundary');
  return (
    <div x-class={[fallbackBox, className]} role="alert" data-slot="fallback">
      <p x-class={fallbackTitle} data-slot="title">
        {strings.title}
      </p>
      {error.message !== '' && (
        <p x-class={fallbackMessage} data-slot="description">
          {error.message}
        </p>
      )}
      <button
        x-class={fallbackButton}
        type="button"
        data-slot="retry-button"
        onClick={onReset}
      >
        {strings.reset}
      </button>
    </div>
  );
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: undefined, info: undefined };

  static getDerivedStateFromError(
    error: Error,
  ): Partial<ErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const { onError } = this.props;
    onError?.(error, info);
    // The component stack arrives here, one commit after the first fallback
    // render — store it so render-prop fallbacks can surface it.
    this.setState({ info });
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (this.state.error === undefined) return;
    const { resetKeys: next, onResetKeysChange } = this.props;
    const { resetKeys: prev } = prevProps;
    if (!resetKeysChanged(prev, next)) return;
    onResetKeysChange?.(prev, next);
    this.resetErrorBoundary();
  }

  /** Stable identity across renders — safe for fallback consumers' effect
   * deps. */
  readonly resetErrorBoundary = (): void => {
    this.setState({ error: undefined, info: undefined });
  };

  render(): ReactNode {
    const { error, info } = this.state;
    if (error === undefined) return this.props.children;

    const { fallback, className } = this.props;
    if (typeof fallback === 'function') {
      return fallback({
        error,
        info,
        resetErrorBoundary: this.resetErrorBoundary,
      });
    }
    if (fallback !== undefined) return fallback;
    return (
      <DefaultFallback
        error={error}
        className={className}
        onReset={this.resetErrorBoundary}
      />
    );
  }
}

export default ErrorBoundary;
export type { ErrorBoundaryProps, FallbackRenderArgs };
