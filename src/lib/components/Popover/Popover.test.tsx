import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Popover from './Popover';

describe('Popover', () => {
  it('renders trigger and content', () => {
    render(<Popover content="Popover body">Trigger</Popover>);
    expect(screen.getByText('Trigger')).toBeInTheDocument();
    expect(screen.getByText('Popover body')).toBeInTheDocument();
  });

  it('toggles on trigger click', async () => {
    const user = userEvent.setup();
    render(<Popover content="Body">Trigger</Popover>);
    const trigger = screen.getByText('Trigger');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('links trigger to panel via aria-controls', () => {
    render(<Popover content="Body">Trigger</Popover>);
    const trigger = screen.getByText('Trigger');
    const panelId = trigger.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();
    expect(document.getElementById(panelId!)).toBeInTheDocument();
  });

  it('applies className to panel', () => {
    render(<Popover content="Body" className="custom">Trigger</Popover>);
    const trigger = screen.getByText('Trigger');
    const panelId = trigger.getAttribute('aria-controls')!;
    expect(document.getElementById(panelId)).toHaveClass('custom');
  });
});
