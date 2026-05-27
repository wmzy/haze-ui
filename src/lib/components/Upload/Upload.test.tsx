import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Upload from './Upload';

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
    const input = document.querySelector('input[type="file"]')!;
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    await userEvent.upload(input, file);
    expect(onChange).toHaveBeenCalled();
  });
});
