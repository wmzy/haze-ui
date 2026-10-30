import { useEffect } from 'react';
import { render, screen } from '@testing-library/react';

import { useLatest } from './useLatest';

describe('useLatest', () => {
  it('seeds the ref with the initial value', () => {
    function Probe({ value }: { value: number }) {
      const latest = useLatest(value);
      // Read during render, before any effect has run.
      return <output data-testid='latest'>{String(latest.current)}</output>;
    }
    render(<Probe value={7} />);
    expect(screen.getByTestId('latest')).toHaveTextContent('7');
  });

  it('exposes the newest value to effects after a prop change', () => {
    // The consumer effect is declared after useLatest, so the mirror's
    // write lands first — exactly the long-lived-closure contract.
    const seen: number[] = [];
    function Probe({ value }: { value: number }) {
      const latest = useLatest(value);
      useEffect(() => {
        seen.push(latest.current);
      });
      return null;
    }
    const { rerender } = render(<Probe value={1} />);
    rerender(<Probe value={2} />);
    rerender(<Probe value={3} />);
    expect(seen).toEqual([1, 2, 3]);
  });

  it('keeps one stable ref across repeated renders', () => {
    const refs = new Set<object>();
    const value = { id: 1 };
    let current: object | undefined;
    function Probe({ value }: { value: object }) {
      const latest = useLatest(value);
      refs.add(latest);
      current = latest.current;
      return null;
    }
    const { rerender } = render(<Probe value={value} />);
    rerender(<Probe value={value} />);
    rerender(<Probe value={value} />);
    expect(refs.size).toBe(1);
    expect(current).toBe(value);
  });
});
