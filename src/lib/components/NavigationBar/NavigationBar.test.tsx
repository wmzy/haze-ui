import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import NavigationBar from './NavigationBar';
import NavLink from './NavLink';

describe('NavigationBar', () => {
  it('renders children', () => {
    render(
      <NavigationBar>
        <NavLink>Home</NavLink>
      </NavigationBar>,
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders brand', () => {
    render(<NavigationBar brand={<span>Logo</span>} />);
    expect(screen.getByText('Logo')).toBeInTheDocument();
  });

  it('renders end slot', () => {
    render(<NavigationBar end={<button>Login</button>} />);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<NavigationBar className="custom"><NavLink>Link</NavLink></NavigationBar>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('renders active NavLink', () => {
    render(<NavLink active>Home</NavLink>);
    expect(screen.getByText('Home')).toHaveAttribute('aria-current', 'page');
  });

  it('calls NavLink onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<NavLink onClick={onClick}>Link</NavLink>);
    await user.click(screen.getByText('Link'));
    expect(onClick).toHaveBeenCalled();
  });

  it('applies className to NavLink', () => {
    render(<NavLink className="custom">Link</NavLink>);
    expect(screen.getByText('Link')).toHaveClass('custom');
  });
});
