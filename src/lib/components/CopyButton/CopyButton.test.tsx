import { expect } from 'vitest';
import { createRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { squareSizes } from '../Button/styles';

import CopyButton from './CopyButton';
import Snippet from './Snippet';
import { iconSizes } from './copy-button-styles';

// jsdom 30 has neither navigator.clipboard nor document.execCommand —
// the same stub surface useClipboard's own tests patch. The stub MUST
// be installed AFTER userEvent.setup(): user-event attaches its own
// navigator.clipboard polyfill during setup, silently replacing any
// earlier stub (ours is configurable, so redefining on top of
// user-event's works).
function stubClipboard(writeText: (text: string) => Promise<void>) {
  const fn = vi.fn(writeText);
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: fn },
    configurable: true,
  });
  return {
    fn,
    restore: () => {
      Reflect.deleteProperty(navigator, 'clipboard');
    },
  };
}

function svgPath(container: HTMLElement) {
  return container.querySelector('button svg path')?.getAttribute('d');
}

describe('CopyButton', () => {
  it('renders an icon button named by copyLabel', () => {
    const { container } = render(<CopyButton value="npm install haze-ui" />);
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
    expect(container.querySelector('button svg')).toBeInTheDocument();
  });

  it('copies value through the async clipboard API', async () => {
    const user = userEvent.setup();
    const clipboard = stubClipboard(() => Promise.resolve());
    try {
      render(<CopyButton value="pnpm add haze-ui" />);
      await user.click(screen.getByRole('button', { name: 'Copy' }));
      expect(clipboard.fn).toHaveBeenCalledOnce();
      expect(clipboard.fn).toHaveBeenCalledWith('pnpm add haze-ui');
    } finally {
      clipboard.restore();
    }
  });

  it('enters the copied state: glyph, data-copied, swapped label, status text', async () => {
    const user = userEvent.setup();
    const clipboard = stubClipboard(() => Promise.resolve());
    try {
      const { container } = render(<CopyButton value="hello" />);
      const idlePath = svgPath(container);
      expect(screen.getByRole('button')).not.toHaveAttribute('data-copied');

      await user.click(screen.getByRole('button', { name: 'Copy' }));

      const button = screen.getByRole('button', { name: 'Copied' });
      expect(button).toHaveAttribute('data-copied');
      expect(svgPath(container)).not.toBe(idlePath);
      expect(screen.getByRole('status')).toHaveTextContent('Copied');
    } finally {
      clipboard.restore();
    }
  });

  it('reverts to idle after copiedTimeout (fake timers)', async () => {
    // fireEvent, not userEvent: under fake timers user-event's own
    // pointer choreography waits on a timer that never fires (the
    // Carousel/Toast precedent for fake-timer interaction).
    vi.useFakeTimers();
    const clipboard = stubClipboard(() => Promise.resolve());
    try {
      render(<CopyButton value="hello" copiedTimeout={1000} />);
      fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
      // flush the async clipboard microtask chain
      await act(async () => {
        await Promise.resolve();
      });
      expect(screen.getByRole('button')).toHaveAttribute('data-copied');

      act(() => {
        vi.advanceTimersByTime(999);
      });
      expect(screen.getByRole('button')).toHaveAttribute('data-copied');

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(screen.getByRole('button', { name: 'Copy' })).not.toHaveAttribute(
        'data-copied',
      );
      expect(screen.getByRole('status')).toHaveTextContent('');
    } finally {
      clipboard.restore();
      vi.useRealTimers();
    }
  });

  it('evaluates getValue on every click and prefers it over value', async () => {
    const user = userEvent.setup();
    const clipboard = stubClipboard(() => Promise.resolve());
    try {
      let counter = 0;
      const getValue = () => `reading-${++counter}`;
      render(<CopyButton value="stale" getValue={getValue} />);
      const button = screen.getByRole('button');
      await user.click(button);
      await user.click(button);
      expect(clipboard.fn.mock.calls.map((c) => c[0])).toEqual([
        'reading-1',
        'reading-2',
      ]);
    } finally {
      clipboard.restore();
    }
  });

  it('stays idle when both copy paths fail', async () => {
    // writeText rejects and jsdom has no document.execCommand, so the
    // legacy fallback throws inside its try/catch — copy() resolves
    // false and the copied state never engages.
    const user = userEvent.setup();
    const clipboard = stubClipboard(() => Promise.reject(new Error('denied')));
    try {
      render(<CopyButton value="hello" />);
      await user.click(screen.getByRole('button', { name: 'Copy' }));
      expect(screen.getByRole('button')).not.toHaveAttribute('data-copied');
    } finally {
      clipboard.restore();
    }
  });

  it('does not call the clipboard without value or getValue', async () => {
    const user = userEvent.setup();
    const clipboard = stubClipboard(() => Promise.resolve());
    try {
      render(<CopyButton />);
      await user.click(screen.getByRole('button'));
      expect(clipboard.fn).not.toHaveBeenCalled();
    } finally {
      clipboard.restore();
    }
  });

  it('keeps a consumer onClick alive after the copy wiring', async () => {
    const user = userEvent.setup();
    const clipboard = stubClipboard(() => Promise.resolve());
    try {
      const onClick = vi.fn();
      render(<CopyButton value="hello" onClick={onClick} />);
      await user.click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledOnce();
      expect(onClick.mock.calls[0]?.[0]).toMatchObject({ type: 'click' });
    } finally {
      clipboard.restore();
    }
  });

  it('switches text labels through the render-prop children', async () => {
    const user = userEvent.setup();
    const clipboard = stubClipboard(() => Promise.resolve());
    try {
      render(
        <CopyButton value="hello" square={false}>
          {(copied) => (copied ? 'Copied!' : 'Copy me')}
        </CopyButton>,
      );
      expect(screen.getByRole('button', { name: 'Copy' })).toHaveTextContent(
        'Copy me',
      );
      await user.click(screen.getByRole('button'));
      expect(screen.getByRole('button', { name: 'Copied' })).toHaveTextContent(
        'Copied!',
      );
    } finally {
      clipboard.restore();
    }
  });

  it('scales its chrome and glyph with size', () => {
    const { rerender } = render(<CopyButton value="hello" size="lg" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass(squareSizes.lg);
    expect(button.querySelector('svg')).toHaveClass(iconSizes.lg);
    rerender(<CopyButton value="hello" size="sm" />);
    expect(screen.getByRole('button')).toHaveClass(squareSizes.sm);
    expect(screen.getByRole('button').querySelector('svg')).toHaveClass(
      iconSizes.sm,
    );
  });

  it('applies className and classNames slots', () => {
    const { container } = render(
      <CopyButton
        value="hello"
        className="custom"
        classNames={{ root: 'slot-root', icon: 'slot-icon' }}
      />,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom');
    expect(button).toHaveClass('slot-root');
    expect(container.querySelector('button svg')).toHaveClass('slot-icon');
  });

  it('forwards ref to the button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<CopyButton ref={ref} value="hello" />);
    expect(ref.current).toBe(screen.getByRole('button'));
  });

  it('forwards native props onto the button', () => {
    render(<CopyButton value="hello" data-testid="copy" disabled />);
    expect(screen.getByTestId('copy')).toBeDisabled();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    const user = userEvent.setup();
    const clipboard = stubClipboard(() => Promise.resolve());
    try {
      // 'region' fires for any content outside a landmark — an
      // artifact of the bare test document, not the component.
      const options = { rules: { region: { enabled: false } } };
      const { unmount } = render(<CopyButton value="hello" aria-label="Copy value" />);
      let results = await axe(document.body, options);
      expect(results.violations).toEqual([]);
      // the copied shape (swapped label + status announcement) too
      await user.click(screen.getByRole('button'));
      results = await axe(document.body, options);
      expect(results.violations).toEqual([]);
      unmount();
    } finally {
      clipboard.restore();
    }
  });
});

describe('Snippet', () => {
  it('renders the value as mono content with a copy button', () => {
    render(<Snippet value="pnpm add haze-ui" />);
    expect(screen.getByText('pnpm add haze-ui')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Copy' }),
    ).toBeInTheDocument();
  });

  it('copies the value prop, not the display children', async () => {
    const user = userEvent.setup();
    const clipboard = stubClipboard(() => Promise.resolve());
    try {
      render(
        <Snippet value="secret-token">
          <strong>sk-••••1234</strong>
        </Snippet>,
      );
      await user.click(screen.getByRole('button', { name: 'Copy' }));
      expect(clipboard.fn).toHaveBeenCalledWith('secret-token');
      expect(screen.getByText('sk-••••1234')).toBeInTheDocument();
    } finally {
      clipboard.restore();
    }
  });

  it('applies className and classNames slots', () => {
    render(
      <Snippet
        value="hello"
        className="custom"
        classNames={{
          root: 'slot-root',
          content: 'slot-content',
          copyButton: 'slot-copy',
          icon: 'slot-icon',
        }}
      />,
    );
    const root = screen.getByText('hello').closest('[data-slot="snippet"]');
    expect(root).toHaveClass('custom');
    expect(root).toHaveClass('slot-root');
    expect(screen.getByText('hello')).toHaveClass('slot-content');
    expect(screen.getByRole('button')).toHaveClass('slot-copy');
    expect(screen.getByRole('button').querySelector('svg')).toHaveClass(
      'slot-icon',
    );
  });

  it('forwards ref to the chip wrapper', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Snippet ref={ref} value="hello" />);
    expect(ref.current).toHaveAttribute('data-slot', 'snippet');
  });

  it('forwards native props onto the chip wrapper', () => {
    render(<Snippet value="hello" data-testid="chip" />);
    expect(screen.getByTestId('chip')).toHaveAttribute('data-slot', 'snippet');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    // 'region' fires for any content outside a landmark — an artifact
    // of the bare test document, not the component.
    const options = { rules: { region: { enabled: false } } };
    const { unmount } = render(<Snippet value="pnpm add haze-ui" />);
    const results = await axe(document.body, options);
    expect(results.violations).toEqual([]);
    unmount();
  });
});

describe('CopyButton as polymorphism', () => {
  it("as='a' renders a real anchor: href/rest land on <a>, no type attr, copy wiring kept", async () => {
    const user = userEvent.setup();
    const clipboard = stubClipboard(() => Promise.resolve());
    try {
      render(
        <CopyButton as='a' href='/copy-link' value='secret' data-track='copy'>
          Copy
        </CopyButton>
      );
      const link = screen.getByRole('link', { name: 'Copy' });
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', '/copy-link');
      expect(link).toHaveAttribute('data-track', 'copy');
      // the button-only default is gated — anchors don't carry it
      expect(link).not.toHaveAttribute('type');
      // the copy wiring follows the rendered element
      await user.click(link);
      expect(clipboard.fn).toHaveBeenCalledWith('secret');
      expect(link).toHaveAttribute('data-copied', 'true');
    } finally {
      clipboard.restore();
    }
  });

  it("as='a' forwards ref to the anchor element", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(<CopyButton as='a' href='/copy-link' value='x' ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  it('default shape unchanged: native button with type="button"', () => {
    render(<CopyButton value='x' aria-label='Copy me' />);
    const button = screen.getByRole('button', { name: 'Copy me' });
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
  });
});
