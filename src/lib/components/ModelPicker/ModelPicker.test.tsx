import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ModelPicker from './ModelPicker';

const options = [
  { value: 'gpt-4', label: 'GPT-4', contextLength: '128k' },
  { value: 'gpt-3.5', label: 'GPT-3.5', contextLength: '16k' },
];

describe('ModelPicker', () => {
  it('renders options', () => {
    render(<ModelPicker options={options} />);
    expect(screen.getByText('GPT-4 (128k)')).toBeInTheDocument();
    expect(screen.getByText('GPT-3.5 (16k)')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<ModelPicker options={options} className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('calls onChange on selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ModelPicker options={options} onChange={onChange} />);
    await user.selectOptions(screen.getByRole('combobox'), 'gpt-3.5');
    expect(onChange).toHaveBeenCalledWith('gpt-3.5');
  });

  it('renders without contextLength', () => {
    const opts = [{ value: 'm', label: 'Model' }];
    render(<ModelPicker options={opts} />);
    expect(screen.getByText('Model')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is set', () => {
    render(<ModelPicker options={options} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });
});
