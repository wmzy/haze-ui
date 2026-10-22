import type {NavigationMenuProps} from './NavigationMenu';

import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {createRef} from 'react';
import {useControl} from 'react-use-control';

import NavigationMenu from './NavigationMenu';
import NavigationMenuList from './NavigationMenuList';
import NavigationMenuItem from './NavigationMenuItem';
import NavigationMenuTrigger from './NavigationMenuTrigger';
import NavigationMenuContent from './NavigationMenuContent';

/** The shared three-item fixture: two disclosures (Docs, Components)
 * and one plain item without a Content (Blog). */
function renderMenu(props: Partial<NavigationMenuProps> = {}) {
  render(
    <NavigationMenu aria-label='Main' {...props}>
      <NavigationMenuList>
        <NavigationMenuItem value='docs'>
          <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
          <NavigationMenuContent>
            <a href='#installation'>Installation</a>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value='components'>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>Components panel</NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem value='blog'>
          <NavigationMenuTrigger>Blog</NavigationMenuTrigger>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function trigger(name: string): HTMLButtonElement {
  return screen.getByRole('button', {name});
}

/** The floating panel a trigger's aria-controls points at. */
function panelOf(triggerEl: HTMLButtonElement) {
  const id = triggerEl.getAttribute('aria-controls');
  expect(id).toBeTruthy();
  return document.getElementById(id!)!;
}

/** React synthesizes onMouseEnter from mouseover, so drive the pair. */
function hover(el: Element) {
  fireEvent.mouseOver(el);
}

function leave(el: Element) {
  fireEvent.mouseOut(el);
}

describe('NavigationMenu', () => {
  it('renders the nav landmark, list and triggers', () => {
    renderMenu();
    expect(screen.getByRole('navigation', {name: 'Main'})).toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(trigger('Docs')).toBeInTheDocument();
    expect(trigger('Components')).toBeInTheDocument();
    expect(trigger('Blog')).toBeInTheDocument();
  });

  it('links trigger and panel through aria-controls and aria-labelledby', () => {
    renderMenu();
    const docs = trigger('Docs');
    const panel = panelOf(docs);
    expect(panel).toBeInTheDocument();
    expect(docs.getAttribute('aria-expanded')).toBe('false');
    expect(panel.getAttribute('aria-labelledby')).toBe(
      docs.getAttribute('id')
    );
  });

  it('renders content-less items as plain buttons without disclosure wiring', () => {
    renderMenu();
    const blog = trigger('Blog');
    expect(blog).not.toHaveAttribute('aria-expanded');
    expect(blog).not.toHaveAttribute('aria-controls');
  });

  it('opens on hover after the intent delay', () => {
    vi.useFakeTimers();
    try {
      renderMenu();
      const docs = trigger('Docs');
      hover(docs);
      expect(docs.getAttribute('aria-expanded')).toBe('false');
      act(() => {
        vi.advanceTimersByTime(99);
      });
      expect(docs.getAttribute('aria-expanded')).toBe('false');
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(docs.getAttribute('aria-expanded')).toBe('true');
    } finally {
      vi.useRealTimers();
    }
  });

  it('respects a custom intentDelay', () => {
    vi.useFakeTimers();
    try {
      renderMenu({intentDelay: 50});
      const docs = trigger('Docs');
      hover(docs);
      act(() => {
        vi.advanceTimersByTime(49);
      });
      expect(docs.getAttribute('aria-expanded')).toBe('false');
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(docs.getAttribute('aria-expanded')).toBe('true');
    } finally {
      vi.useRealTimers();
    }
  });

  it('switches panels instantly once one is open', () => {
    vi.useFakeTimers();
    try {
      renderMenu();
      hover(trigger('Docs'));
      act(() => {
        vi.advanceTimersByTime(100);
      });
      // No timer advance: moving to a sibling trigger while a panel is
      // open must switch immediately, not after a second intent dwell.
      hover(trigger('Components'));
      expect(trigger('Docs').getAttribute('aria-expanded')).toBe('false');
      expect(trigger('Components').getAttribute('aria-expanded')).toBe('true');
    } finally {
      vi.useRealTimers();
    }
  });

  it('closes after the grace period once the pointer leaves', () => {
    vi.useFakeTimers();
    try {
      renderMenu();
      const docs = trigger('Docs');
      hover(docs);
      act(() => {
        vi.advanceTimersByTime(100);
      });
      leave(docs);
      act(() => {
        vi.advanceTimersByTime(299);
      });
      expect(docs.getAttribute('aria-expanded')).toBe('true');
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(docs.getAttribute('aria-expanded')).toBe('false');
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps the panel open when the pointer reaches it within the grace', () => {
    vi.useFakeTimers();
    try {
      renderMenu();
      const docs = trigger('Docs');
      hover(docs);
      act(() => {
        vi.advanceTimersByTime(100);
      });
      leave(docs);
      act(() => {
        vi.advanceTimersByTime(200);
      });
      hover(panelOf(docs));
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(docs.getAttribute('aria-expanded')).toBe('true');
    } finally {
      vi.useRealTimers();
    }
  });

  it('arms the close again when the pointer leaves the panel', () => {
    vi.useFakeTimers();
    try {
      renderMenu();
      const docs = trigger('Docs');
      hover(docs);
      act(() => {
        vi.advanceTimersByTime(100);
      });
      const panel = panelOf(docs);
      hover(panel);
      leave(panel);
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(docs.getAttribute('aria-expanded')).toBe('false');
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not pointer-close a panel keyboard focus is reading', () => {
    vi.useFakeTimers();
    try {
      renderMenu();
      const docs = trigger('Docs');
      hover(docs);
      act(() => {
        vi.advanceTimersByTime(100);
      });
      act(() => {
        screen.getByText('Installation').focus();
      });
      leave(docs);
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(docs.getAttribute('aria-expanded')).toBe('true');
    } finally {
      vi.useRealTimers();
    }
  });

  it('toggles immediately on trigger click', async () => {
    const user = userEvent.setup();
    renderMenu();
    const docs = trigger('Docs');
    await user.click(docs);
    expect(docs.getAttribute('aria-expanded')).toBe('true');
    await user.click(docs);
    expect(docs.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens with Enter and closes with Escape', async () => {
    const user = userEvent.setup();
    renderMenu();
    const docs = trigger('Docs');
    docs.focus();
    await user.keyboard('{Enter}');
    expect(docs.getAttribute('aria-expanded')).toBe('true');
    await user.keyboard('{Escape}');
    expect(docs.getAttribute('aria-expanded')).toBe('false');
  });

  it('moves focus between triggers with arrow keys and Home/End', async () => {
    const user = userEvent.setup();
    renderMenu();
    const docs = trigger('Docs');
    const components = trigger('Components');
    const blog = trigger('Blog');
    docs.focus();
    await user.keyboard('{ArrowRight}');
    expect(components).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(blog).toHaveFocus();
    // Wraps around the strip.
    await user.keyboard('{ArrowRight}');
    expect(docs).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(blog).toHaveFocus();
    await user.keyboard('{Home}');
    expect(docs).toHaveFocus();
    await user.keyboard('{End}');
    expect(blog).toHaveFocus();
  });

  it('opens on focus after the intent delay and closes on blur after the grace', () => {
    vi.useFakeTimers();
    try {
      renderMenu();
      const docs = trigger('Docs');
      act(() => {
        docs.focus();
      });
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(docs.getAttribute('aria-expanded')).toBe('true');
      fireEvent.blur(docs);
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(docs.getAttribute('aria-expanded')).toBe('false');
    } finally {
      vi.useRealTimers();
    }
  });

  it('keeps the panel open when focus moves into it', () => {
    vi.useFakeTimers();
    try {
      renderMenu();
      const docs = trigger('Docs');
      act(() => {
        docs.focus();
      });
      act(() => {
        vi.advanceTimersByTime(100);
      });
      fireEvent.blur(docs, {
        relatedTarget: screen.getByText('Installation'),
      });
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(docs.getAttribute('aria-expanded')).toBe('true');
    } finally {
      vi.useRealTimers();
    }
  });

  it('returns focus to the trigger when the panel closes under focus', async () => {
    const user = userEvent.setup();
    renderMenu();
    const docs = trigger('Docs');
    await user.click(docs);
    screen.getByText('Installation').focus();
    await user.keyboard('{Escape}');
    expect(docs.getAttribute('aria-expanded')).toBe('false');
    await waitFor(() => expect(docs).toHaveFocus());
  });

  it('supports a fully controlled activeValue', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const Controlled = () => {
      const [active, setActive, activeCtrl] = useControl(undefined, null);
      return (
        <>
          <NavigationMenu activeValue={activeCtrl} onActiveValueChange={onChange}>
            <NavigationMenuList>
              <NavigationMenuItem value='docs'>
                <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
                <NavigationMenuContent>Docs panel</NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <output data-testid='active'>{String(active)}</output>
          <button data-testid='close' onClick={() => setActive(null)}>
            close
          </button>
        </>
      );
    };
    render(<Controlled />);
    const docs = screen.getByRole('button', {name: 'Docs'});
    await user.click(docs);
    expect(screen.getByTestId('active').textContent).toBe('docs');
    expect(onChange).toHaveBeenCalledWith('docs');
    await user.click(screen.getByTestId('close'));
    expect(docs.getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByTestId('active').textContent).toBe('null');
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('treats a plain activeValue as the uncontrolled default', () => {
    renderMenu({activeValue: 'docs'});
    expect(trigger('Docs').getAttribute('aria-expanded')).toBe('true');
  });

  it('applies className to the root and classNames to every slot', () => {
    renderMenu({
      className: 'custom-root',
      classNames: {
        root: 'cx-root',
        list: 'cx-list',
        item: 'cx-item',
        trigger: 'cx-trigger',
        content: 'cx-content',
      },
    });
    const nav = screen.getByRole('navigation', {name: 'Main'});
    expect(nav).toHaveClass('cx-root');
    expect(nav).toHaveClass('custom-root');
    expect(screen.getByRole('list')).toHaveClass('cx-list');
    const docs = trigger('Docs');
    expect(docs.closest('li')).toHaveClass('cx-item');
    expect(docs).toHaveClass('cx-trigger');
    expect(panelOf(docs)).toHaveClass('cx-content');
  });

  it('forwards ref to the nav element', () => {
    const ref = createRef<HTMLElement>();
    renderMenu({ref});
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('NAV');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    renderMenu();
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations with a panel open', async () => {
    const { axe } = await import('jest-axe');
    const user = userEvent.setup();
    renderMenu();
    await user.click(trigger('Docs'));
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
