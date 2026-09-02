import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Upload from './Upload';
import UploadCore from './UploadCore';

describe('Upload', () => {
  it('renders dropzone', () => {
    render(<Upload />);
    expect(screen.getByText(/drag.*drop|click.*upload/i)).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<Upload className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('renders custom children', () => {
    render(<Upload>Custom upload area</Upload>);
    expect(screen.getByText('Custom upload area')).toBeInTheDocument();
  });

  it('opens file dialog on click', async () => {
    const user = userEvent.setup();
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(vi.fn());
    render(<Upload />);
    await user.click(screen.getByText(/drag.*drop|click.*upload/i));
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it('calls onChange when files selected', async () => {
    const onChange = vi.fn();
    render(<Upload onChange={onChange} />);
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    await userEvent.upload(input, file);
    expect(onChange).toHaveBeenCalled();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<Upload />);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('keeps onChange reporting only the freshly picked files across picks', async () => {
    const onChange = vi.fn();
    render(<Upload onChange={onChange} />);
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    const first = new File(['1'], 'one.txt', { type: 'text/plain' });
    const second = new File(['2'], 'two.txt', { type: 'text/plain' });
    await userEvent.upload(input, first);
    await userEvent.upload(input, second);
    expect(onChange).toHaveBeenNthCalledWith(1, [first]);
    expect(onChange).toHaveBeenNthCalledWith(2, [second]);
  });
});

describe('UploadCore', () => {
  const fileA = new File(['1'], 'one.txt', { type: 'text/plain' });
  const fileB = new File(['2'], 'two.txt', { type: 'text/plain' });

  it('emits a replacing list for a single pick', async () => {
    const onChange = vi.fn();
    render(<UploadCore value={[fileA]} onChange={onChange} />);
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    await userEvent.upload(input, fileB);
    expect(onChange).toHaveBeenCalledWith([fileB]);
  });

  it('emits an appending list for a multiple pick', async () => {
    const onChange = vi.fn();
    render(<UploadCore value={[fileA]} onChange={onChange} multiple />);
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    await userEvent.upload(input, fileB);
    expect(onChange).toHaveBeenCalledWith([fileA, fileB]);
  });

  it('commits dropped files through the same value channel', () => {
    const onChange = vi.fn();
    const { container } = render(
      <UploadCore value={[fileA]} onChange={onChange} multiple />
    );
    fireEvent.drop(container.firstChild as HTMLElement, {
      dataTransfer: { files: [fileB] },
    });
    expect(onChange).toHaveBeenCalledWith([fileA, fileB]);
  });

  it('no-ops on an empty selection', () => {
    const onChange = vi.fn();
    const { container } = render(<UploadCore value={[]} onChange={onChange} />);
    fireEvent.drop(container.firstChild as HTMLElement, {
      dataTransfer: { files: [] },
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('stays fully controlled: picks build on the external value', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <UploadCore value={[fileA]} onChange={onChange} multiple />
    );
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    await userEvent.upload(input, fileB);
    expect(onChange).toHaveBeenLastCalledWith([fileA, fileB]);

    // parent applied the emitted value; the next pick builds on it
    rerender(<UploadCore value={[fileA, fileB]} onChange={onChange} multiple />);
    const again = new File(['3'], 'three.txt', { type: 'text/plain' });
    await userEvent.upload(input, again);
    expect(onChange).toHaveBeenLastCalledWith([fileA, fileB, again]);
  });

  it('forwards bridge props (id, aria) onto the focusable dropzone', () => {
    render(
      <UploadCore
        value={[]}
        onChange={() => undefined}
        id="attachments"
        aria-invalid
        aria-describedby="attachments-error"
      />
    );
    const dropzone = screen.getByRole('button');
    expect(dropzone).toHaveAttribute('id', 'attachments');
    expect(dropzone).toHaveAttribute('aria-invalid', 'true');
    expect(dropzone).toHaveAttribute('aria-describedby', 'attachments-error');
  });
});
