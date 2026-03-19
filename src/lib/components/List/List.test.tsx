import { render, screen } from '@testing-library/react';

import List from './List';
import ListItem from './ListItem';

describe('List', () => {
  it('renders an unordered list by default', () => {
    render(
      <List>
        <ListItem>Item 1</ListItem>
        <ListItem>Item 2</ListItem>
      </List>
    );
    expect(screen.getByRole('list').nodeName).toBe('UL');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('renders an ordered list', () => {
    render(
      <List variant="ordered">
        <ListItem>Item 1</ListItem>
      </List>
    );
    expect(screen.getByRole('list').nodeName).toBe('OL');
  });

  it('renders with none variant', () => {
    const { container } = render(
      <List variant="none">
        <ListItem>Item 1</ListItem>
      </List>
    );
    expect(container.querySelector('ul')).toBeInTheDocument();
  });

  it('applies className to List', () => {
    render(
      <List className="custom">
        <ListItem>Item</ListItem>
      </List>
    );
    expect(screen.getByRole('list')).toHaveClass('custom');
  });

  it('applies className to ListItem', () => {
    render(
      <List>
        <ListItem className="item-custom">Item</ListItem>
      </List>
    );
    expect(screen.getByRole('listitem')).toHaveClass('item-custom');
  });
});
