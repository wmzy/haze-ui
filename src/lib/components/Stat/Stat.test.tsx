import { render, screen } from '@testing-library/react';

import { Stat, StatGroup } from './index';

describe('Stat', () => {
  it('renders title and value', () => {
    render(<Stat title="Revenue" value="$1,234" />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$1,234')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<Stat title="Users" value="100" description="Active users" />);
    expect(screen.getByText('Active users')).toBeInTheDocument();
  });

  it('renders trend indicator', () => {
    render(<Stat title="Sales" value="50" trend="up" trendValue="+12%" />);
    expect(screen.getByText((content) => content.includes('+12%'))).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<Stat title="X" value="1" className="custom" />);
    expect(screen.getByText('1').parentElement?.parentElement).toHaveClass('custom');
  });
});

describe('StatGroup', () => {
  it('renders children', () => {
    render(
      <StatGroup>
        <Stat title="A" value="1" />
        <Stat title="B" value="2" />
      </StatGroup>
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(
      <StatGroup className="custom">
        <Stat title="A" value="1" />
      </StatGroup>
    );
    expect(container.firstChild).toHaveClass('custom');
  });
});
