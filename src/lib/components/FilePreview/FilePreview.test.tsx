import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { quietIconButton } from '../../utils/quiet-button-skin';

import FilePreview from './FilePreview';

describe('FilePreview', () => {
  it('renders the file name, size and extension badge', () => {
    render(<FilePreview file={{ name: 'report.pdf', size: 1536 }} />);
    expect(screen.getByText('report.pdf')).toBeInTheDocument();
    expect(screen.getByText('1.50 KB')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
  });

  it('renders an image thumbnail for image files with a url', () => {
    render(
      <FilePreview
        file={{ name: 'photo.png', type: 'image/png', url: 'https://example.com/p.png' }}
      />
    );
    const img = document.querySelector('img[data-slot="preview"]')!;
    expect(img).toHaveAttribute('src', 'https://example.com/p.png');
    expect(img).toHaveAttribute('alt', '');
  });

  it('announces the uploaded status to screen readers', () => {
    render(<FilePreview file={{ name: 'a.txt' }} status='uploaded' />);
    expect(screen.getByText('Uploaded')).toBeInTheDocument();
  });

  it('shows the error label in the error status', () => {
    render(<FilePreview file={{ name: 'a.txt' }} status='error' />);
    expect(screen.getByText('Upload failed')).toBeInTheDocument();
  });

  it('clamps and rounds the percent while uploading', () => {
    const { rerender } = render(
      <FilePreview file={{ name: 'a.txt' }} status='uploading' progress={150} />
    );
    expect(screen.getByText('100%')).toBeInTheDocument();
    rerender(
      <FilePreview file={{ name: 'a.txt' }} status='uploading' progress={41.6} />
    );
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('fires onRemove on remove clicks', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<FilePreview file={{ name: 'a.txt' }} onRemove={onRemove} />);
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('fires onRetry on retry clicks in the error status', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<FilePreview file={{ name: 'a.txt' }} status='error' onRetry={onRetry} />);
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('hides the retry button unless the status is error', () => {
    render(
      <FilePreview file={{ name: 'a.txt' }} status='uploaded' onRemove={() => undefined} onRetry={() => undefined} />
    );
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
  });

  it('omits the actions row when no actions apply', () => {
    const { container } = render(<FilePreview file={{ name: 'a.txt' }} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(container.querySelector('[data-slot="actions"]')).not.toBeInTheDocument();
  });

  it('keeps both action buttons enabled plain buttons', () => {
    render(
      <FilePreview
        file={{ name: 'a.txt' }}
        status='error'
        onRemove={() => undefined}
        onRetry={() => undefined}
      />
    );
    const retry = screen.getByRole('button', { name: 'Retry' });
    const remove = screen.getByRole('button', { name: 'Remove' });
    expect(retry).toBeEnabled();
    expect(remove).toBeEnabled();
    expect(retry).toHaveAttribute('type', 'button');
    expect(remove).toHaveAttribute('type', 'button');
  });

  it('composes both action buttons from the shared quietIconButton skin', () => {
    render(
      <FilePreview
        file={{ name: 'a.txt' }}
        status='error'
        onRemove={() => undefined}
        onRetry={() => undefined}
      />
    );
    // Regression: the hover wash and focus ring ride the shared skin,
    // not local declarations — if this containment breaks the buttons
    // lost their chrome.
    expect(screen.getByRole('button', { name: 'Retry' }).className).toContain(
      quietIconButton
    );
    expect(screen.getByRole('button', { name: 'Remove' }).className).toContain(
      quietIconButton
    );
  });

  it('applies className and forwards native props to the root', () => {
    const { container } = render(
      <FilePreview file={{ name: 'a.txt' }} className='custom' data-testid='preview-card' />
    );
    expect(container.firstChild).toHaveClass('custom');
    expect(screen.getByTestId('preview-card')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <FilePreview
        file={{ name: 'report.pdf', size: 2048 }}
        status='error'
        onRemove={() => undefined}
        onRetry={() => undefined}
      />
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations while uploading', async () => {
    const { axe } = await import('jest-axe');
    render(
      <FilePreview file={{ name: 'report.pdf', size: 2048 }} status='uploading' progress={42} />
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
