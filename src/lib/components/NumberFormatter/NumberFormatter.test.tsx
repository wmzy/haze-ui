import { render, screen } from '@testing-library/react';

import NumberFormatter from './NumberFormatter';

describe('NumberFormatter', () => {
  it('formats with grouping separators in the given locale', () => {
    render(<NumberFormatter value={1234567.89} locale='en-US' data-testid='n' />);
    expect(screen.getByTestId('n')).toHaveTextContent('1,234,567.89');
  });

  it('honors locale-specific grouping', () => {
    render(<NumberFormatter value={1234567.89} locale='de-DE' data-testid='n' />);
    expect(screen.getByTestId('n')).toHaveTextContent('1.234.567,89');
  });

  it('forwards Intl.NumberFormat options (currency)', () => {
    render(
      <NumberFormatter
        value={99.5}
        locale='en-US'
        formatOptions={{ style: 'currency', currency: 'USD' }}
        data-testid='n'
      />
    );
    expect(screen.getByTestId('n')).toHaveTextContent('$99.50');
  });

  it('renders prefix/suffix outside the number', () => {
    render(<NumberFormatter value={42} prefix='~' suffix=' items' data-testid='n' />);
    expect(screen.getByTestId('n')).toHaveTextContent('~42 items');
  });

  it('applies className and native props', () => {
    render(<NumberFormatter value={1} className='mine' aria-label='count' />);
    const el = screen.getByLabelText('count');
    expect(el).toHaveClass('mine');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<NumberFormatter value={12345} locale='en-US' />);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
