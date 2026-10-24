import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';

import Breadcrumb from './Breadcrumb';
import BreadcrumbItem from './BreadcrumbItem';

describe('Breadcrumb', () => {
  it('renders a nav with aria-label', () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('accepts a custom aria-label and forwards native nav props', () => {
    render(
      <Breadcrumb aria-label="面包屑" data-testid="crumbs">
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByRole('navigation', { name: '面包屑' })).toHaveAttribute(
      'data-testid',
      'crumbs'
    );
  });

  it('renders items with separators', () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
        <BreadcrumbItem>Page</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Docs')).toBeInTheDocument();
    expect(screen.getByText('Page')).toBeInTheDocument();
    expect(screen.getAllByText('/')).toHaveLength(2);
  });

  it('renders custom separator', () => {
    render(
      <Breadcrumb separator=">">
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Page</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByText('>')).toBeInTheDocument();
  });

  it('renders links for items with href', () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/home">Home</BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/home');
  });

  it('renders span for items without href', () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Current').nodeName).toBe('SPAN');
  });

  it('marks last item with aria-current="page"', () => {
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>
    );
    const items = screen.getAllByRole('listitem');
    expect(items[items.length - 1]).toHaveAttribute('aria-current', 'page');
    expect(items[0]).not.toHaveAttribute('aria-current');
  });

  it('applies className', () => {
    render(
      <Breadcrumb className="custom">
        <BreadcrumbItem>A</BreadcrumbItem>
      </Breadcrumb>
    );
    expect(screen.getByRole('navigation')).toHaveClass('custom');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <Breadcrumb>
        <BreadcrumbItem href="/">Home</BreadcrumbItem>
        <BreadcrumbItem href="/docs">Docs</BreadcrumbItem>
        <BreadcrumbItem>Current page</BreadcrumbItem>
      </Breadcrumb>
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('BreadcrumbItem as polymorphism', () => {
  it("as='a' renders a real anchor wearing the link skin", () => {
    render(<BreadcrumbItem as='a' href='/docs'>Docs</BreadcrumbItem>);
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/docs');
    expect(link).toHaveAttribute('data-slot', 'breadcrumb-item');
  });

  it('href-less as still renders the chosen element (no href injected)', () => {
    render(<BreadcrumbItem as='a'>Bare</BreadcrumbItem>);
    const el = screen.getByText('Bare');
    expect(el.tagName).toBe('A');
    expect(el).not.toHaveAttribute('href');
  });

  it('forwards native attrs and the rest onto the rendered element', () => {
    render(
      <BreadcrumbItem href='/docs' target='_blank' data-testid='crumb'>
        Docs
      </BreadcrumbItem>
    );
    const link = screen.getByTestId('crumb');
    expect(link).toHaveAttribute('href', '/docs');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('as with a router component: to flows through, skin and trail semantics intact', () => {
    function RouterLink({
      to,
      children,
      ...rest
    }: { to: string; children: ReactNode } & Record<string, unknown>) {
      return <a href={to} {...rest}>{children}</a>;
    }
    render(
      <Breadcrumb>
        <BreadcrumbItem as={RouterLink} to='/'>Home</BreadcrumbItem>
        <BreadcrumbItem>Current</BreadcrumbItem>
      </Breadcrumb>
    );
    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).toHaveAttribute('href', '/');
    expect(link).toHaveAttribute('data-slot', 'breadcrumb-item');
    // the parent <li> keeps the aria-current wiring regardless of as
    const items = screen.getAllByRole('listitem');
    expect(items[items.length - 1]).toHaveAttribute('aria-current', 'page');
  });

  it('custom-as trails have no axe violations', async () => {
    const { axe } = await import('jest-axe');
    function RouterLink({
      to,
      children,
      ...rest
    }: { to: string; children: ReactNode } & Record<string, unknown>) {
      return <a href={to} {...rest}>{children}</a>;
    }
    render(
      <Breadcrumb>
        <BreadcrumbItem as={RouterLink} to='/'>Home</BreadcrumbItem>
        <BreadcrumbItem as={RouterLink} to='/docs'>Docs</BreadcrumbItem>
        <BreadcrumbItem>Current page</BreadcrumbItem>
      </Breadcrumb>
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
