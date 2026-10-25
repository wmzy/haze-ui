import { expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import userEvent from '@testing-library/user-event';

import Toolbar from './Toolbar';
import ToolbarButton from './ToolbarButton';
import ToolbarSeparator from './ToolbarSeparator';
import ToolbarToggle from './ToolbarToggle';

function renderToolbar(orientation?: 'vertical') {
  return render(
    <Toolbar aria-label="Text formatting" orientation={orientation}>
      <ToolbarButton>Bold</ToolbarButton>
      <ToolbarButton>Italic</ToolbarButton>
      <ToolbarSeparator />
      <ToolbarButton aria-pressed>Underline</ToolbarButton>
      <ToolbarButton disabled>Strikethrough</ToolbarButton>
    </Toolbar>
  );
}

/** Enabled roving items in DOM order (disabled ones drop out). */
function items(): [HTMLElement, HTMLElement, HTMLElement] {
  const bold = screen.getByRole('button', { name: 'Bold' });
  const italic = screen.getByRole('button', { name: 'Italic' });
  const underline = screen.getByRole('button', { name: 'Underline' });
  return [bold, italic, underline];
}

describe('Toolbar', () => {
  it('renders a toolbar with horizontal orientation by default', () => {
    renderToolbar();
    const toolbar = screen.getByRole('toolbar', { name: 'Text formatting' });
    expect(toolbar).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('switches to vertical orientation', () => {
    renderToolbar('vertical');
    expect(screen.getByRole('toolbar')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('keeps exactly one tab stop, initially the first item', () => {
    renderToolbar();
    const [bold, italic, underline] = items();
    expect(bold).toHaveAttribute('tabindex', '0');
    expect(italic).toHaveAttribute('tabindex', '-1');
    expect(underline).toHaveAttribute('tabindex', '-1');
  });

  it('moves the tab stop with focus', async () => {
    const user = userEvent.setup();
    renderToolbar();
    await user.click(screen.getByRole('button', { name: 'Italic' }));
    const [bold, italic] = items();
    expect(italic).toHaveAttribute('tabindex', '0');
    expect(bold).toHaveAttribute('tabindex', '-1');
  });

  it('moves focus forward with ArrowRight, wrapping and skipping disabled items', async () => {
    const user = userEvent.setup();
    renderToolbar();
    const [bold, italic, underline] = items();
    bold.focus();
    await user.keyboard('{ArrowRight}');
    expect(italic).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    // Skips the separator and the disabled Strikethrough item.
    expect(underline).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    // Wraps back to the first item.
    expect(bold).toHaveFocus();
  });

  it('moves focus backward with ArrowLeft, wrapping', async () => {
    const user = userEvent.setup();
    renderToolbar();
    const [bold, italic, underline] = items();
    bold.focus();
    await user.keyboard('{ArrowLeft}');
    // Wraps from the first item to the last.
    expect(underline).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(italic).toHaveFocus();
  });

  it('jumps to the ends with Home and End', async () => {
    const user = userEvent.setup();
    renderToolbar();
    const [bold, , underline] = items();
    bold.focus();
    await user.keyboard('{End}');
    expect(underline).toHaveFocus();
    await user.keyboard('{Home}');
    expect(bold).toHaveFocus();
  });

  it('uses the vertical axis in vertical orientation', async () => {
    const user = userEvent.setup();
    renderToolbar('vertical');
    const [bold, italic] = items();
    bold.focus();
    await user.keyboard('{ArrowDown}');
    expect(italic).toHaveFocus();
    // The horizontal axis is inert in a vertical toolbar.
    await user.keyboard('{ArrowUp}');
    expect(bold).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(bold).toHaveFocus();
  });

  it('renders the separator with role and mirrored orientation', () => {
    const { unmount } = renderToolbar();
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
    unmount();

    renderToolbar('vertical');
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    renderToolbar();
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('ToolbarButton', () => {
  it('has type="button" by default and forwards native props', () => {
    render(
      <Toolbar>
        <ToolbarButton disabled aria-label="Insert link">
          Link
        </ToolbarButton>
      </Toolbar>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-label', 'Insert link');
  });

  it('applies className', () => {
    render(
      <Toolbar>
        <ToolbarButton className="custom">Bold</ToolbarButton>
      </Toolbar>
    );
    expect(screen.getByRole('button')).toHaveClass('custom');
  });

  it('calls onClick handler', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Toolbar>
        <ToolbarButton onClick={onClick}>Bold</ToolbarButton>
      </Toolbar>
    );
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('passes aria-pressed through for toggle items', () => {
    const { rerender } = render(
      <Toolbar>
        <ToolbarButton aria-pressed="false">Bold</ToolbarButton>
      </Toolbar>
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
    rerender(
      <Toolbar>
        <ToolbarButton aria-pressed="true">Bold</ToolbarButton>
      </Toolbar>
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('ToolbarToggle', () => {
  it('renders with aria-pressed=false by default and forwards native props', () => {
    render(
      <Toolbar aria-label="Text formatting">
        <ToolbarToggle disabled aria-label="Bold">
          B
        </ToolbarToggle>
      </Toolbar>
    );
    const toggle = screen.getByRole('button', { name: 'Bold' });
    expect(toggle).toHaveAttribute('type', 'button');
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(toggle).toBeDisabled();
    expect(toggle).toHaveAttribute('aria-label', 'Bold');
  });

  it('can be initialized pressed', () => {
    render(
      <Toolbar aria-label="Text formatting">
        <ToolbarToggle pressed>Bold</ToolbarToggle>
      </Toolbar>
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles aria-pressed on click', async () => {
    const user = userEvent.setup();
    render(
      <Toolbar aria-label="Text formatting">
        <ToolbarToggle>Bold</ToolbarToggle>
      </Toolbar>
    );
    const toggle = screen.getByRole('button', { name: 'Bold' });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });

  it('participates in toolbar roving keyboard navigation', async () => {
    const user = userEvent.setup();
    render(
      <Toolbar aria-label="Text formatting">
        <ToolbarButton>Bold</ToolbarButton>
        <ToolbarToggle>Italic</ToolbarToggle>
        <ToolbarButton>Underline</ToolbarButton>
      </Toolbar>
    );
    const bold = screen.getByRole('button', { name: 'Bold' });
    const italic = screen.getByRole('button', { name: 'Italic' });
    const underline = screen.getByRole('button', { name: 'Underline' });
    bold.focus();
    await user.keyboard('{ArrowRight}');
    expect(italic).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(underline).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(italic).toHaveFocus();
    // Space activates the focused toggle without breaking the roving stop.
    await user.keyboard(' ');
    expect(italic).toHaveAttribute('aria-pressed', 'true');
    expect(italic).toHaveFocus();
    expect(italic).toHaveAttribute('tabindex', '0');
  });
});

describe('ToolbarButton as polymorphism', () => {
  it("as='a' renders a real anchor wearing the roving wiring, no type attr", () => {
    render(<ToolbarButton as="a" href="/docs" data-track="tb" aria-label="Docs" />);
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/docs');
    expect(link).toHaveAttribute('data-track', 'tb');
    // the button-only default is gated — anchors don't carry it
    expect(link).not.toHaveAttribute('type');
    // the toolbar wiring follows the rendered element
    expect(link).toHaveAttribute('data-haze-toolbar-item', '');
    expect(link).toHaveAttribute('tabindex', '-1');
  });

  it("as='a' forwards ref to the anchor element", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(<ToolbarButton as="a" href="/docs" ref={ref} aria-label="Docs" />);
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  it('default shape unchanged: native button with type="button" and roving wiring', () => {
    render(<ToolbarButton aria-label="Docs" />);
    const button = screen.getByRole('button', { name: 'Docs' });
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('tabindex', '-1');
  });
});

describe('ToolbarToggle as polymorphism', () => {
  it("as='a' renders a real anchor: href/rest land on <a>, no type attr, pressed wiring kept", async () => {
    const user = userEvent.setup();
    render(<ToolbarToggle as="a" href="/grid" data-track="tt" aria-label="Grid view" />);
    const link = screen.getByRole('link', { name: 'Grid view' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/grid');
    expect(link).toHaveAttribute('data-track', 'tt');
    expect(link).not.toHaveAttribute('type');
    expect(link).toHaveAttribute('aria-pressed', 'false');
    // clicking still toggles on the anchor shape
    await user.click(link);
    expect(link).toHaveAttribute('aria-pressed', 'true');
  });

  it("as='a' forwards ref to the anchor element", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(<ToolbarToggle as="a" href="/grid" ref={ref} aria-label="Grid view" />);
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  it('default shape unchanged: native button with type="button"', () => {
    render(<ToolbarToggle aria-label="Grid view" />);
    const button = screen.getByRole('button', { name: 'Grid view' });
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
  });
});
