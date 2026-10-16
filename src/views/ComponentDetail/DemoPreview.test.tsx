import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import sdk from '@stackblitz/sdk';

import { darkTheme } from '@/lib';

import DemoPreview from './DemoPreview';
import { resolveDemo } from './demo-sources';

vi.mock('@stackblitz/sdk', () => ({
  default: { embedProject: vi.fn(() => Promise.resolve({})) },
}));

function previewArea(): HTMLElement {
  // The box below the toggle toolbar (the only element carrying a dir).
  return screen.getByText('demo body').parentElement!;
}

describe('DemoPreview', () => {
  it('renders demo content inside the preview box', () => {
    render(
      <DemoPreview>
        <p>demo body</p>
      </DemoPreview>
    );
    expect(screen.getByText('demo body')).toBeInTheDocument();
  });

  it('exposes both toggles as pressed-state buttons', () => {
    render(
      <DemoPreview>
        <p>demo body</p>
      </DemoPreview>
    );
    const dark = screen.getByRole('button', { name: 'Toggle dark preview' });
    const rtl = screen.getByRole('button', { name: 'Toggle RTL preview' });
    expect(dark).toHaveAttribute('aria-pressed', 'false');
    expect(rtl).toHaveAttribute('aria-pressed', 'false');
  });

  it('scopes darkTheme to the preview area only when toggled', async () => {
    const user = userEvent.setup();
    render(
      <DemoPreview>
        <p>demo body</p>
      </DemoPreview>
    );
    const darkBtn = screen.getByRole('button', { name: 'Toggle dark preview' });
    const area = previewArea();

    expect(area).not.toHaveClass(darkTheme);
    await user.click(darkBtn);
    expect(area).toHaveClass(darkTheme);
    expect(darkBtn).toHaveAttribute('aria-pressed', 'true');
    // The toolbar stays outside the dark scope: the toggles keep the
    // page theme regardless of the preview state.
    expect(darkBtn.closest('div')).not.toHaveClass(darkTheme);

    await user.click(darkBtn);
    expect(area).not.toHaveClass(darkTheme);
  });

  it('flips dir between rtl and ltr on the preview area only', async () => {
    const user = userEvent.setup();
    render(
      <DemoPreview>
        <p>demo body</p>
      </DemoPreview>
    );
    const rtlBtn = screen.getByRole('button', { name: 'Toggle RTL preview' });
    const area = previewArea();

    expect(area).toHaveAttribute('dir', 'ltr');
    await user.click(rtlBtn);
    expect(area).toHaveAttribute('dir', 'rtl');
    expect(rtlBtn).toHaveAttribute('aria-pressed', 'true');

    await user.click(rtlBtn);
    expect(area).toHaveAttribute('dir', 'ltr');
  });

  it('keeps the two toggles independent', async () => {
    const user = userEvent.setup();
    render(
      <DemoPreview>
        <p>demo body</p>
      </DemoPreview>
    );
    await user.click(screen.getByRole('button', { name: 'Toggle dark preview' }));
    await user.click(screen.getByRole('button', { name: 'Toggle RTL preview' }));

    const area = previewArea();
    expect(area).toHaveClass(darkTheme);
    expect(area).toHaveAttribute('dir', 'rtl');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <DemoPreview>
        <p>demo body</p>
      </DemoPreview>
    );
    const { axe } = await import('jest-axe');
    const results = await axe(container, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('DemoPreview viewport presets', () => {
  function viewportGroup(): HTMLElement {
    return screen.getByRole('group', { name: 'Preview viewport width' });
  }

  /** The width-constrained wrapper inside the preview area, if present. */
  function constrainedWrapper(): HTMLElement | null {
    const body = screen.getByText('demo body');
    return body.parentElement!.getAttribute('dir') ? null : body.parentElement!;
  }

  it('defaults to Auto with no width wrapper and Auto readout', () => {
    render(
      <DemoPreview>
        <p>demo body</p>
      </DemoPreview>
    );
    // Content sits directly in the preview area — exactly the old layout.
    expect(constrainedWrapper()).toBeNull();
    expect(screen.getByText('Auto', { selector: '[data-slot=width-tag]' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Auto' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: '375' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('constrains content to 375px and shows the width label', async () => {
    const user = userEvent.setup();
    render(
      <DemoPreview>
        <p>demo body</p>
      </DemoPreview>
    );
    await user.click(screen.getByRole('button', { name: '375' }));

    const wrapper = screen.getByText('demo body').parentElement!;
    expect(wrapper).toHaveStyle({ maxWidth: '375px' });
    expect(screen.getByText('375px')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '375' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Auto' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('switches to 768px and back to Auto (wrapper removed)', async () => {
    const user = userEvent.setup();
    render(
      <DemoPreview>
        <p>demo body</p>
      </DemoPreview>
    );
    await user.click(screen.getByRole('button', { name: '375' }));
    await user.click(screen.getByRole('button', { name: '768' }));
    expect(screen.getByText('demo body').parentElement!).toHaveStyle({
      maxWidth: '768px',
    });
    expect(screen.getByText('768px')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Auto' }));
    expect(constrainedWrapper()).toBeNull();
    expect(screen.getByText('Auto', { selector: '[data-slot=width-tag]' })).toBeInTheDocument();
  });

  it('coexists with the dark scope: wrapper lives inside darkTheme', async () => {
    const user = userEvent.setup();
    render(
      <DemoPreview>
        <p>demo body</p>
      </DemoPreview>
    );
    await user.click(screen.getByRole('button', { name: 'Toggle dark preview' }));
    await user.click(screen.getByRole('button', { name: '768' }));

    const wrapper = screen.getByText('demo body').parentElement!;
    expect(wrapper).toHaveStyle({ maxWidth: '768px' });
    expect(wrapper.closest('div')).not.toHaveClass(darkTheme); // wrapper itself
    expect(wrapper.parentElement!).toHaveClass(darkTheme); // preview area
  });

  it('renders all three presets inside the labelled group', () => {
    render(
      <DemoPreview>
        <p>demo body</p>
      </DemoPreview>
    );
    const group = viewportGroup();
    const names = within(group)
      .getAllByRole('button')
      .map((b) => b.textContent);
    expect(names).toEqual(['Auto', '375', '768']);
    expect(
      within(group)
        .getAllByRole('button')
        .map((b) => b.getAttribute('aria-pressed'))
    ).toEqual(['true', 'false', 'false']);
  });
});

describe('DemoPreview in-page run', () => {
  const embedProject = vi.mocked(sdk.embedProject);

  beforeEach(() => {
    embedProject.mockClear();
  });

  function runButton(): HTMLElement {
    return screen.getByRole('button', { name: 'Toggle in-page demo run' });
  }

  it('hides the run toggle when no demo source resolves', () => {
    // No name at all, and a route whose demo lives outside ./demos ('form').
    render(
      <DemoPreview>
        <p>demo body</p>
      </DemoPreview>
    );
    expect(
      screen.queryByRole('button', { name: 'Toggle in-page demo run' })
    ).not.toBeInTheDocument();

    render(<DemoPreview name='form'>static</DemoPreview>);
    expect(
      screen.queryByRole('button', { name: 'Toggle in-page demo run' })
    ).not.toBeInTheDocument();
  });

  it('keeps the default path static and SDK-free until toggled', async () => {
    render(
      <DemoPreview name='button'>
        <p>demo body</p>
      </DemoPreview>
    );
    // Static content renders; nothing pulls the SDK chunk.
    expect(screen.getByText('demo body')).toBeInTheDocument();
    await Promise.resolve();
    expect(embedProject).not.toHaveBeenCalled();
  });

  it('embeds the project on toggle and tears the iframe down on toggle-off', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DemoPreview name='button'>
        <p>demo body</p>
      </DemoPreview>
    );
    const runBtn = runButton();
    expect(runBtn).toHaveAttribute('aria-pressed', 'false');

    await user.click(runBtn);

    // Static content is swapped out for the embed host…
    expect(screen.queryByText('demo body')).not.toBeInTheDocument();
    expect(runBtn).toHaveAttribute('aria-pressed', 'true');
    const mount = container.querySelector<HTMLElement>(
      "[data-slot='stackblitz-embed']"
    );
    expect(mount).toBeInTheDocument();
    // jsdom measures 0px — the height pins to the SDK floor instead.
    expect(mount!.style.height).toBe('300px');

    // …the SDK embeds the demo's project into it, preview pane only.
    await waitFor(() => expect(embedProject).toHaveBeenCalledTimes(1));
    const [element, project, options] = embedProject.mock.calls[0]!;
    expect(element).toBeInstanceOf(HTMLElement);
    expect((element as HTMLElement).parentElement).toBe(mount);
    expect(project.files['src/App.tsx']).toBe(
      resolveDemo('button')!.source
    );
    expect(options).toMatchObject({
      view: 'preview',
      height: '100%',
      hideNavigation: true,
      crossOriginIsolated: true,
      theme: 'light',
    });

    // Toggle off: the mount node (and the iframe inside it) is destroyed.
    await user.click(runBtn);
    expect(screen.getByText('demo body')).toBeInTheDocument();
    expect(runBtn).toHaveAttribute('aria-pressed', 'false');
    expect(
      document.querySelector("[data-slot='stackblitz-embed']")
    ).toBeNull();
    expect(embedProject).toHaveBeenCalledTimes(1);
  });

  it('re-embeds with the matching theme when dark flips while live', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DemoPreview name='button'>
        <p>demo body</p>
      </DemoPreview>
    );
    await user.click(runButton());
    await waitFor(() => expect(embedProject).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole('button', { name: 'Toggle dark preview' }));
    await waitFor(() => expect(embedProject).toHaveBeenCalledTimes(2));
    expect(embedProject.mock.calls[1]![2]).toMatchObject({ theme: 'dark' });
    // The previous embed's iframe is cleared from the mount node.
    const mount = container.querySelector<HTMLElement>(
      "[data-slot='stackblitz-embed']"
    );
    expect(mount).toBeInTheDocument();
    expect(mount!.children).toHaveLength(1); // only the new placeholder
  });

  it('has no axe violations while live', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DemoPreview name='button'>
        <p>demo body</p>
      </DemoPreview>
    );
    await user.click(runButton());
    await waitFor(() => expect(embedProject).toHaveBeenCalled());
    const { axe } = await import('jest-axe');
    const results = await axe(container, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
