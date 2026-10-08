import { render, screen, act } from '@testing-library/react';
import { expect } from 'vitest';

import { useNetwork } from './useNetwork';

function Meter() {
  const net = useNetwork();
  return (
    <div>
      <span data-testid="online">{String(net.online)}</span>
      <span data-testid="etype">{net.effectiveType ?? 'none'}</span>
    </div>
  );
}

describe('useNetwork', () => {
  it('renders current online state', () => {
    render(<Meter />);
    expect(screen.getByTestId('online')).toHaveTextContent(String(navigator.onLine));
  });

  it('responds to online/offline events', () => {
    render(<Meter />);
    const original = navigator.onLine;

    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      window.dispatchEvent(new Event('offline'));
    });
    expect(screen.getByTestId('online')).toHaveTextContent('false');

    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      window.dispatchEvent(new Event('online'));
    });
    expect(screen.getByTestId('online')).toHaveTextContent('true');

    Object.defineProperty(navigator, 'onLine', {
      value: original,
      configurable: true,
    });
  });

  it('reports connection metadata when present', () => {
    const listeners: Record<string, (() => void)[]> = {};
    const fakeConnection = {
      effectiveType: '4g',
      downlink: 10,
      rtt: 50,
      saveData: false,
      addEventListener: (ev: string, fn: () => void) => {
        (listeners[ev] ??= []).push(fn);
      },
      removeEventListener: (ev: string, fn: () => void) => {
        listeners[ev] = (listeners[ev] ?? []).filter((f) => f !== fn);
      },
    };
    Object.defineProperty(navigator, 'connection', {
      value: fakeConnection,
      configurable: true,
    });

    render(<Meter />);
    expect(screen.getByTestId('etype')).toHaveTextContent('4g');

    act(() => {
      fakeConnection.effectiveType = '2g';
      for (const fn of listeners.change ?? []) fn();
    });
    expect(screen.getByTestId('etype')).toHaveTextContent('2g');
  });
});
