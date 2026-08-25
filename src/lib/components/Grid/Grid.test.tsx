import { render, screen } from '@testing-library/react';

import { Grid, GridItem } from './index';

describe('Grid', () => {
  it('renders children', () => {
    render(<Grid><div>child</div></Grid>);
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<Grid className="custom">x</Grid>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('renders with default 12 columns', () => {
    const { container } = render(<Grid>z</Grid>);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('GridItem', () => {
  it('renders children', () => {
    render(<GridItem><div>item</div></GridItem>);
    expect(screen.getByText('item')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<GridItem className="custom">x</GridItem>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('sets gridColumn from start and span', () => {
    const { container } = render(<GridItem start={2} span={3}>placed</GridItem>);
    expect(container.firstChild).toHaveStyle({ gridColumn: '2 / span 3' });
  });

  it('omits start line when start is not given', () => {
    const { container } = render(<GridItem span={2}>flow</GridItem>);
    expect(container.firstChild).toHaveStyle({ gridColumn: 'span 2' });
  });
});
