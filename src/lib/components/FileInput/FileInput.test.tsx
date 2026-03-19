import { render, screen } from '@testing-library/react';

import FileInput from './FileInput';

describe('FileInput', () => {
  it('renders with default "Choose file" label', () => {
    render(<FileInput />);
    expect(screen.getByText('Choose file')).toBeInTheDocument();
  });

  it('renders custom children as label', () => {
    render(<FileInput>Upload photo</FileInput>);
    expect(screen.getByText('Upload photo')).toBeInTheDocument();
  });

  it('renders a hidden file input', () => {
    const { container } = render(<FileInput />);
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
  });

  it('applies className to the label', () => {
    const { container } = render(<FileInput className="custom" />);
    expect(container.querySelector('label')).toHaveClass('custom');
  });

  it('forwards accept prop', () => {
    const { container } = render(<FileInput accept="image/*" />);
    expect(container.querySelector('input')).toHaveAttribute('accept', 'image/*');
  });

  it('forwards multiple prop', () => {
    const { container } = render(<FileInput multiple />);
    expect(container.querySelector('input')).toHaveAttribute('multiple');
  });
});
