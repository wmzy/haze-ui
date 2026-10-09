import { render, screen } from '@testing-library/react';

import LoadingOverlay from './LoadingOverlay';

describe('LoadingOverlay', () => {
  it('renders children with no veil when hidden', () => {
    render(
      <LoadingOverlay visible={false}>
        <p>data</p>
      </LoadingOverlay>
    );
    expect(screen.getByText('data')).toBeInTheDocument();
    expect(document.querySelector("[data-slot='veil']")).toBeNull();
  });

  it('busy: shows the status spinner, sets aria-busy, dims the content', () => {
    render(
      <LoadingOverlay visible>
        <p>data</p>
      </LoadingOverlay>
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(document.querySelector("[data-slot='veil']")).not.toBeNull();
    expect(screen.getByText('data').closest("[aria-busy]"))
      .toHaveAttribute('aria-busy', 'true');
  });

  it('renders an optional visible label under the spinner', () => {
    render(<LoadingOverlay visible label='Syncing…'>x</LoadingOverlay>);
    expect(screen.getByText('Syncing…')).toBeInTheDocument();
  });

  it('accepts a custom loader replacing the default spinner', () => {
    render(
      <LoadingOverlay visible loader={<span data-testid='custom-loader' />}>x</LoadingOverlay>
    );
    expect(screen.getByTestId('custom-loader')).toBeInTheDocument();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('has no axe violations while visible', async () => {
    const { axe } = await import('jest-axe');
    render(
      <LoadingOverlay visible label='Loading'>
        <input aria-label='q' />
      </LoadingOverlay>
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
