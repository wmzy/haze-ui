import { render, screen, act } from '@testing-library/react';
import { expect } from 'vitest';

import { useOrientation } from './useOrientation';

function Meter() {
  const o = useOrientation();
  return <div data-testid="o">{o.type}:{o.angle}</div>;
}

describe('useOrientation', () => {
  it('renders screen.orientation type/angle when exposed', () => {
    const listeners: (() => void)[] = [];
    Object.defineProperty(window.screen, 'orientation', {
      value: {
        type: 'landscape-primary',
        angle: 90,
        addEventListener: (_ev: string, fn: () => void) => listeners.push(fn),
        removeEventListener: (_ev: string, fn: () => void) => {
          const i = listeners.indexOf(fn);
          if (i >= 0) listeners.splice(i, 1);
        },
      },
      configurable: true,
    });
    render(<Meter />);
    expect(screen.getByTestId('o')).toHaveTextContent('landscape-primary:90');

    act(() => {
      Object.defineProperty(window.screen.orientation, 'type', {
        value: 'portrait-primary',
        configurable: true,
      });
      Object.defineProperty(window.screen.orientation, 'angle', {
        value: 0,
        configurable: true,
      });
      for (const fn of listeners) fn();
    });
    expect(screen.getByTestId('o')).toHaveTextContent('portrait-primary:0');
  });

  it('falls back to portrait-primary without screen.orientation', () => {
    const original = Object.getOwnPropertyDescriptor(window.screen, 'orientation');
    Object.defineProperty(window.screen, 'orientation', {
      value: undefined,
      configurable: true,
    });
    render(<Meter />);
    expect(screen.getByTestId('o')).toHaveTextContent('portrait-primary:0');
    if (original) {
      Object.defineProperty(window.screen, 'orientation', original);
    }
  });
});
