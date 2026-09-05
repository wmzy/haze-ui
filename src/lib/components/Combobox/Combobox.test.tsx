import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Combobox from './Combobox';

const OPTIONS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

describe('Combobox', () => {
  it('renders a combobox input', () => {
    render(<Combobox options={OPTIONS} placeholder="Search fruit" />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search fruit')).toBeInTheDocument();
  });

  it('renders a listbox', () => {
    render(<Combobox options={OPTIONS} />);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('shows options on focus', async () => {
    const user = userEvent.setup();
    render(<Combobox options={OPTIONS} />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('filters options by query', async () => {
    const user = userEvent.setup();
    render(<Combobox options={OPTIONS} />);
    await user.type(screen.getByRole('combobox'), 'ban');
    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('selects an option on click', async () => {
    const user = userEvent.setup();
    render(<Combobox options={OPTIONS} />);
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByText('Cherry'));
    expect(screen.getByRole('combobox')).toHaveValue('Cherry');
  });

  it('navigates with ArrowDown/ArrowUp and selects with Enter', async () => {
    const user = userEvent.setup();
    render(<Combobox options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowUp}{Enter}');
    expect(input).toHaveValue('Apple');
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(<Combobox options={OPTIONS} />);
    await user.click(screen.getByRole('combobox'));
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard('{Escape}');
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on outside pointerdown', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Combobox options={OPTIONS} />
        <button>outside</button>
      </div>
    );
    const input = screen.getByRole('combobox');
    await user.click(input);
    expect(input).toHaveAttribute('aria-expanded', 'true');
    fireEvent.pointerDown(screen.getByText('outside'));
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('applies className', () => {
    const { container } = render(<Combobox options={OPTIONS} className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('mirrors the animated lifecycle as data-state on the listbox', async () => {
    const user = userEvent.setup();
    render(<Combobox options={OPTIONS} />);
    const input = screen.getByRole('combobox');
    const listbox = document.getElementById(input.getAttribute('aria-controls')!)!;
    expect(listbox).toHaveAttribute('data-state', 'closed');
    await user.click(input);
    expect(listbox).toHaveAttribute('data-state', 'open');
    await user.keyboard('{Escape}');
    expect(listbox).toHaveAttribute('data-state', 'closed');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<Combobox options={OPTIONS} placeholder="Search fruit" />);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations when the listbox is open', async () => {
    const { axe } = await import('jest-axe');
    const user = userEvent.setup();
    render(<Combobox options={OPTIONS} placeholder="Search fruit" />);
    await user.click(screen.getByRole('combobox'));
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
