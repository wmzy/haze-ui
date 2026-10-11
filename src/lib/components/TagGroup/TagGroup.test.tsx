import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TagGroup from './TagGroup';
import TagGroupItem from './TagGroupItem';

describe('TagGroup', () => {
  it('renders children', () => {
    render(
      <TagGroup>
        <TagGroupItem>React</TagGroupItem>
        <TagGroupItem>Vue</TagGroupItem>
      </TagGroup>,
    );
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Vue')).toBeInTheDocument();
  });

  it('has group role', () => {
    render(<TagGroup>Tags</TagGroup>);
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<TagGroup className="custom">Tags</TagGroup>);
    expect(screen.getByRole('group')).toHaveClass('custom');
  });

  it('renders TagGroupItem with close button', () => {
    render(<TagGroupItem onClose={vi.fn()}>Tag</TagGroupItem>);
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<TagGroupItem onClose={onClose}>Tag</TagGroupItem>);
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('does not render close button without onClose', () => {
    render(<TagGroupItem>Tag</TagGroupItem>);
    expect(screen.queryByRole('button', { name: 'Remove' })).not.toBeInTheDocument();
  });

  it('applies className to TagGroupItem', () => {
    render(<TagGroupItem className="custom">Tag</TagGroupItem>);
    expect(screen.getByText('Tag')).toHaveClass('custom');
  });

  it('renders zero drag affordances', () => {
    render(
      <TagGroup>
        <TagGroupItem>React</TagGroupItem>
        <TagGroupItem>Vue</TagGroupItem>
      </TagGroup>,
    );
    expect(
      document.querySelectorAll('[aria-roledescription="sortable"]')
    ).toHaveLength(0);
  });

  it('applies classNames: root on the group, item/removeButton inherited by items', () => {
    const onClose = vi.fn();
    render(
      <TagGroup classNames={{ root: 'g-root', item: 'g-item', removeButton: 'g-rm' }}>
        <TagGroupItem onClose={onClose}>React</TagGroupItem>
      </TagGroup>,
    );
    expect(screen.getByRole('group')).toHaveClass('g-root');
    expect(screen.getByText('React').closest("[data-slot='tag-group-item']")).toHaveClass('g-item');
    expect(screen.getByRole('button', { name: 'Remove' })).toHaveClass('g-rm');
  });

  it('an item className applies after the inherited group className', () => {
    render(
      <TagGroup classNames={{ item: 'g-item' }}>
        <TagGroupItem className="i-own">Tag</TagGroupItem>
      </TagGroup>,
    );
    const item = screen.getByText('Tag');
    expect(item).toHaveClass('g-item');
    // item's own className lands last in the class list
    expect(item.className.endsWith('i-own')).toBe(true);
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <TagGroup>
        <TagGroupItem onClose={() => undefined}>React</TagGroupItem>
        <TagGroupItem>Vue</TagGroupItem>
      </TagGroup>,
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
