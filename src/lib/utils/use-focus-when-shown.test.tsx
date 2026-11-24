import { expect } from 'vitest';
import { render, renderHook, screen } from '@testing-library/react';
import { useRef } from 'react';

import { useFocusWhenShown } from './use-focus-when-shown';

/**
 * A panel with one focus target. `version` re-creates the element (a new
 * key) so tests can replace the target in the same commit as a shown
 * flip; `label` re-renders without touching the DOM.
 */
function Panel({
  shown,
  version = 0,
  label = 'panel',
  hasTarget = true,
}: {
  shown: boolean;
  version?: number;
  label?: string;
  hasTarget?: boolean;
}) {
  const targetRef = useRef<HTMLButtonElement>(null);
  useFocusWhenShown(shown, () => (hasTarget ? targetRef.current : null));
  return (
    <button key={version} ref={targetRef} type='button' data-testid='target'>
      {label}
    </button>
  );
}

function focusElsewhere(): HTMLButtonElement {
  const other = document.createElement('button');
  document.body.appendChild(other);
  other.focus();
  return other;
}

describe('useFocusWhenShown', () => {
  it('waits for the shown handover before focusing', () => {
    const { rerender } = render(<Panel shown={false} />);
    expect(screen.getByTestId('target')).not.toHaveFocus();

    rerender(<Panel shown />);
    expect(screen.getByTestId('target')).toHaveFocus();
  });

  it('reads the target at handover time, not at render time', () => {
    // The element itself is replaced in the very commit the panel is
    // shown: focus must land on the new node, not a stale closure's.
    const { rerender } = render(<Panel shown={false} version={1} />);

    rerender(<Panel shown version={2} />);

    expect(screen.getByTestId('target')).toHaveFocus();
  });

  it('does not refocus on re-renders while shown', () => {
    const { rerender } = render(<Panel shown />);
    const other = focusElsewhere();

    // A new inline getTarget closure per render must re-trigger nothing.
    rerender(<Panel shown label='again' />);

    expect(other).toHaveFocus();
    other.remove();
  });

  it('focuses again on every handover', () => {
    const { rerender } = render(<Panel shown />);
    const other = focusElsewhere();

    rerender(<Panel shown={false} />);
    expect(other).toHaveFocus();

    rerender(<Panel shown />);
    expect(screen.getByTestId('target')).toHaveFocus();
    other.remove();
  });

  it('leaves focus alone when there is no target', () => {
    const { rerender } = render(<Panel shown={false} hasTarget={false} />);

    rerender(<Panel shown hasTarget={false} />);

    expect(document.body).toHaveFocus();
  });

  it('runs the target lookup once per handover', () => {
    const lookup = vi.fn(() => null);
    const { rerender } = renderHook(
      ({ shown }: { shown: boolean }) => useFocusWhenShown(shown, lookup),
      { initialProps: { shown: true } }
    );

    expect(lookup).toHaveBeenCalledOnce();

    rerender({ shown: true });
    expect(lookup).toHaveBeenCalledOnce();

    rerender({ shown: false });
    expect(lookup).toHaveBeenCalledOnce();

    rerender({ shown: true });
    expect(lookup).toHaveBeenCalledTimes(2);
  });
});
