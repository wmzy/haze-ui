import { render, screen } from '@testing-library/react';

import { countNumberFormatConstructions } from '../../utils/testing/count-number-formats';

import NumberFormatter from './NumberFormatter';

describe('NumberFormatter', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it('reuses the cached formatter across rerenders with an inline options literal', () => {
    const constructions = countNumberFormatConstructions();
    const { rerender } = render(
      <NumberFormatter value={1} locale='en-US' formatOptions={{ style: 'unit', unit: 'kilometer' }} />
    );
    // Same options, fresh object and different key order: still one entry.
    rerender(
      <NumberFormatter value={2} locale='en-US' formatOptions={{ unit: 'kilometer', style: 'unit' }} />
    );
    // A changed option is a new entry.
    rerender(
      <NumberFormatter value={3} locale='en-US' formatOptions={{ style: 'unit', unit: 'mile' }} />
    );

    // The default unit display is short ("mi", not "miles").
    expect(screen.getByText('3 mi')).toBeInTheDocument();
    expect(constructions).toHaveLength(2);
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
