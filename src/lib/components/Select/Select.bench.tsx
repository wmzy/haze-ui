import { act, fireEvent, render } from '@testing-library/react';

// Explicit vitest import (not the ambient globals): the TestContext
// parameter (`bench`) needs vitest's own `it` typing — @types/node also
// declares a global `it` whose callback shape would win the overload.
import { describe, it } from 'vitest';

import Select from './Select';

// Runtime benchmark (`pnpm bench` → vitest bench): the floating panel's
// open/close cycle through the real trigger click path. The panel's open
// state is internal to the trigger (no controlled `open` prop exists), so
// the flips go through the same click handler the unit tests drive —
// fireEvent.click keeps the loop synchronous and free of userEvent's
// pointer-sequencing overhead.

const OPTIONS = Array.from({ length: 50 }, (_, index) => ({
  value: `opt-${index}`,
  label: `Option ${index}`,
}));

describe('Select benchmarks', () => {
  it('toggles the floating panel open and closed', async ({ bench }) => {
    const { getByRole, unmount } = render(
      <Select multiple options={OPTIONS} aria-label='bench' />
    );
    const trigger = getByRole('combobox');

    await bench('open + close cycle (50 options)', () => {
      act(() => {
        fireEvent.click(trigger);
        fireEvent.click(trigger);
      });
    }).run();

    unmount();
  });
});
