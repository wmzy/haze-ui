import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ColorPicker from './ColorPicker';

describe('ColorPicker', () => {
  it('renders a color input', () => {
    render(<ColorPicker value="#ff0000" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<ColorPicker value="#ff0000" className="custom" />);
    expect(screen.getByRole('textbox').parentElement?.parentElement).toHaveClass('custom');
  });

  it('displays current color', () => {
    render(<ColorPicker value="#00ff00" />);
    expect(screen.getAllByDisplayValue('#00ff00').length).toBe(2);
  });

  it('calls onChange on text input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker value="#ff0000" onChange={onChange} />);
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '#0000ff');
    expect(onChange).toHaveBeenCalled();
  });

  it('renders preset colors', () => {
    render(<ColorPicker value="#ff0000" presets={['#ff0000', '#00ff00']} />);
    expect(screen.getByLabelText('#ff0000')).toBeInTheDocument();
    expect(screen.getByLabelText('#00ff00')).toBeInTheDocument();
  });
});
