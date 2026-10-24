import { act, render } from '@testing-library/react';

// Explicit vitest import (not the ambient globals): the TestContext
// parameter (`bench`) needs vitest's own `it` typing — @types/node also
// declares a global `it` whose callback shape would win the overload.
import { describe, it } from 'vitest';

import VirtualList from './VirtualList';

// Runtime benchmarks (`pnpm bench` → vitest bench): pure JS-side windowing
// costs under jsdom — no layout (jsdom reports clientHeight 0, so the
// component falls back to the `height` prop exactly like the unit tests).
// Data is index-derived, so every run measures the same items.

const ITEM_HEIGHT = 40;
const VIEWPORT = 400;
const COUNT = 5000;

type BenchItem = { id: string; label: string };

/** Deterministic dataset: every field is a pure function of the index. */
function makeItems(count: number): BenchItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `item-${index}`,
    label: `row ${index}`,
  }));
}

const items = makeItems(COUNT);

/** Total scrollable extent: 5000 × 40 − the 400px viewport. */
const maxScroll = COUNT * ITEM_HEIGHT - VIEWPORT;

function renderItem(item: BenchItem) {
  return <div>{item.label}</div>;
}

function mountList() {
  return render(
    <VirtualList
      items={items}
      height={VIEWPORT}
      itemHeight={ITEM_HEIGHT}
      renderItem={renderItem}
    />
  );
}

describe('VirtualList benchmarks', () => {
  it('renders 5000 items', async ({ bench }) => {
    // Even virtualized, every mount pays the 5001-entry prefix sum plus
    // the visible window slice — this measures that setup, not layout.
    await bench('mount + unmount 5000 items (windowed)', () => {
      const view = mountList();
      view.unmount();
    }).run();
  });

  it('moves the window on scroll', async ({ bench }) => {
    const view = mountList();
    const port = view.container.firstChild as HTMLElement;
    // Stride relatively prime to the content extent (199600): every
    // iteration lands on a fresh, deterministic row boundary.
    const cursor = { offset: 0 };

    await bench('scroll event → window rerender', () => {
      cursor.offset = (cursor.offset + 3333) % maxScroll;
      const top = cursor.offset;
      act(() => {
        port.scrollTop = top;
        port.dispatchEvent(new Event('scroll'));
      });
    }).run();

    view.unmount();
  });
});
