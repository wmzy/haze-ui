import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import RadioGroup from './RadioGroup';
import Radio from './Radio';

function RadioFixture({ defaultValue = '' }: { defaultValue?: string }) {
  return (
    <RadioGroup value={defaultValue} name="color">
      <Radio value="red">Red</Radio>
      <Radio value="blue">Blue</Radio>
      <Radio value="green">Green</Radio>
    </RadioGroup>
  );
}

describe('RadioGroup + Radio', () => {
  it('renders radio inputs within a fieldset', () => {
    render(<RadioFixture />);
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('all radios share the same name', () => {
    render(<RadioFixture />);
    const radios = screen.getAllByRole('radio');
    const name = radios[0].getAttribute('name');
    expect(name).toBe('color');
    radios.forEach((r) => expect(r).toHaveAttribute('name', name));
  });

  it('selects the initial value', () => {
    render(<RadioFixture defaultValue="blue" />);
    expect(screen.getByRole('radio', { name: 'Blue' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Red' })).not.toBeChecked();
  });

  it('changes selection on click', async () => {
    const user = userEvent.setup();
    render(<RadioFixture />);
    await user.click(screen.getByRole('radio', { name: 'Green' }));
    expect(screen.getByRole('radio', { name: 'Green' })).toBeChecked();
  });

  it('applies className to RadioGroup', () => {
    render(
      <RadioGroup className="custom">
        <Radio value="a">A</Radio>
      </RadioGroup>
    );
    const fieldset = screen.getByRole('group');
    expect(fieldset).toHaveClass('custom');
  });
});
