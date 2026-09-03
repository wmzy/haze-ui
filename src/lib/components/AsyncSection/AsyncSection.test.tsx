import { render, screen, fireEvent } from '@testing-library/react';

import AsyncSection from './AsyncSection';

describe('AsyncSection', () => {
  it('renders children when neither loading nor error', () => {
    render(<AsyncSection>Content</AsyncSection>);
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('treats null error as no error', () => {
    render(<AsyncSection error={null}>Content</AsyncSection>);
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders the loading placeholder while loading', () => {
    render(<AsyncSection loading>Content</AsyncSection>);
    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('loading takes precedence over error', () => {
    // 重试场景：error 未清除时再次进入加载，应显示占位而非旧错误
    render(
      <AsyncSection loading error={new Error('boom')} onRetry={vi.fn()}>
        Content
      </AsyncSection>
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders an alert and retry button when error is set', () => {
    const onRetry = vi.fn();
    render(
      <AsyncSection error={new Error('Request failed')} onRetry={onRetry}>
        Content
      </AsyncSection>
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Request failed');
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('derives the message from an Error instance', () => {
    render(<AsyncSection error={new Error('Network down')}>x</AsyncSection>);
    expect(screen.getByRole('alert')).toHaveTextContent('Network down');
  });

  it('falls back to generic copy for non-Error errors', () => {
    render(<AsyncSection error="raw string">x</AsyncSection>);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Something went wrong'
    );
  });

  it('honors custom copy for all three texts', () => {
    render(
      <AsyncSection
        loading
        loadingText="载入中"
        errorText="加载失败"
        retryText="重试"
      >
        x
      </AsyncSection>
    );
    expect(screen.getByRole('status')).toHaveTextContent('载入中');

    render(
      <AsyncSection
        error="oops"
        errorText="加载失败"
        retryText="重试"
        onRetry={vi.fn()}
      >
        x
      </AsyncSection>
    );
    expect(screen.getByRole('alert')).toHaveTextContent('加载失败');
    expect(screen.getByRole('button', { name: '重试' })).toBeInTheDocument();
  });

  it('omits the retry button without onRetry', () => {
    render(<AsyncSection error={new Error('boom')}>x</AsyncSection>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('applies className in every branch', () => {
    const { rerender } = render(
      <AsyncSection className="custom">Content</AsyncSection>
    );
    expect(screen.getByText('Content').closest('section')).toHaveClass(
      'custom'
    );

    rerender(
      <AsyncSection className="custom" loading>
        Content
      </AsyncSection>
    );
    expect(screen.getByRole('status').closest('section')).toHaveClass('custom');

    rerender(
      <AsyncSection className="custom" error={new Error('x')}>
        Content
      </AsyncSection>
    );
    expect(screen.getByRole('alert').closest('section')).toHaveClass('custom');
  });

  it('has no axe violations in the error branch', async () => {
    const { axe } = await import('jest-axe');
    render(
      <AsyncSection error={new Error('boom')} onRetry={vi.fn()}>
        Content
      </AsyncSection>
    );
    const results = await axe(document.body);
    expect(results.violations).toEqual([]);
  });
});
