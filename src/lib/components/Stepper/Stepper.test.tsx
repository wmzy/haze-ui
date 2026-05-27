import { render, screen } from '@testing-library/react';

import { Stepper, Step } from './index';

describe('Stepper', () => {
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
});
