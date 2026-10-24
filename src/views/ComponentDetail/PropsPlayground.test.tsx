import type { ReactNode } from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import sdk from '@stackblitz/sdk';

import PropsPlayground from './PropsPlayground';

/* Minimal props.json fragment: one component entry whose primary type
 * covers every control kind (boolean / literal union / number / string)
 * plus the read-only fallbacks (ReactNode, function, ControlOrValue). */
vi.mock('@stackblitz/sdk', () => ({
  default: { openProject: vi.fn(() => undefined) },
}));

vi.mock('@/generated/props.json', () => ({
  default: {
    components: {
      button: {
        routeKey: 'button',
        cssFamily: 'button',
        imports: ['Button'],
        propsTypes: {
          ButtonProps: [
            { name: 'variant', type: "'solid' | 'outline' | 'ghost'", required: false },
            { name: 'square', type: 'boolean', required: false },
            { name: 'count', type: 'number', required: false },
            { name: 'label', type: 'string', required: false },
            { name: 'icon', type: 'ReactNode', required: false },
            { name: 'onSelect', type: '(id: string) => void', required: false },
            { name: 'checked', type: 'ControlOrValue<boolean>', required: false },
          ],
        },
        otherTypes: {},
      },
    },
  },
}));

vi.mock('@/generated/props-docs.json', () => ({
  default: {
    ButtonProps: [
      {
        name: 'variant',
        default: "'solid'",
        description: 'Visual style of the button',
      },
      { name: 'square', default: 'false' },
      { name: 'count', default: '3' },
      { name: 'label', default: "'Press me'" },
    ],
  },
}));

/* Spy component standing in for the demo root: every cloneElement
 * injection re-renders it, so mock.lastCall captures the live props. */
const Target = vi.fn((props: Record<string, unknown>) => (
  <output data-testid='target'>
    {typeof props.label === 'string' ? props.label : ''}
  </output>
));

function mountPlayground(demo?: ReactNode) {
  return render(
    <PropsPlayground name='button' demo={demo ?? <Target />}>
      {(node) => <div data-testid='host'>{node}</div>}
    </PropsPlayground>
  );
}

async function openPanel(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /props playground/i }));
}

beforeEach(() => {
  Target.mockClear();
  vi.mocked(sdk.openProject).mockClear();
});

