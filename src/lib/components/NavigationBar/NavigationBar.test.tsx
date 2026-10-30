import { createRef } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { focusRingVisible } from '../../utils/focus-ring';

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

  it('composes the shared keyboard focus ring on NavLink', () => {
    render(<NavLink>Docs</NavLink>);
    expect(screen.getByText('Docs')).toHaveClass(focusRingVisible);
  });

  it('passes through native anchor attributes', () => {
    render(
      <NavLink href="https://example.com" target="_blank" rel="noopener">
        External
      </NavLink>,
    );
    const anchor = screen.getByText('External');
    expect(anchor).toHaveAttribute('href', 'https://example.com');
    expect(anchor).toHaveAttribute('target', '_blank');
    expect(anchor).toHaveAttribute('rel', 'noopener');
  });

  it('prevents default for placeholder href when onClick fires', async () => {
    const user = userEvent.setup();
    const seen: boolean[] = [];
    render(
      <NavLink onClick={(event) => seen.push(event.defaultPrevented)}>Logout</NavLink>,
    );
    await user.click(screen.getByText('Logout'));
    // href defaults to '#': button semantics keep the default suppressed.
    expect(seen).toEqual([true]);
  });

  it('does not intercept clicks on a real href', async () => {
    const user = userEvent.setup();
    const seen: boolean[] = [];
    render(
      <NavLink
        href="/about"
        onClick={(event) => {
          seen.push(event.defaultPrevented);
          event.preventDefault();
        }}
      >
        About
      </NavLink>,
    );
    await user.click(screen.getByText('About'));
    // Event arrives un-prevented: the caller (e.g. an SPA router Link
    // composed via `as`) decides whether to prevent the navigation.
    expect(seen).toEqual([false]);
  });

  it('treats aria-current="page" as active when no active prop is given', () => {
    render(
      <>
        <NavLink active>Explicit</NavLink>
        <NavLink aria-current="page">AriaDriven</NavLink>
        <NavLink aria-current="step">Step</NavLink>
      </>,
    );
    // Same className as the explicit `active` link proves the activeLink
    // style is applied; the "step" control proves it is not a vacuous match.
    expect(screen.getByText('AriaDriven').className).toBe(screen.getByText('Explicit').className);
    expect(screen.getByText('Step').className).not.toBe(screen.getByText('Explicit').className);
    expect(screen.getByText('AriaDriven')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Step')).toHaveAttribute('aria-current', 'step');
  });

  it('forwards ref to the anchor element', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(<NavLink ref={ref}>Home</NavLink>);
    expect(ref.current).toBe(screen.getByText('Home'));
    expect(ref.current?.tagName).toBe('A');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <NavigationBar brand="Haze" end={<button>Login</button>}>
        <NavLink href="/">Home</NavLink>
        <NavLink href="/docs" active>
          Docs
        </NavLink>
      </NavigationBar>,
    );
    // 'region' fires for any content outside a landmark — an artifact of
    // the bare test document, not the component.
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('NavLink as polymorphism', () => {
  it("as='a' keeps the anchor: rest lands on <a> and ref forwards", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <NavLink as="a" href="https://example.com" target="_blank" rel="noopener" ref={ref}>
        External
      </NavLink>
    );
    const anchor = screen.getByRole('link', { name: 'External' });
    expect(anchor.tagName).toBe('A');
    expect(anchor).toHaveAttribute('target', '_blank');
    expect(anchor).toHaveAttribute('rel', 'noopener');
    expect(ref.current).toBe(anchor);
  });

  it('as with a component: skin and aria-current wiring reach the rendered element', () => {
    function RouterLink({
      to,
      children,
      ...rest
    }: { to: string; children: React.ReactNode } & Record<string, unknown>) {
      return (
        // A router Link derives href from `to` last — its own routing
        // state always wins over a passthrough href.
        <a {...rest} href={to}>
          {children}
        </a>
      );
    }
    render(
      <NavLink as={RouterLink} to="/dashboard" active>
        Dashboard
      </NavLink>
    );
    const link = screen.getByRole('link', { name: 'Dashboard' });
    expect(link).toHaveAttribute('href', '/dashboard');
    expect(link).toHaveAttribute('data-slot', 'nav-link');
    // the active wiring follows the rendered element
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  it('default shape unchanged: native anchor with placeholder-href click suppression', async () => {
    const user = userEvent.setup();
    const seen: boolean[] = [];
    render(<NavLink onClick={(event) => seen.push(event.defaultPrevented)}>Logout</NavLink>);
    await user.click(screen.getByRole('link', { name: 'Logout' }));
    expect(seen[0]).toBe(true);
  });
});
