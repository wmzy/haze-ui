import { expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button, buttonSizes, buttonVariants } from '../Button';

import ButtonGroup from './ButtonGroup';
import ButtonGroupSeparator from './ButtonGroupSeparator';

import {
  group as groupClass,
  separatorIcon,
  separatorInverse,
  separatorRule,
} from './button-group-styles';

describe('ButtonGroup', () => {
  it('renders real Button children', () => {
    render(
      <ButtonGroup aria-label="Actions">
        <Button>Save</Button>
        <Button>Cancel</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('is a named group (role=group + aria-label)', () => {
    render(
      <ButtonGroup aria-label="Actions">
        <Button>Save</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('group', { name: 'Actions' })).toBeInTheDocument();
  });

  it('wears the merging skin class and reports its orientation', () => {
    const { rerender } = render(
      <ButtonGroup aria-label="Actions">
        <Button>Save</Button>
      </ButtonGroup>,
    );
    const bar = screen.getByRole('group');
    expect(bar).toHaveClass(groupClass);
    expect(bar).toHaveAttribute('data-orientation', 'horizontal');
    rerender(
      <ButtonGroup aria-label="Actions" orientation="vertical">
        <Button>Save</Button>
      </ButtonGroup>,
    );
    expect(bar).toHaveAttribute('data-orientation', 'vertical');
  });

  it('unifies size and variant across real Button children', () => {
    render(
      <ButtonGroup aria-label="Actions" size="lg" variant="outline">
        <Button>Day</Button>
        <Button>Week</Button>
      </ButtonGroup>,
    );
    for (const name of ['Day', 'Week']) {
      const btn = screen.getByRole('button', { name });
      expect(btn).toHaveClass(buttonSizes.lg);
      expect(btn).toHaveClass(buttonVariants.outline);
    }
  });

  it("a child's explicit size and variant win over the group", () => {
    render(
      <ButtonGroup aria-label="Actions" size="lg" variant="outline">
        <Button size="sm" variant="ghost">
          Solo
        </Button>
      </ButtonGroup>,
    );
    const btn = screen.getByRole('button', { name: 'Solo' });
    expect(btn).toHaveClass(buttonSizes.sm);
    expect(btn).toHaveClass(buttonVariants.ghost);
    expect(btn).not.toHaveClass(buttonSizes.lg);
  });

  it('disabled disables every child that does not disable itself', () => {
    render(
      <ButtonGroup aria-label="Actions" disabled>
        <Button>Forced</Button>
        <Button disabled={false}>Opted out</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('button', { name: 'Forced' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Opted out' })).toBeEnabled();
  });

  it('keeps child handlers alive through the skin injection', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <ButtonGroup aria-label="Actions">
        <Button onClick={onClick}>Go</Button>
      </ButtonGroup>,
    );
    await user.click(screen.getByRole('button', { name: 'Go' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('applies className and classNames.root to the wrapper', () => {
    render(
      <ButtonGroup
        aria-label="Actions"
        className="custom"
        classNames={{ root: 'slot-root' }}
      >
        <Button>Save</Button>
      </ButtonGroup>,
    );
    const bar = screen.getByRole('group');
    expect(bar).toHaveClass('custom');
    expect(bar).toHaveClass('slot-root');
  });

  it('forwards ref to the wrapper div', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ButtonGroup ref={ref} aria-label="Actions">
        <Button>Save</Button>
      </ButtonGroup>,
    );
    expect(ref.current).toBe(screen.getByRole('group'));
  });

  it('forwards native props onto the wrapper', () => {
    render(
      <ButtonGroup aria-label="Actions" data-testid="bar">
        <Button>Save</Button>
      </ButtonGroup>,
    );
    expect(screen.getByTestId('bar')).toBe(screen.getByRole('group'));
  });
});

describe('ButtonGroupSeparator', () => {
  it('renders a non-focusable rule oriented across the bar', () => {
    render(
      <ButtonGroup aria-label="Actions">
        <Button>Day</Button>
        <ButtonGroupSeparator />
        <Button>Week</Button>
      </ButtonGroup>,
    );
    const sep = screen.getByRole('separator');
    expect(sep).toHaveAttribute('aria-orientation', 'vertical');
    expect(sep).toHaveClass(separatorRule);
  });

  it('flips its rule and aria-orientation inside a vertical bar', () => {
    render(
      <ButtonGroup aria-label="Actions" orientation="vertical">
        <Button>Day</Button>
        <ButtonGroupSeparator />
        <Button>Week</Button>
      </ButtonGroup>,
    );
    const sep = screen.getByRole('separator');
    expect(sep).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('inks inverse on solid bars', () => {
    render(
      <ButtonGroup aria-label="Actions" variant="solid">
        <Button>Day</Button>
        <ButtonGroupSeparator />
        <Button>Week</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('separator')).toHaveClass(separatorInverse);
  });

  it('renders children as the divider glyph', () => {
    render(
      <ButtonGroup aria-label="Actions">
        <Button>Google</Button>
        <ButtonGroupSeparator>or</ButtonGroupSeparator>
        <Button>GitHub</Button>
      </ButtonGroup>,
    );
    const sep = screen.getByRole('separator');
    expect(sep).toHaveTextContent('or');
    expect(sep).toHaveClass(separatorIcon);
  });

  it('inherits classNames.separator from the group', () => {
    render(
      <ButtonGroup aria-label="Actions" classNames={{ separator: 'sep-slot' }}>
        <Button>Day</Button>
        <ButtonGroupSeparator />
        <Button>Week</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('separator')).toHaveClass('sep-slot');
  });
});

describe('ButtonGroup a11y', () => {
  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <ButtonGroup aria-label="View actions">
        <Button>Day</Button>
        <ButtonGroupSeparator />
        <Button>Week</Button>
        <ButtonGroupSeparator>or</ButtonGroupSeparator>
        <Button>Month</Button>
      </ButtonGroup>,
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