describe('PropsPlayground', () => {
  it('renders only the demo node when the route has no props entry', () => {
    render(
      <PropsPlayground name='form' demo={<Target />}>
        {(node) => <div data-testid='host'>{node}</div>}
      </PropsPlayground>
    );
    expect(
      screen.queryByRole('button', { name: /props playground/i })
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('host')).toContainElement(
      screen.getByTestId('target')
    );
  });

  it('is collapsed by default and expands via the trigger', async () => {
    const user = userEvent.setup();
    mountPlayground();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();

    await openPanel(user);
    expect(screen.getByRole('switch', { name: 'square' })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: 'count' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'label' })).toBeInTheDocument();
  });

  it('injects boolean toggles into a single-element demo (cloneElement path)', async () => {
    const user = userEvent.setup();
    mountPlayground();
    expect('square' in Target.mock.lastCall![0]).toBe(false);

    await openPanel(user);
    await user.click(screen.getByRole('switch', { name: 'square' }));
    expect(Target.mock.lastCall![0].square).toBe(true);

    await user.click(screen.getByRole('switch', { name: 'square' }));
    expect(Target.mock.lastCall![0].square).toBe(false);
  });

  it('renders literal unions as Segmented and switches the prop', async () => {
    const user = userEvent.setup();
    mountPlayground();
    await openPanel(user);

    // Default comes from props-docs.json ('solid') and nothing is
    // overridden until the user picks a segment.
    expect('variant' in Target.mock.lastCall![0]).toBe(false);
    await user.click(screen.getByRole('button', { name: 'outline' }));
    expect(Target.mock.lastCall![0].variant).toBe('outline');
  });

  it('renders a NumberInput seeded with the documented default', async () => {
    const user = userEvent.setup();
    mountPlayground();
    await openPanel(user);

    const input = screen.getByRole('spinbutton', { name: 'count' });
    expect(input).toHaveValue(3);

    await user.clear(input);
    await user.type(input, '7');
    expect(Target.mock.lastCall![0].count).toBe(7);
  });

  it('renders a string Input seeded with the documented default', async () => {
    const user = userEvent.setup();
    mountPlayground();
    await openPanel(user);

    const input = screen.getByRole('textbox', { name: 'label' });
    expect(input).toHaveValue('Press me');

    await user.clear(input);
    await user.type(input, 'Go');
    expect(Target.mock.lastCall![0].label).toBe('Go');
  });

  it('shows complex types read-only with no controls', async () => {
    const user = userEvent.setup();
    mountPlayground();
    await openPanel(user);

    expect(screen.getByText('ReactNode')).toBeInTheDocument();
    expect(screen.getByText('(id: string) => void')).toBeInTheDocument();
    expect(screen.getByText('ControlOrValue<boolean>')).toBeInTheDocument();
    // Exactly one control of each kind — the complex rows got none.
    expect(screen.getAllByRole('switch')).toHaveLength(1);
    expect(screen.getAllByRole('spinbutton')).toHaveLength(1);
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
  });

  it('copies the generated JSX attribute source', async () => {
    const user = userEvent.setup();
    // Must be installed after userEvent.setup(): user-event swaps in its
    // own Clipboard stub while setting up, which would bury this mock.
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    mountPlayground();
    await openPanel(user);

    await user.click(screen.getByRole('switch', { name: 'square' }));
    await user.click(screen.getByRole('button', { name: 'Copy props' }));
    expect(writeText).toHaveBeenCalledWith('square');
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();

    const input = screen.getByRole('textbox', { name: 'label' });
    await user.clear(input);
    await user.type(input, 'Go');
    // The pre holds all overrides as one text node; match within it.
    expect(screen.getByText(/label=\{"Go"\}/)).toBeInTheDocument();
  });

  it('resets all overrides and restores the untouched demo props', async () => {
    const user = userEvent.setup();
    mountPlayground();
    await openPanel(user);

    await user.click(screen.getByRole('switch', { name: 'square' }));
    expect(Target.mock.lastCall![0].square).toBe(true);
    expect(screen.getByText('1')).toBeInTheDocument(); // count tag

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect('square' in Target.mock.lastCall![0]).toBe(false);
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('keeps fragment-rooted demos untouched and points at the copy fallback', async () => {
    const user = userEvent.setup();
    mountPlayground(<>fragment demo body</>);
    await openPanel(user);

    await user.click(screen.getByRole('switch', { name: 'square' }));
    expect(screen.getByText('fragment demo body')).toBeInTheDocument();
    expect(
      screen.getByText(/copy the generated attributes instead/i)
    ).toBeInTheDocument();
    expect(Target).not.toHaveBeenCalled();
  });

  it('exports the current props state as a StackBlitz project', async () => {
    const user = userEvent.setup();
    mountPlayground();
    await openPanel(user);

    await user.click(screen.getByRole('switch', { name: 'square' }));
    const label = screen.getByRole('textbox', { name: 'label' });
    await user.clear(label);
    await user.type(label, 'Go');

    await user.click(
      screen.getByRole('button', { name: /open in stackblitz/i })
    );
    await waitFor(() => expect(sdk.openProject).toHaveBeenCalledTimes(1));

    const [project, openOptions] = vi.mocked(sdk.openProject).mock.calls[0]!;
    const { title, files } = project as unknown as {
      title: string;
      files: Record<string, string>;
    };
    expect(title).toBe('haze-ui · Button playground');
    expect(openOptions).toEqual({ newWindow: true });
    const app = files['src/App.tsx']!;
    expect(app).toContain("import { Button } from 'haze-ui';");
    expect(app).toMatch(/\n\s+square\n/); // boolean 覆盖 → 裸属性
    expect(app).toContain('label="Go"');
    expect(app).toContain("import 'haze-ui/styles.css';");
  });

  it('toasts a failure notice when the SDK cannot open the project', async () => {
    const user = userEvent.setup();
    mountPlayground();
    await openPanel(user);

    // openProject 的类型签名返回 void —— 同步抛错（或 sdk chunk 加载
    // 失败）是 try/catch 能接住的失败形态。
    vi.mocked(sdk.openProject).mockImplementationOnce(() => {
      throw new Error('blocked');
    });
    await user.click(
      screen.getByRole('button', { name: /open in stackblitz/i })
    );

    expect(
      await screen.findByText(/could not open stackblitz/i)
    ).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const user = userEvent.setup();
    const { container } = mountPlayground();
    await openPanel(user);
    const { axe } = await import('jest-axe');
    const results = await axe(container, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
