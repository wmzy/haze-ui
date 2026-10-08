import { render, screen } from '@testing-library/react';

import Fieldset from './Fieldset';

describe('Fieldset', () => {
  it('groups content under a legend (group role named by the legend)', () => {
    render(
      <Fieldset legend='Shipping address'>
        <input aria-label='Street' />
      </Fieldset>
    );
    expect(screen.getByRole('group', { name: 'Shipping address' })).toBeInTheDocument();
    expect(screen.getByLabelText('Street')).toBeInTheDocument();
  });

  it('omits the legend element when no legend is passed', () => {
    const { container } = render(<Fieldset>Body</Fieldset>);
    expect(container.querySelector('legend')).toBeNull();
  });

  it('disabled disables every control inside (native fieldset semantics)', () => {
    render(
      <Fieldset legend='L' disabled>
        <input aria-label='a' />
        <button type='button'>b</button>
      </Fieldset>
    );
    expect(screen.getByLabelText('a')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'b' })).toBeDisabled();
  });

  it('applies className and forwards native props', () => {
    render(<Fieldset className='mine' id='fs'>x</Fieldset>);
    expect(screen.getByRole('group')).toHaveClass('mine');
    expect(screen.getByRole('group')).toHaveAttribute('id', 'fs');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <Fieldset legend='Personal'>
        <input aria-label='Name' />
        <input aria-label='Email' />
      </Fieldset>
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
