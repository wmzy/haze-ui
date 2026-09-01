import { render, screen } from '@testing-library/react';

import { Stepper, Step } from './index';

describe('Stepper', () => {
  it('throws when Step is used outside Stepper', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<Step title="Orphan" />)).toThrow(
      'Step must be used within <Stepper>'
    );
    spy.mockRestore();
  });

  it('renders steps', () => {
    render(
      <Stepper activeStep={0}>
        <Step title="Step 1" />
        <Step title="Step 2" />
      </Stepper>
    );
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
  });

  it('shows step numbers', () => {
    render(
      <Stepper activeStep={0}>
        <Step title="Step 1" />
        <Step title="Step 2" />
      </Stepper>
    );
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('applies className to Stepper', () => {
    const { container } = render(
      <Stepper activeStep={0} className="custom">
        <Step title="Step 1" />
      </Stepper>
    );
    expect(container.firstChild).toHaveClass('custom');
  });

  it('applies className to Step', () => {
    render(
      <Stepper activeStep={0}>
        <Step title="Step 1" className="custom" />
      </Stepper>
    );
    expect(screen.getByText('Step 1').parentElement).toHaveClass('custom');
  });

  it('renders description', () => {
    render(
      <Stepper activeStep={0}>
        <Step title="Step 1" description="Details" />
      </Stepper>
    );
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <Stepper activeStep={1}>
        <Step title="Cart" />
        <Step title="Payment" description="Card details" />
        <Step title="Done" />
      </Stepper>
    );
    // 'region' fires for any content outside a landmark — an artifact of
    // the bare test document, not the component.
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
