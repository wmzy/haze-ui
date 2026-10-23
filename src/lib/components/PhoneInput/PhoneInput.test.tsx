import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useControl } from 'react-use-control';

import LocaleProvider from '../LocaleProvider';

import PhoneInput from './PhoneInput';
import { isValidPhone } from './phone-number';

describe('isValidPhone', () => {
  it('validates international and national values', () => {
    expect(isValidPhone('+8613800138000')).toBe(true);
    expect(isValidPhone('13800138000', 'CN')).toBe(true);
    expect(isValidPhone('+12015550123')).toBe(true);
    expect(isValidPhone('2015550123', 'US')).toBe(true);
    expect(isValidPhone('+8612345')).toBe(false);
    expect(isValidPhone('201', 'US')).toBe(false);
    expect(isValidPhone('')).toBe(false);
  });
});

describe('PhoneInput', () => {
  it('renders the joined country select and number field', () => {
    render(<PhoneInput aria-label="phone" />);
    expect(screen.getByRole('combobox', { name: 'Country / region' })).toBeInTheDocument();
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Phone number');
    expect(input).toHaveAttribute('inputmode', 'tel');
  });

  it('offers dial-code + region-name options', () => {
    render(<PhoneInput aria-label="phone" />);
    expect(
      screen.getByRole('option', { name: '+1 United States' })
    ).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '+86 China' })).toBeInTheDocument();
  });

  it('commits E.164 values from typed national digits', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PhoneInput onChange={onChange} aria-label="phone" />);
    const input = screen.getByRole('textbox');
    await user.type(input, '2015550123');
    expect(input).toHaveValue('2015550123');
    expect(onChange).toHaveBeenLastCalledWith('+12015550123');
  });

  it('preselects the dial code from the country prop', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PhoneInput country="CN" onChange={onChange} aria-label="phone" />);
    expect(screen.getByRole('combobox')).toHaveValue('CN');
    const input = screen.getByRole('textbox');
    await user.type(input, '13800138000');
    expect(onChange).toHaveBeenLastCalledWith('+8613800138000');
  });

  it('re-prefixes the digits when the country changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onCountryChange = vi.fn();
    render(
      <PhoneInput
        onChange={onChange}
        onCountryChange={onCountryChange}
        aria-label="phone"
      />
    );
    await user.type(screen.getByRole('textbox'), '2015550123');
    await user.selectOptions(screen.getByRole('combobox'), 'CN');
    expect(onCountryChange).toHaveBeenCalledWith('CN');
    expect(onChange).toHaveBeenLastCalledWith('+862015550123');
    expect(screen.getByRole('textbox')).toHaveValue('2015550123');
  });

  it('parses an international value to its own country', () => {
    const onCountryChange = vi.fn();
    render(
      <PhoneInput
        value="+8613800138000"
        onCountryChange={onCountryChange}
        aria-label="phone"
      />
    );
    expect(screen.getByRole('combobox')).toHaveValue('CN');
    expect(screen.getByRole('textbox')).toHaveValue('13800138000');
    expect(onCountryChange).toHaveBeenCalledWith('CN');
  });

  it('keeps external control of the value', () => {
    function Harness() {
      const [, setValue, valueCtrl] = useControl('+8613800138000');
      return (
        <>
          <PhoneInput value={valueCtrl} aria-label="phone" />
          <button type="button" onClick={() => setValue('')}>
            clear
          </button>
        </>
      );
    }
    render(<Harness />);
    expect(screen.getByRole('textbox')).toHaveValue('13800138000');
    fireEvent.click(screen.getByRole('button', { name: 'clear' }));
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('announces invalid numbers without leaking state', async () => {
    const user = userEvent.setup();
    render(<PhoneInput aria-label="phone" />);
    const input = screen.getByRole('textbox');
    await user.type(input, '201');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const hint = screen.getByRole('status');
    expect(hint).toHaveTextContent('Invalid phone number');
    expect(input.getAttribute('aria-describedby')).toContain(hint.id);
  });

  it('clears the invalid announcement for valid numbers', async () => {
    const user = userEvent.setup();
    render(<PhoneInput aria-label="phone" />);
    const input = screen.getByRole('textbox');
    await user.type(input, '2015550123');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('forwards native props to the number field', () => {
    render(<PhoneInput aria-label="cell" autoComplete="tel" />);
    expect(screen.getByRole('textbox', { name: 'cell' })).toHaveAttribute(
      'autocomplete',
      'tel'
    );
  });

  it('focuses the number field through the ref', () => {
    const ref = createRef<HTMLInputElement>();
    render(<PhoneInput aria-label="phone" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    ref.current?.focus();
    expect(document.activeElement).toBe(ref.current);
  });

  it('disables both fields', () => {
    render(<PhoneInput disabled aria-label="phone" />);
    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('applies className to the root and keeps data-slot', () => {
    render(<PhoneInput className="custom" aria-label="phone" />);
    expect(screen.getByRole('textbox').closest('[data-slot="phone-input"]')).toHaveClass(
      'custom'
    );
  });

  it('localizes placeholder and labels', () => {
    render(
      <LocaleProvider locale="zh-CN">
        <PhoneInput aria-label="phone" />
      </LocaleProvider>
    );
    expect(
      screen.getByRole('combobox', { name: '国家/地区' })
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', '电话号码');
    expect(
      screen.getByRole('option', { name: '+86 中国' })
    ).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<PhoneInput aria-label="phone" />);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
