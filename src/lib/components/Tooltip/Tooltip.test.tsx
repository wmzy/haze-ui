import { render, screen } from '@testing-library/react';

import Tooltip from './Tooltip';

describe('Tooltip', () => {
  it('renders children and tooltip content', () => {
    render(<Tooltip content="Help text">Hover me</Tooltip>);
    expect(screen.getByText('Hover me')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent('Help text');
  });

  it('links trigger to tooltip via aria-describedby', () => {
    render(<Tooltip content="Help">Trigger</Tooltip>);
    const tooltip = screen.getByRole('tooltip');
    const trigger = screen.getByText('Trigger');
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
  });

  it('applies className to wrapper', () => {
    const { container } = render(
      <Tooltip content="Tip" className="custom">Child</Tooltip>
    );
    expect(container.firstChild).toHaveClass('custom');
  });
});
