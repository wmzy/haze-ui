import type { ErrorInfo } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { defaultStrings } from '../LocaleProvider/locale';
import { zhCN } from '../LocaleProvider/zh-cn';

import ErrorBoundary from './ErrorBoundary';

/** Throws during render when `shouldThrow` — the minimal failure fixture. */
function Bomb({ shouldThrow }: { shouldThrow?: boolean }) {
  if (shouldThrow) throw new Error('boom');
  return <p>stable content</p>;
}

/** Throws an error whose message is the empty string. */
function EmptyMessageBomb(): never {
  throw new Error('');
}

/**
 * React surfaces boundary-caught errors through console.error in dev
 * builds. The spy captures that channel (asserted below) while keeping the
 * test output noise-free — the dual-channel pattern from
 * ssr-hydration.test.tsx.
 */
const consoleErrors: string[] = [];

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    consoleErrors.push(args.join(' '));
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  consoleErrors.length = 0;
});

describe('ErrorBoundary', () => {
  it('renders children untouched when nothing throws', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByText('stable content')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('replaces the errored subtree with the default fallback', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );
    const fallback = screen.getByRole('alert');
    expect(fallback).toHaveAttribute('data-slot', 'fallback');
    expect(fallback).toHaveTextContent('Something went wrong');
    expect(fallback).toHaveTextContent('boom');
    expect(screen.getByRole('button', { name: 'Try again' })).toHaveAttribute(
      'data-slot',
      'retry-button',
    );
    expect(screen.queryByText('stable content')).not.toBeInTheDocument();
  });

  it('omits the message paragraph for an error with an empty message', () => {
    const { container } = render(
      <ErrorBoundary>
        <EmptyMessageBomb />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Something went wrong',
    );
    expect(container.querySelector('[data-slot="description"]')).toBeNull();
  });

  it('captures (and silences) the React boundary log via console.error', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(consoleErrors.join('\n')).toContain('boom');
  });

  it('applies className to the default fallback root', () => {
    render(
      <ErrorBoundary className="custom">
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toHaveClass('custom');
  });

  it('restores children after the default fallback reset button is clicked', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Heal the data first — reset re-renders the children, which must not
    // throw again for the recovery to stick.
    rerender(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument(); // still errored

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByText('stable content')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('re-catches a child that throws again after a reset', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    // Bomb still throws with the current props — the boundary re-enters
    // the fallback state instead of crashing the tree.
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByText('stable content')).toBeInTheDocument();
  });

  it('resets when resetKeys change while an error is showing', () => {
    const onError = vi.fn();
    const { rerender } = render(
      <ErrorBoundary onError={onError} resetKeys={[1]}>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(
      <ErrorBoundary onError={onError} resetKeys={[2]}>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByText('stable content')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does not reset when resetKeys change only by array identity', () => {
    const { rerender } = render(
      <ErrorBoundary resetKeys={[1]}>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(
      <ErrorBoundary resetKeys={[1]}>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('calls onResetKeysChange with prev/next when a reset fires', () => {
    const onResetKeysChange = vi.fn();
    const { rerender } = render(
      <ErrorBoundary onResetKeysChange={onResetKeysChange} resetKeys={[1]}>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );
    rerender(
      <ErrorBoundary onResetKeysChange={onResetKeysChange} resetKeys={[2]}>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(onResetKeysChange).toHaveBeenCalledTimes(1);
    expect(onResetKeysChange).toHaveBeenCalledWith([1], [2]);
    expect(screen.getByText('stable content')).toBeInTheDocument();
  });

  it('does not call onResetKeysChange without a caught error', () => {
    const onResetKeysChange = vi.fn();
    const { rerender } = render(
      <ErrorBoundary onResetKeysChange={onResetKeysChange} resetKeys={[1]}>
        <Bomb />
      </ErrorBoundary>,
    );
    rerender(
      <ErrorBoundary onResetKeysChange={onResetKeysChange} resetKeys={[2]}>
        <Bomb />
      </ErrorBoundary>,
    );
    expect(onResetKeysChange).not.toHaveBeenCalled();
  });

  it('calls onError with the error and React ErrorInfo', () => {
    const onError = vi.fn<(error: Error, info: ErrorInfo) => void>();
    render(
      <ErrorBoundary onError={onError}>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );
    expect(onError).toHaveBeenCalledTimes(1);
    const [caughtError, caughtInfo] = onError.mock.lastCall ?? [undefined, undefined];
    expect(caughtError).toBeInstanceOf(Error);
    expect(caughtError?.message).toBe('boom');
    expect(String(caughtInfo?.componentStack)).toContain('Bomb');
  });

  it('renders a fallback node as-is', () => {
    render(
      <ErrorBoundary fallback={<p>node fallback</p>}>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByText('node fallback')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('hands error / info / resetErrorBoundary to a render-prop fallback', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <ErrorBoundary
        fallback={({ error, info, resetErrorBoundary }) => (
          <div role="alert">
            <span>custom: {error.message}</span>
            {/* The component stack arrives on the pass after
                componentDidCatch stores it — the DOM settles there. */}
            <span data-testid="stack">
              {info?.componentStack ? 'has-stack' : 'no-stack'}
            </span>
            <button type="button" onClick={resetErrorBoundary}>
              custom-reset
            </button>
          </div>
        )}
      >
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );
    expect(screen.getByText('custom: boom')).toBeInTheDocument();
    expect(screen.getByTestId('stack')).toHaveTextContent('has-stack');

    rerender(
      <ErrorBoundary
        fallback={({ error, resetErrorBoundary }) => (
          <div role="alert">
            <span>custom: {error.message}</span>
            <button type="button" onClick={resetErrorBoundary}>
              custom-reset
            </button>
          </div>
        )}
      >
        <Bomb />
      </ErrorBoundary>,
    );
    await user.click(screen.getByRole('button', { name: 'custom-reset' }));
    expect(screen.getByText('stable content')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('a nested boundary catches locally and the outer tree survives', () => {
    render(
      <ErrorBoundary fallback={<p>outer fallback</p>}>
        <p>outer sibling</p>
        <ErrorBoundary fallback={<p>inner fallback</p>}>
          <Bomb shouldThrow />
        </ErrorBoundary>
      </ErrorBoundary>,
    );
    expect(screen.getByText('inner fallback')).toBeInTheDocument();
    expect(screen.getByText('outer sibling')).toBeInTheDocument();
    expect(screen.queryByText('outer fallback')).not.toBeInTheDocument();
  });

  it('ships the errorBoundary copy section in the locale packs', () => {
    expect(Object.keys(defaultStrings.errorBoundary).sort()).toEqual([
      'reset',
      'title',
    ]);
    expect(zhCN.errorBoundary.title).not.toBe('');
    expect(zhCN.errorBoundary.reset).not.toBe('');
  });

  it('has no axe violations on the default fallback', async () => {
    const { axe } = await import('jest-axe');
    render(
      <ErrorBoundary>
        <Bomb shouldThrow />
      </ErrorBoundary>,
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
