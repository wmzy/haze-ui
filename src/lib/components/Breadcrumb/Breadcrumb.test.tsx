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
});
