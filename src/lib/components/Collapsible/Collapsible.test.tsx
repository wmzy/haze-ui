import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './index';

describe('Collapsible', () => {
  it('renders trigger', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Hidden content</CollapsibleContent>
      </Collapsible>
    );
    expect(screen.getByRole('button', { name: 'Toggle' })).toBeInTheDocument();
  });

  it('hides content by default', () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Hidden content</CollapsibleContent>
      </Collapsible>
    );
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
  });

  it('shows content when trigger clicked', async () => {
    const user = userEvent.setup();
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Visible content</CollapsibleContent>
      </Collapsible>
    );
    await user.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(screen.getByText('Visible content')).toBeInTheDocument();
  });

  it('hides content when trigger clicked again', async () => {
    const user = userEvent.setup();
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Hidden again</CollapsibleContent>
      </Collapsible>
    );
    await user.click(screen.getByRole('button', { name: 'Toggle' }));
    await user.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(screen.queryByText('Hidden again')).not.toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(
      <Collapsible className="custom">
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      </Collapsible>
    );
    expect(container.firstChild).toHaveClass('custom');
  });

  it('respects defaultOpen', () => {
    render(
      <Collapsible defaultOpen>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Open content</CollapsibleContent>
      </Collapsible>
    );
    expect(screen.getByText('Open content')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Hidden content</CollapsibleContent>
      </Collapsible>
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations when open', async () => {
    const { axe } = await import('jest-axe');
    const user = userEvent.setup();
    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle</CollapsibleTrigger>
        <CollapsibleContent>Visible content</CollapsibleContent>
      </Collapsible>
    );
    await user.click(screen.getByRole('button', { name: 'Toggle' }));
    expect(screen.getByText('Visible content')).toBeInTheDocument();
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
