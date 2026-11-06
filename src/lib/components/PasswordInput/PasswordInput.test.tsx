import { render, screen } from '@testing-library/react';
import { createRef, type ChangeEvent, type ChangeEventHandler } from 'react';
import userEvent from '@testing-library/user-event';

import PasswordInput from './PasswordInput';
import PasswordInputCore from './PasswordInputCore';

describe('PasswordInput', () => {
  it('renders a password input', () => {
    const { container } = render(<PasswordInput />);
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
  });

  it('displays initial value', () => {
    const { container } = render(<PasswordInput value="secret" />);
    expect(container.querySelector('input')).toHaveValue('secret');
  });

  it('applies className to the input (Input-family contract)', () => {
    const { container } = render(<PasswordInput className="custom" />);
    expect(container.querySelector('input')).toHaveClass('custom');
  });

  it('forwards native attributes to the inner input', () => {
    const { container } = render(
      <PasswordInput aria-label="API key" data-testid="pw" name="secret" inputMode="text" />
    );
    const input = container.querySelector('input')!;
    // an explicit aria-label overrides the default localized label
    expect(input.getAttribute('aria-label')).toBe('API key');
    expect(input).toHaveAttribute('data-testid', 'pw');
    expect(input).toHaveAttribute('name', 'secret');
    expect(input).toHaveAttribute('inputmode', 'text');
  });

  it('calls onChange with the native change event', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<ChangeEventHandler<HTMLInputElement>>();
    const { container } = render(<PasswordInput onChange={onChange} />);
    const input = container.querySelector('input')!;
    await user.type(input, 'a');
    // Input-family contract: the public onChange is the native handler —
    // the payload is the DOM event, the value rides e.target.value.
    expect(onChange).toHaveBeenCalledTimes(1);
    const event = onChange.mock.calls[0]![0];
    expect(event.target).toBe(input);
    expect(event.target.value).toBe('a');
  });

  it('keeps the displayed value in sync when onChange is provided', async () => {
    const user = userEvent.setup();
    const { container } = render(<PasswordInput onChange={() => undefined} />);
    const input = container.querySelector('input')!;
    await user.type(input, 'ab');
    expect(input).toHaveValue('ab');
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    const { container } = render(<PasswordInput value="secret" />);
    expect(container.querySelector('input')).toHaveAttribute('type', 'password');
    const button = screen.getByRole('button');
    // The glyph is a lucide svg (aria-hidden — the button's aria-label
    // carries the semantics), swapped from the old emoji pair.
    expect(button.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument();
    await user.click(button);
    expect(container.querySelector('input')).toHaveAttribute('type', 'text');
    await user.click(button);
    expect(container.querySelector('input')).toHaveAttribute('type', 'password');
  });

  it('renders with placeholder', () => {
    const { container } = render(<PasswordInput placeholder="Enter password" />);
    expect(container.querySelector('input[placeholder="Enter password"]')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<PasswordInput value="secret" />);
    // 'region' fires for any content outside a landmark — an artifact of
    // the bare test document, not the component.
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations when password is visible', async () => {
    const { axe } = await import('jest-axe');
    const user = userEvent.setup();
    render(<PasswordInput value="secret" />);
    await user.click(screen.getByRole('button'));
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('PasswordInputCore', () => {
  it('renders the given value', () => {
    const { container } = render(
      <PasswordInputCore value="secret" onChange={() => undefined} />
    );
    expect(container.querySelector('input')).toHaveValue('secret');
  });

  it('calls onChange with the new value on input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<PasswordInputCore value="" onChange={onChange} />);
    await user.type(container.querySelector('input')!, 'a');
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('passes the native change event through onNativeChange after onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // capture e.target.value at dispatch time — the controlled value=""
    // resets the DOM before post-await assertions could read it live
    const onNativeChange = vi.fn(
      (event: ChangeEvent<HTMLInputElement>) => event.target.value,
    );
    const { container } = render(
      <PasswordInputCore value="" onChange={onChange} onNativeChange={onNativeChange} />
    );
    const input = container.querySelector('input')!;
    await user.type(input, 'a');
    expect(onChange).toHaveBeenCalledWith('a');
    expect(onNativeChange).toHaveBeenCalledTimes(1);
    expect(onNativeChange).toHaveReturnedWith('a');
    expect(onNativeChange.mock.calls[0]![0].target).toBe(input);
    // the value channel fires first, then the native passthrough
    expect(onChange.mock.invocationCallOrder[0]!).toBeLessThan(
      onNativeChange.mock.invocationCallOrder[0]!,
    );
  });

  it('toggles visibility without touching onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <PasswordInputCore value="secret" onChange={onChange} />
    );
    await user.click(screen.getByRole('button'));
    expect(container.querySelector('input')).toHaveAttribute('type', 'text');
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('PasswordInput ref forwarding', () => {
  it('forwards ref to the inner password input', () => {
    const ref = createRef<HTMLInputElement>();
    render(<PasswordInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    ref.current!.focus();
    expect(document.activeElement).toBe(ref.current);
  });
});
