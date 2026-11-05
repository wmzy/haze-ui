import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SortableTagInput from './SortableTagInput';

/** jsdom rects are all 0×0 at (0,0) and dnd-kit's sortable keyboard
 * coordinate getter snaps onto neighbors by rect geometry — every li
 * needs a distinct rect before a keyboard drag can walk the list. */
const giveItemsDistinctRects = () => {
  document.querySelectorAll('li').forEach((li, index) => {
    const left = index * 26;
    li.getBoundingClientRect = () =>
      ({
        x: left,
        y: 0,
        top: 0,
        left,
        right: left + 20,
        bottom: 20,
        width: 20,
        height: 20,
        toJSON: () => ({}),
      });
  });
};

describe('SortableTagInput', () => {
  it('reorders tags through the full keyboard flow (lift → move → drop)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SortableTagInput value={['a', 'b', 'c']} onChange={onChange} />);
    giveItemsDistinctRects();
    screen.getByRole('button', { name: 'a' }).focus();
    await user.keyboard(' '); // lift 'a'
    await user.keyboard('{ArrowRight}'); // over 'b'
    await user.keyboard('{ArrowRight}'); // over 'c'
    await user.keyboard(' '); // drop
    expect(onChange).toHaveBeenCalledWith(['b', 'c', 'a']);
    // the uncontrolled state adopted the new order in the DOM
    expect(
      screen.getAllByRole('listitem').map((li) => li.firstChild?.textContent)
    ).toEqual(['b', 'c', 'a']);
  });

  it('reorders one slot with a single arrow press', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SortableTagInput value={['a', 'b', 'c']} onChange={onChange} />);
    giveItemsDistinctRects();
    screen.getByRole('button', { name: 'b' }).focus();
    await user.keyboard(' {ArrowLeft} ');
    expect(onChange).toHaveBeenCalledWith(['b', 'a', 'c']);
  });

  it('does not commit a reorder when the drag is cancelled with Escape', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SortableTagInput value={['a', 'b']} onChange={onChange} />);
    giveItemsDistinctRects();
    screen.getByRole('button', { name: 'a' }).focus();
    await user.keyboard(' {ArrowRight}{Escape}');
    expect(onChange).not.toHaveBeenCalled();
    expect(
      screen.getAllByRole('listitem').map((li) => li.firstChild?.textContent)
    ).toEqual(['a', 'b']);
  });

  it('wires drag handles with sortable semantics', () => {
    render(<SortableTagInput value={['a', 'b']} />);
    const handle = screen.getByRole('button', { name: 'a' });
    expect(handle).toHaveAttribute('aria-roledescription', 'sortable');
    expect(handle).toHaveAttribute('tabindex', '0');
    // dnd-kit renders the keyboard instructions the handle points at
    expect(handle).toHaveAccessibleDescription(/press the space bar/i);
  });

  it('drops drag affordances when disabled', () => {
    render(<SortableTagInput disabled value={['a', 'b']} />);
    expect(
      document.querySelectorAll('[aria-roledescription="sortable"]')
    ).toHaveLength(0);
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<SortableTagInput value={['react', 'vue']} placeholder="Add tag" />);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('SortableTagInput native form participation', () => {
  it('repeats the name per tag (native repeated-field semantics)', () => {
    const { container } = render(
      <form onSubmit={(e) => e.preventDefault()}>
        <SortableTagInput name="tags" value={['react', 'css']} />
      </form>
    );
    expect(new FormData(container.querySelector('form')!).getAll('tags')).toEqual([
      'react',
      'css',
    ]);
  });

  it('submits the reordered list after a drag', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form onSubmit={(e) => e.preventDefault()}>
        <SortableTagInput name="tags" value={['a', 'b']} />
      </form>
    );
    const form = container.querySelector('form')!;
    giveItemsDistinctRects();
    screen.getByRole('button', { name: 'a' }).focus();
    await user.keyboard(' {ArrowRight} ');
    expect(new FormData(form).getAll('tags')).toEqual(['b', 'a']);
  });

  it('submits nothing for an empty list and no bridge without name', () => {
    const empty = render(
      <form onSubmit={(e) => e.preventDefault()}>
        <SortableTagInput name="tags" />
      </form>
    );
    expect(new FormData(empty.container.querySelector('form')!).get('tags')).toBeNull();

    const unnamed = render(<SortableTagInput value={['react']} />);
    expect(unnamed.container.querySelector("[data-slot='native-input']")).toBeNull();
    // the inner draft input never carries the field name
    expect(unnamed.container.querySelector('input')).not.toHaveAttribute('name');
  });
});
