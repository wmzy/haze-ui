import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Disclosure from './Disclosure';

describe('Disclosure', () => {
  it('renders summary and content', () => {
    render(<Disclosure summary="Click to expand">Hidden content</Disclosure>);
    expect(screen.getByText('Click to expand')).toBeInTheDocument();
    expect(screen.getByText('Hidden content')).toBeInTheDocument();
  });

  it('renders as a details element', () => {
    const { container } = render(
      <Disclosure summary="Summary">Content</Disclosure>
    );
    expect(container.querySelector('details')).toBeInTheDocument();
    expect(container.querySelector('summary')).toHaveTextContent('Summary');
  });

  it('is closed by default', () => {
    const { container } = render(
      <Disclosure summary="Summary">Content</Disclosure>
    );
    expect(container.querySelector('details')).not.toHaveAttribute('open');
  });

  it('opens when open prop is true', () => {
    const { container } = render(
      <Disclosure summary="Summary" open>Content</Disclosure>
    );
    expect(container.querySelector('details')?.open).toBe(true);
  });

  it('applies className', () => {
    const { container } = render(
      <Disclosure summary="S" className="custom">C</Disclosure>
    );
    expect(container.querySelector('details')).toHaveClass('custom');
  });

  it('stays closed when open is false', () => {
    const { container } = render(
      <Disclosure summary="S" open={false}>C</Disclosure>
    );
    expect(container.querySelector('details')?.open).toBe(false);
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<Disclosure summary="Click to expand">Hidden content</Disclosure>);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations when open', async () => {
    const { axe } = await import('jest-axe');
    const user = userEvent.setup();
    render(<Disclosure summary="Click to expand">Hidden content</Disclosure>);
    await user.click(screen.getByText('Click to expand'));
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
