import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Select from './Select';
import SelectCore from './SelectCore';
import Option from './Option';

describe('Option', () => {
  it('renders an option element', () => {
    render(
      <Select aria-label="test">
        <Option value="a">Alpha</Option>
      </Select>
    );
    expect(screen.getByRole('option', { name: 'Alpha' })).toHaveAttribute('value', 'a');
  });
});

describe('Select', () => {
  it('renders a select element with options', () => {
    render(
      <Select aria-label="fruit">
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
      </Select>
    );
    expect(screen.getByRole('combobox', { name: 'fruit' })).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('applies className', () => {
    render(
      <Select className="custom" aria-label="test">
        <option>A</option>
      </Select>
    );
    expect(screen.getByRole('combobox')).toHaveClass('custom');
  });

  it('works as uncontrolled with initial value', () => {
    render(
      <Select value="banana" aria-label="test">
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
      </Select>
    );
    expect(screen.getByRole('combobox')).toHaveValue('banana');
  });

  it('changes value on selection', async () => {
    const user = userEvent.setup();
    render(
      <Select aria-label="test">
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
      </Select>
    );
    await user.selectOptions(screen.getByRole('combobox'), 'banana');
    expect(screen.getByRole('combobox')).toHaveValue('banana');
  });

  it('calls onChange handler', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select aria-label="test" onChange={onChange}>
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
      </Select>
    );
    await user.selectOptions(screen.getByRole('combobox'), 'banana');
    expect(onChange).toHaveBeenCalled();
  });

  it('forwards disabled prop', () => {
    render(
      <Select disabled aria-label="test">
        <option>A</option>
      </Select>
    );
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    const user = userEvent.setup();
    render(
      <Select aria-label="fruit">
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
      </Select>
    );
    // Native <select> renders no extra DOM when open, so the "open" state
    // is exercised by making a selection before scanning.
    await user.selectOptions(screen.getByRole('combobox'), 'banana');
    // 'region' fires for any content outside a landmark — an artifact of
    // the bare test document, not the component.
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('SelectCore', () => {
  it('renders the given value as the selected option', () => {
    render(
      <SelectCore value="banana" onChange={() => undefined} aria-label="core">
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
      </SelectCore>
    );
    expect(screen.getByRole('combobox')).toHaveValue('banana');
  });

  it('calls onChange with the new value on selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <SelectCore value="" onChange={onChange} aria-label="core">
        <option value="apple">Apple</option>
        <option value="banana">Banana</option>
      </SelectCore>
    );
    await user.selectOptions(screen.getByRole('combobox'), 'banana');
    expect(onChange).toHaveBeenCalledWith('banana');
  });
});
