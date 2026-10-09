import { expect } from 'vitest';
import {render, screen, cleanup} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Button from './Button';
import ButtonLink from './ButtonLink';
import {buttonVariants, buttonSizes} from './index';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('has type="button" by default', () => {
    render(<Button>OK</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('applies className', () => {
    render(<Button className="custom">OK</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom');
  });

  it('forwards native button props', () => {
    render(<Button disabled aria-label="submit">OK</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-label', 'submit');
  });

  it('calls onClick handler', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>OK</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not fire onClick when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>OK</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders square button', () => {
    render(<Button square>X</Button>);
    expect(screen.getByRole('button', { name: 'X' })).toBeInTheDocument();
  });

  describe('as polymorphism', () => {
    it("as='a' renders a real anchor: href lands on <a>, no type attr", () => {
      render(<Button as='a' href='/docs'>Docs</Button>);
      const link = screen.getByRole('link', { name: 'Docs' });
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', '/docs');
      // the button-only default is gated — anchors don't carry it
      expect(link).not.toHaveAttribute('type');
      // button skin still worn (base/variant/size classes present)
      expect(link.className).toContain('solid');
    });

    it("as='a' busy state: aria-disabled instead of disabled, spinner rendered", () => {
      render(<Button as='a' href='/run' loading aria-label='Run'>Run</Button>);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-busy', 'true');
      expect(link).toHaveAttribute('aria-disabled', 'true');
      expect(link).not.toHaveAttribute('disabled');
    });

    it('as with a component: wiring (href passthrough + skin) reaches the inner element', () => {
      function RouterLink({ to, children, ...rest }: { to: string; children: React.ReactNode } & Record<string, unknown>) {
        return <a href={to} {...rest}>{children}</a>;
      }
      render(<Button as={RouterLink} to='/routed'>Go</Button>);
      const link = screen.getByRole('link', { name: 'Go' });
      expect(link).toHaveAttribute('href', '/routed');
      expect(link).toHaveAttribute('data-slot', 'button-link');
    });
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <>
        <Button>Save changes</Button>
        <Button square disabled aria-label="Close panel">X</Button>
      </>
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  describe('loading', () => {
    it('locks the control: disabled + aria-busy while the label keeps the accessible name', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Button loading onClick={onClick}>Save</Button>);
      const btn = screen.getByRole('button', { name: 'Save' });
      expect(btn).toBeDisabled();
      expect(btn).toHaveAttribute('aria-busy', 'true');
      expect(btn).toHaveAttribute('data-loading');
      await user.click(btn);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('busy does not re-enable an explicitly disabled button', () => {
      render(<Button loading disabled>Save</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('renders a spinner indicator by default, aria-hidden (aria-busy announces the phase)', () => {
      render(<Button loading>Save</Button>);
      const indicator = screen.getByRole('button', { name: 'Save' })
        .querySelector("[data-slot='indicator']");
      expect(indicator).not.toBeNull();
      // the default Spinner carries role=status + aria-label; hidden
      // unconditionally so it cannot leak into the control's name
      expect(indicator).toHaveAttribute('aria-hidden', 'true');
      expect(indicator!.querySelector("[data-slot='spinner']")).not.toBeNull();
    });

    it('object form: custom icon is aria-hidden, custom text replaces the label ink', () => {
      render(
        <Button loading={{ icon: <svg data-testid='busy-icon' />, text: 'Saving…' }}>
          Save
        </Button>
      );
      const btn = screen.getByRole('button', { name: 'Saving…' });
      expect(screen.getByTestId('busy-icon')).toBeInTheDocument();
      expect(btn.querySelector("[data-slot='indicator']")).toHaveAttribute('aria-hidden', 'true');
      expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });

    it('clears busy state when loading flips back to false', () => {
      const { rerender } = render(<Button loading>Save</Button>);
      rerender(<Button>Save</Button>);
      const btn = screen.getByRole('button');
      expect(btn).not.toBeDisabled();
      expect(btn).not.toHaveAttribute('aria-busy');
      expect(btn.querySelector("[data-slot='indicator']")).toBeNull();
    });
  });
});

describe('ButtonLink', () => {
  it('renders a real anchor carrying href — button skin, link semantics', () => {
    render(<ButtonLink href='/page/2'>Next page</ButtonLink>);
    const link = screen.getByRole('link', { name: 'Next page' });
    // the pain point of `as={Button}`: href must land on an <a>, not a
    // <button> — ⌘/middle-click and crawlers depend on it
    expect(link).toHaveAttribute('href', '/page/2');
    expect(link.tagName).toBe('A');
  });

  it('wears Button’s full skin — every Button class plus the anchor reset', () => {
    // one of each variant/size combo: ButtonLink’s class set must be a
    // superset of Button’s (same base, same variant, same size) — the
    // “button appearance” contract lives in the shared styles module
    const combos: {
      variant: 'solid' | 'outline' | 'ghost';
      size: 'sm' | 'md' | 'lg';
      square?: boolean;
    }[] = [
      {variant: 'solid', size: 'md'},
      {variant: 'outline', size: 'sm'},
      {variant: 'ghost', size: 'lg'},
      {variant: 'outline', size: 'md', square: true}
    ];

    for (const {variant, size, square} of combos) {
      const {unmount: unmountButton} = render(
        <Button variant={variant} size={size} square={square}>
          B
        </Button>
      );
      const buttonClasses = new Set(
        screen.getByRole('button').classList
      );
      unmountButton();

      render(
        <ButtonLink variant={variant} size={size} square={square} href='/x'>
          L
        </ButtonLink>
      );
      const linkEl = screen.getByRole('link');
      for (const cls of buttonClasses) {
        expect(linkEl.classList).toContain(cls);
      }
      cleanup();
    }
  });

  it('forwards native anchor attrs and className', () => {
    render(
      <ButtonLink
        href='https://example.com'
        target='_blank'
        rel='noopener noreferrer'
        download
        className='custom'
      >
        Docs
      </ButtonLink>
    );
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('download');
    expect(link).toHaveClass('custom');
  });

  it('supports the router `as` composition shape: injected href/onClick', async () => {
    const user = userEvent.setup();
    const seen: string[] = [];

    // the native-router Link/NavLink `as` contract in miniature: the
    // router renders the component with href/onClick injected
    function RouterLink({to, children}: {to: string; children: React.ReactNode}) {
      return (
        <ButtonLink
          href={to}
          data-testid='router-link'
          onClick={(event) => {
            event.preventDefault();
            seen.push(to);
          }}
        >
          {children}
        </ButtonLink>
      );
    }

    render(<RouterLink to='/articles?offset=10'>Next</RouterLink>);
    const link = screen.getByTestId('router-link');
    expect(link).toHaveAttribute('href', '/articles?offset=10');

    await user.click(link);
    expect(seen).toEqual(['/articles?offset=10']);
  });

  it('forwards the ref to the anchor', () => {
    const ref = {current: null as HTMLAnchorElement | null};
    render(<ButtonLink ref={ref} href='/x'>X</ButtonLink>);
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    expect(ref.current?.tagName).toBe('A');
  });

  it('renders the anchor-disabled state through aria-disabled', () => {
    render(
      <ButtonLink href='/prev' aria-disabled tabIndex={-1}>
        ← Previous
      </ButtonLink>
    );
    const link = screen.getByRole('link', { name: '← Previous' });
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabindex', '-1');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <>
        <ButtonLink href='/next'>Next page</ButtonLink>
        <ButtonLink href='/prev' variant='outline' aria-disabled tabIndex={-1}>
          ← Previous
        </ButtonLink>
      </>
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  describe('loading', () => {
    it('busy anchor reports aria-busy and forces aria-disabled (anchors have no disabled attr)', () => {
      render(
        <ButtonLink href='/long-task' loading tabIndex={-1}>
          Export
        </ButtonLink>
      );
      const link = screen.getByRole('link', { name: 'Export' });
      expect(link).toHaveAttribute('aria-busy', 'true');
      expect(link).toHaveAttribute('aria-disabled', 'true');
      expect(link).toHaveAttribute('data-loading');
      expect(link.querySelector("[data-slot='spinner']")).not.toBeNull();
    });

    it('explicit aria-disabled stays put when busy lifts', () => {
      const { rerender } = render(
        <ButtonLink href='/x' loading aria-disabled tabIndex={-1}>X</ButtonLink>
      );
      rerender(<ButtonLink href='/x' aria-disabled>X</ButtonLink>);
      const link = screen.getByRole('link');
      expect(link).not.toHaveAttribute('aria-busy');
      expect(link).toHaveAttribute('aria-disabled', 'true');
    });
  });
});

describe('buttonVariants / buttonSizes exports', () => {
  it('exposes the variant skin classes for composition', () => {
    expect(Object.keys(buttonVariants)).toEqual(['solid', 'outline', 'ghost']);
    for (const cls of Object.values(buttonVariants)) {
      expect(cls).toBeTruthy();
    }
  });

  it('exposes the size skin classes for composition', () => {
    expect(Object.keys(buttonSizes)).toEqual(['sm', 'md', 'lg']);
    for (const cls of Object.values(buttonSizes)) {
      expect(cls).toBeTruthy();
    }
  });

  it('are the exact classes Button wears', () => {
    render(<Button variant="outline" size="lg">Skin</Button>);
    const button = screen.getByRole('button', { name: 'Skin' });
    expect(button).toHaveClass(buttonVariants.outline);
    expect(button).toHaveClass(buttonSizes.lg);
  });
});
