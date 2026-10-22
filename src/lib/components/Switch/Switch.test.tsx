import { expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import userEvent from '@testing-library/user-event';

import Switch from './Switch';
import SwitchCore from './SwitchCore';
import { trackSizes, thumbSizes } from './index';

describe('Switch', () => {
  it('renders with switch role', () => {
    render(<Switch aria-label="toggle" />);
    expect(screen.getByRole('switch', { name: 'toggle' })).toBeInTheDocument();
  });

  it('has type="button"', () => {
    render(<Switch aria-label="toggle" />);
    expect(screen.getByRole('switch')).toHaveAttribute('type', 'button');
  });

  it('applies className', () => {
    render(<Switch className="custom" aria-label="toggle" />);
    expect(screen.getByRole('switch')).toHaveClass('custom');
  });

  it('defaults to unchecked (aria-checked=false)', () => {
    render(<Switch aria-label="toggle" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('can be initialized as checked', () => {
    render(<Switch checked aria-label="toggle" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('toggles on click', async () => {
    const user = userEvent.setup();
    render(<Switch aria-label="toggle" />);
    const sw = screen.getByRole('switch');
    await user.click(sw);
    expect(sw).toHaveAttribute('aria-checked', 'true');
    await user.click(sw);
    expect(sw).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onClick handler', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Switch aria-label="toggle" onClick={onClick} />);
    await user.click(screen.getByRole('switch'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('forwards disabled prop', () => {
    render(<Switch disabled aria-label="toggle" />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<Switch aria-label="toggle" />);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations when checked', async () => {
    const { axe } = await import('jest-axe');
    const user = userEvent.setup();
    render(<Switch aria-label="toggle" />);
    await user.click(screen.getByRole('switch'));
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('SwitchCore', () => {
  it('renders the given checked value', () => {
    render(<SwitchCore checked onChange={() => undefined} aria-label="core" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onChange with the next checked value on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SwitchCore checked={false} onChange={onChange} aria-label="core" />);
    await user.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('does not toggle on its own: rerender drives the DOM', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const {rerender} = render(
      <SwitchCore checked={false} onChange={onChange} aria-label="core" />
    );
    await user.click(screen.getByRole('switch'));
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    rerender(<SwitchCore checked onChange={onChange} aria-label="core" />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });
});

describe('Switch ref forwarding', () => {
  it('forwards ref to the switch button', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Switch ref={ref} aria-label='Notifications' />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    ref.current!.focus();
    expect(document.activeElement).toBe(ref.current);
  });
});

describe('Switch native form participation', () => {
  it('submits "on" under name while checked (uncontrolled default)', () => {
    const {container} = render(
      <form onSubmit={(e) => e.preventDefault()}>
        <Switch name="notifications" checked aria-label="Notifications" />
      </form>
    );
    const data = new FormData(container.querySelector('form')!);
    expect(data.get('notifications')).toBe('on');
  });

  it('submits nothing while unchecked (native successful-control rule)', () => {
    const {container} = render(
      <form onSubmit={(e) => e.preventDefault()}>
        <Switch name="notifications" aria-label="Notifications" />
      </form>
    );
    const data = new FormData(container.querySelector('form')!);
    expect(data.get('notifications')).toBeNull();
  });

  it('follows toggles: FormData tracks the live checked state', async () => {
    const user = userEvent.setup();
    const {container} = render(
      <form onSubmit={(e) => e.preventDefault()}>
        <Switch name="notifications" aria-label="Notifications" />
      </form>
    );
    const form = container.querySelector('form')!;
    await user.click(screen.getByRole('switch'));
    expect(new FormData(form).get('notifications')).toBe('on');
    await user.click(screen.getByRole('switch'));
    expect(new FormData(form).get('notifications')).toBeNull();
  });

  it('renders no bridge input and keeps name off the button without name', () => {
    const {container} = render(<Switch checked aria-label="Notifications" />);
    expect(container.querySelector("[data-slot='native-input']")).toBeNull();
    // a <button>'s own name would be submitter-scoped — must not leak there
    expect(screen.getByRole('switch')).not.toHaveAttribute('name');
  });

  it('bridge input is a non-interactive clipped checkbox', () => {
    const {container} = render(
      <Switch name="notifications" checked aria-label="Notifications" />
    );
    const bridge = container.querySelector<HTMLInputElement>(
      "[data-slot='native-input']"
    )!;
    expect(bridge.type).toBe('checkbox');
    expect(bridge).toBeChecked();
    expect(bridge).toHaveAttribute('readonly');
    expect(bridge.tabIndex).toBe(-1);
    expect(bridge.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('trackSizes / thumbSizes exports', () => {
  it('expose the per-size skin classes for composition', () => {
    expect(Object.keys(trackSizes)).toEqual(['sm', 'md', 'lg']);
    expect(Object.keys(thumbSizes)).toEqual(['sm', 'md', 'lg']);
    for (const cls of [...Object.values(trackSizes), ...Object.values(thumbSizes)]) {
      expect(cls).toBeTruthy();
    }
  });

  it('are the exact classes Switch wears', () => {
    render(<Switch size="lg" aria-label="skin" />);
    const sw = screen.getByRole('switch', { name: 'skin' });
    expect(sw).toHaveClass(trackSizes.lg);
    const thumb = sw.querySelector("[data-slot='thumb']");
    expect(thumb).not.toBeNull();
    expect(thumb).toHaveClass(thumbSizes.lg);
  });
});
