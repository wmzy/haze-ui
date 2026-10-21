import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import userEvent from '@testing-library/user-event';
import { useControl } from 'react-use-control';

import ColorPicker from './ColorPicker';
import ColorPickerCore from './ColorPickerCore';

/** A clickable rect mock for pointer-driven surfaces. */
function rect(left: number, top: number, width: number, height: number): DOMRect {
  return {left, top, width, height, right: left + width, bottom: top + height, x: left, y: top} as DOMRect;
}

async function openPanel(
  user: ReturnType<typeof userEvent.setup>,
  name = 'Pick color'
) {
  await user.click(screen.getByRole('button', {name}));
  return screen.getByRole('dialog');
}

/** aria-labels of every button inside the open panel, in DOM order. */
function panelButtonLabels(panel: HTMLElement): (string | null)[] {
  return [...panel.querySelectorAll('button')].map((b) => b.getAttribute('aria-label'));
}

describe('ColorPicker', () => {
  it('renders a swatch trigger with popup semantics', () => {
    render(<ColorPicker value="#ff0000" />);
    const trigger = screen.getByRole('button', {name: 'Pick color'});
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    // The panel is linked but idle while closed (the hidden state rides
    // data-state — jsdom applies no CSS, so visibility is not asserted).
    const panel = document.getElementById(trigger.getAttribute('aria-controls')!);
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveAttribute('data-state', 'closed');
  });

  it('paints the trigger with the current color', () => {
    render(<ColorPicker value="#00ff00" />);
    const fill = screen.getByRole('button', {name: 'Pick color'}).querySelector('span');
    expect(fill).toHaveStyle({background: 'rgba(0, 255, 0, 1)'});
  });

  it('opens the panel on trigger click and focuses the SV slider', async () => {
    const user = userEvent.setup();
    render(<ColorPicker value="#ff0000" />);
    await user.click(screen.getByRole('button', {name: 'Pick color'}));
    expect(screen.getByRole('button', {name: 'Pick color'})).toHaveAttribute('aria-expanded', 'true');
    const sliders = screen.getAllByRole('slider');
    expect(sliders.length).toBe(2); // SV + hue, no alpha by default
    expect(document.activeElement).toBe(sliders[0]);
  });

  it('closes on a second trigger click', async () => {
    const user = userEvent.setup();
    render(<ColorPicker value="#ff0000" />);
    const trigger = screen.getByRole('button', {name: 'Pick color'});
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('dialog')).toHaveAttribute('data-state', 'closed');
  });

  it('closes on outside pointerdown', async () => {
    const user = userEvent.setup();
    render(<ColorPicker value="#ff0000" />);
    await openPanel(user);
    fireEvent.pointerDown(document.body);
    expect(screen.getByRole('button', {name: 'Pick color'})).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(<ColorPicker value="#ff0000" />);
    await openPanel(user);
    fireEvent.keyDown(document.body, {key: 'Escape'});
    expect(screen.getByRole('button', {name: 'Pick color'})).toHaveAttribute('aria-expanded', 'false');
  });

  it('supports a controlled open state', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [, setOpen, ctrl] = useControl(undefined, true);
      return (
        <>
          <ColorPicker open={ctrl} value="#ff0000" />
          {/* Fixed-direction buttons: an outside *toggle* would reopen
              on the click that follows the pointerdown light-dismiss. */}
          <button type="button" onClick={() => setOpen(false)}>close-outer</button>
          <button type="button" onClick={() => setOpen(true)}>open-outer</button>
        </>
      );
    }
    render(<Harness />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: 'close-outer'}));
    expect(screen.getByRole('dialog')).toHaveAttribute('data-state', 'closed');
    await user.click(screen.getByRole('button', {name: 'open-outer'}));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // The trigger still toggles through the same control.
    await user.click(screen.getByRole('button', {name: 'Pick color'}));
    expect(screen.getByRole('dialog')).toHaveAttribute('data-state', 'closed');
  });

  it('applies className to the panel', () => {
    render(<ColorPicker value="#ff0000" className="custom" />);
    expect(screen.getByRole('button', {name: 'Pick color'}).parentElement).not.toHaveClass('custom');
    const panelId = screen.getByRole('button', {name: 'Pick color'}).getAttribute('aria-controls');
    expect(document.getElementById(panelId!)).toHaveClass('custom');
  });

  it('commits continuously across an SV panel drag', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker value="#ff0000" onChange={onChange} recent />);
    const panel = await openPanel(user);
    const sv = screen.getAllByRole('slider')[0]!;
    vi.spyOn(sv, 'getBoundingClientRect').mockReturnValue(rect(0, 0, 200, 100));

    // Center: hue 0 (red), s = 0.5, v = 0.5 → #804040.
    fireEvent.pointerDown(sv, {pointerId: 1, clientX: 100, clientY: 50});
    expect(onChange).toHaveBeenCalledWith('#804040');
    // Drag moves stream values; no commit while the gesture runs.
    fireEvent.pointerMove(sv, {pointerId: 1, clientX: 200, clientY: 0});
    expect(onChange).toHaveBeenCalledWith('#ff0000');
    expect(panelButtonLabels(panel)).toEqual([]);
    // Release commits the settled color (recent row records it).
    fireEvent.pointerUp(sv, {pointerId: 1, clientX: 200, clientY: 0});
    expect(panelButtonLabels(panel)).toEqual(['#ff0000']);
  });

  it('moves the hue via pointer on the hue rail', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker value="#ff0000" onChange={onChange} />);
    await openPanel(user);
    const hue = screen.getAllByRole('slider')[1]!;
    vi.spyOn(hue, 'getBoundingClientRect').mockReturnValue(rect(0, 0, 360, 12));
    fireEvent.pointerDown(hue, {pointerId: 1, clientX: 120, clientY: 6});
    expect(onChange).toHaveBeenCalledWith('#00ff00');
  });

  it('exposes hue value semantics for screen readers', async () => {
    const user = userEvent.setup();
    render(<ColorPicker value="#ff0000" />);
    await openPanel(user);
    const hue = screen.getAllByRole('slider')[1]!;
    expect(hue).toHaveAttribute('aria-valuenow', '0');
    expect(hue).toHaveAttribute('aria-valuemin', '0');
    expect(hue).toHaveAttribute('aria-valuemax', '360');
  });

  it('adjusts hue with arrow keys', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker value="#ff0000" onChange={onChange} />);
    await openPanel(user);
    const hue = screen.getAllByRole('slider')[1]!;
    fireEvent.keyDown(hue, {key: 'ArrowRight'});
    expect(onChange).toHaveBeenCalledWith('#ff0400');
  });

  it('serializes alpha when allowAlpha is set', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker value="#ff0000" allowAlpha onChange={onChange} />);
    await openPanel(user);
    const sliders = screen.getAllByRole('slider');
    expect(sliders.length).toBe(3); // SV + hue + alpha
    const alpha = sliders[2]!;
    vi.spyOn(alpha, 'getBoundingClientRect').mockReturnValue(rect(0, 0, 100, 12));
    fireEvent.pointerDown(alpha, {pointerId: 1, clientX: 50, clientY: 6});
    expect(onChange).toHaveBeenCalledWith('#ff000080');
    expect(alpha).toHaveAttribute('aria-valuenow', '50');
  });

  it('rounds alpha to the nearest byte', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker value="#ff0000" allowAlpha onChange={onChange} />);
    await openPanel(user);
    const alpha = screen.getAllByRole('slider')[2]!;
    vi.spyOn(alpha, 'getBoundingClientRect').mockReturnValue(rect(0, 0, 3, 12));
    fireEvent.pointerDown(alpha, {pointerId: 1, clientX: 1, clientY: 6});
    // 1/3 opacity → 85/255 → 0x55.
    expect(onChange).toHaveBeenCalledWith('#ff000055');
  });

  it('shows and accepts the rgb format', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker value="#ff0000" format="rgb" onChange={onChange} />);
    await openPanel(user);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('rgb(255, 0, 0)');
    fireEvent.change(input, {target: {value: 'rgb(0, 255, 0)'}});
    fireEvent.keyDown(input, {key: 'Enter'});
    expect(onChange).toHaveBeenCalledWith('rgb(0, 255, 0)');
    // Serialized output follows the format prop.
    expect(input).toHaveValue('rgb(0, 255, 0)');
  });

  it('shows the hsl format', async () => {
    const user = userEvent.setup();
    render(<ColorPicker value="#ff0000" format="hsl" />);
    await openPanel(user);
    expect(screen.getByRole('textbox')).toHaveValue('hsl(0, 100%, 50%)');
  });

  it('accepts any format in the text field and normalizes it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker value="#ff0000" format="rgb" onChange={onChange} />);
    await openPanel(user);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, {target: {value: '#0000ff'}});
    fireEvent.keyDown(input, {key: 'Enter'});
    expect(onChange).toHaveBeenCalledWith('rgb(0, 0, 255)');
  });

  it('treats unparsable text input as a no-op', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker value="#ff0000" onChange={onChange} />);
    await openPanel(user);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, {target: {value: 'notacolor'}});
    expect(input).toHaveValue('notacolor');
    fireEvent.keyDown(input, {key: 'Enter'});
    expect(onChange).not.toHaveBeenCalled();
    // Draft discarded: the formatted value comes back.
    expect(input).toHaveValue('#ff0000');
  });

  it('drops the draft on Escape without closing the panel', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker value="#ff0000" onChange={onChange} />);
    await openPanel(user);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, {target: {value: 'zzz'}});
    fireEvent.keyDown(input, {key: 'Escape'});
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('#ff0000');
    expect(screen.getByRole('button', {name: 'Pick color'})).toHaveAttribute('aria-expanded', 'true');
  });

  it('picks preset colors and normalizes them to the format', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ColorPicker
        value="#ff0000"
        presets={['#ff0000', '#00ff00', '#0000ff']}
        format="rgb"
        onChange={onChange}
      />
    );
    await openPanel(user);
    await user.click(screen.getByLabelText('#00ff00'));
    expect(onChange).toHaveBeenCalledWith('rgb(0, 255, 0)');
  });

  it('tracks recent colors newest-first, deduplicated', async () => {
    const user = userEvent.setup();
    render(
      <ColorPicker
        value="#ff0000"
        presets={['#ff0000', '#00ff00', '#0000ff']}
        recent
      />
    );
    const panel = await openPanel(user);
    // Preset row only.
    expect(panelButtonLabels(panel)).toEqual(['#ff0000', '#00ff00', '#0000ff']);

    await user.click(screen.getByLabelText('#00ff00'));
    expect(panelButtonLabels(panel)).toEqual([
      '#ff0000', '#00ff00', '#0000ff', // presets
      '#00ff00', // recent
    ]);

    await user.click(screen.getByLabelText('#0000ff'));
    expect(panelButtonLabels(panel)).toEqual([
      '#ff0000', '#00ff00', '#0000ff', // presets
      '#0000ff', '#00ff00', // recent, newest first
    ]);

    // Re-picking an existing color moves it to the front, no duplicate.
    // (The preset row renders first, so index 0 is the preset swatch.)
    await user.click(screen.getAllByLabelText('#00ff00')[0]!);
    const labels = panelButtonLabels(panel);
    expect(labels.slice(-2)).toEqual(['#00ff00', '#0000ff']);
    expect(labels.filter((l) => l === '#00ff00').length).toBe(2); // preset + recent
  });

  it('caps recent colors at ten', async () => {
    const user = userEvent.setup();
    render(<ColorPicker value="#000000" recent />);
    const panel = await openPanel(user);
    const input = screen.getByRole('textbox');
    for (let i = 1; i <= 12; i++) {
      const hex = `#0000${i.toString(16).padStart(2, '0')}`;
      fireEvent.change(input, {target: {value: hex}});
      fireEvent.keyDown(input, {key: 'Enter'});
    }
    // 12 committed colors → recent capped at 10, newest first.
    const labels = panelButtonLabels(panel);
    expect(labels.length).toBe(10);
    expect(labels[0]).toBe('#00000c');
    expect(labels[9]).toBe('#000003');
  });

  it('updates uncontrolled value on preset pick', async () => {
    const user = userEvent.setup();
    render(<ColorPicker value="#ff0000" presets={['#00ff00']} />);
    await openPanel(user);
    await user.click(screen.getByLabelText('#00ff00'));
    expect(screen.getByRole('textbox')).toHaveValue('#00ff00');
    const fill = screen.getByRole('button', {name: 'Pick color'}).querySelector('span');
    expect(fill).toHaveStyle({background: 'rgba(0, 255, 0, 1)'});
  });

  it('follows a controlled value control in both directions', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [, setValue, ctrl] = useControl(undefined, '#ff0000');
      return (
        <>
          <ColorPicker value={ctrl} presets={['#00ff00']} />
          <button type="button" onClick={() => setValue('#0000ff')}>ext</button>
        </>
      );
    }
    render(<Harness />);
    await openPanel(user);
    expect(screen.getByRole('textbox')).toHaveValue('#ff0000');
    // External write through the control drives the panel.
    await user.click(screen.getByRole('button', {name: 'ext'}));
    expect(screen.getByRole('textbox')).toHaveValue('#0000ff');
    // Panel commits write back through the same control.
    await user.click(screen.getByLabelText('#00ff00'));
    expect(screen.getByRole('textbox')).toHaveValue('#00ff00');
  });

  it('renders an always-visible panel in inline mode', () => {
    render(<ColorPicker inline value="#ff0000" presets={['#00ff00']} className="custom" />);
    expect(screen.queryByRole('button', {name: 'Pick color'})).toBeNull();
    expect(screen.getAllByRole('slider').length).toBe(2);
    expect(screen.getByRole('textbox')).toHaveValue('#ff0000');
    // Inline root is the panel card: className lands there.
    const input = screen.getByRole('textbox');
    expect(input.closest('.custom')).not.toBeNull();
  });

  it('has no axe violations (closed)', async () => {
    const {axe} = await import('jest-axe');
    render(<ColorPicker value="#ff0000" presets={['#ff0000', '#00ff00']} />);
    const results = await axe(document.body, {rules: {region: {enabled: false}}});
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations (open, alpha + presets + recent)', async () => {
    const {axe} = await import('jest-axe');
    const user = userEvent.setup();
    render(
      <ColorPicker
        value="#ff0000"
        allowAlpha
        presets={['#ff0000', '#00ff00']}
        recent
        aria-label="Background color"
      />
    );
    await openPanel(user, 'Background color');
    const results = await axe(document.body, {rules: {region: {enabled: false}}});
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations (inline)', async () => {
    const {axe} = await import('jest-axe');
    render(
      <ColorPicker
        inline
        value="#ff0000"
        allowAlpha
        presets={['#ff0000', '#00ff00']}
        recent
      />
    );
    const results = await axe(document.body, {rules: {region: {enabled: false}}});
    expect(results.violations).toEqual([]);
  });
});

describe('ColorPickerCore', () => {
  it('renders the given value in both inputs', () => {
    render(<ColorPickerCore value="#00ff00" onChange={() => undefined} />);
    expect(screen.getAllByDisplayValue('#00ff00').length).toBe(2);
  });

  it('calls onChange with the typed value', () => {
    const onChange = vi.fn();
    render(<ColorPickerCore value="#ff0000" onChange={onChange} />);
    const input = screen.getByRole('textbox');
    // a controlled core resets the DOM value to its `value` prop on every
    // render, so set the whole string in one change event
    fireEvent.change(input, {target: {value: '#0000ff'}});
    expect(onChange).toHaveBeenCalledWith('#0000ff');
  });

  it('calls onChange with the preset color on click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ColorPickerCore
        value="#ff0000"
        onChange={onChange}
        presets={['#00ff00']}
      />
    );
    await user.click(screen.getByLabelText('#00ff00'));
    expect(onChange).toHaveBeenCalledWith('#00ff00');
  });
});

describe('ColorPicker ref forwarding', () => {
  it('forwards ref to the trigger button (floating mode)', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<ColorPicker ref={ref} value="#ff0000" />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    ref.current?.focus();
    expect(document.activeElement).toBe(ref.current);
  });

  it('forwards ref to the panel card (inline mode)', () => {
    const ref = createRef<HTMLDivElement>();
    render(<ColorPicker inline ref={ref} value="#ff0000" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toContainElement(screen.getAllByRole('slider')[0]!);
  });
});

describe('ColorPicker native form participation', () => {
  it('submits the value under name (floating mode)', () => {
    const {container} = render(
      <form onSubmit={(e) => e.preventDefault()}>
        <ColorPicker name="accent" value="#ff0000" />
      </form>
    );
    expect(new FormData(container.querySelector('form')!).get('accent')).toBe('#ff0000');
  });

  it('submits in inline mode too', () => {
    const {container} = render(
      <form onSubmit={(e) => e.preventDefault()}>
        <ColorPicker inline name="accent" value="#00ff00" />
      </form>
    );
    expect(new FormData(container.querySelector('form')!).get('accent')).toBe('#00ff00');
  });

  it('serializes in format — what submits is what the text field shows', () => {
    const {container} = render(
      <form onSubmit={(e) => e.preventDefault()}>
        <ColorPicker name="accent" value="#ff0000" format="rgb" />
      </form>
    );
    expect(new FormData(container.querySelector('form')!).get('accent')).toBe(
      'rgb(255, 0, 0)'
    );
  });

  it('keeps the alpha channel when allowAlpha is set', () => {
    const {container} = render(
      <form onSubmit={(e) => e.preventDefault()}>
        <ColorPicker name="accent" value="#ff000080" allowAlpha />
      </form>
    );
    expect(new FormData(container.querySelector('form')!).get('accent')).toBe(
      '#ff000080'
    );
  });

  it('submits the gradient string verbatim when the value is a gradient', () => {
    const gradient = 'linear-gradient(90deg, #ff0000 0%, #ffffff 50%, #00ff00 100%)';
    const {container} = render(
      <form onSubmit={(e) => e.preventDefault()}>
        <ColorPicker name="accent" value={gradient} />
      </form>
    );
    expect(new FormData(container.querySelector('form')!).get('accent')).toBe(gradient);
  });

  it('renders no bridge input without name', () => {
    const {container} = render(<ColorPicker value="#ff0000" />);
    expect(container.querySelector("[data-slot='native-input']")).toBeNull();
    expect(screen.getByRole('button', {name: 'Pick color'})).not.toHaveAttribute('name');
  });
});

describe('ColorPicker gradient mode', () => {
  // What a solid #ff0000 opens into on the Gradient toggle.
  const DEFAULT_GRADIENT = 'linear-gradient(90deg, #ff0000 0%, #ffffff 100%)';
  const THREE_STOPS = 'linear-gradient(90deg, #ff0000 0%, #ffffff 50%, #0000ff 100%)';

  /** jsdom's style attribute serializer normalizes hex colors to rgb(). */
  const rgbGradient = (gradient: string) =>
    gradient.replace(/#([0-9a-f]{6})/gi, (_m, hex: string) => {
      const channel = (from: number, to: number) =>
        Number.parseInt(hex.slice(from, to), 16);
      return `rgb(${channel(0, 2)}, ${channel(2, 4)}, ${channel(4, 6)})`;
    });

  it('renders no mode toggle without the gradient prop', async () => {
    const user = userEvent.setup();
    render(<ColorPicker value="#ff0000" />);
    await openPanel(user);
    expect(screen.queryByRole('button', {name: 'Solid'})).toBeNull();
    expect(screen.queryByRole('button', {name: 'Gradient'})).toBeNull();
  });

  it('switching to gradient opens the current color into the default gradient', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker value="#ff0000" gradient onChange={onChange} />);
    await openPanel(user);
    const gradientBtn = screen.getByRole('button', {name: 'Gradient'});
    expect(gradientBtn).toHaveAttribute('aria-pressed', 'false');
    await user.click(gradientBtn);
    expect(onChange).toHaveBeenCalledWith(DEFAULT_GRADIENT);
    // Mode is value-derived: the toggle and the editor follow.
    expect(gradientBtn).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', {name: 'Solid'})).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByLabelText('Angle')).toHaveValue(90);
    // The trigger swatch paints the gradient itself (asserted on the
    // style attribute — jsdom's computed style drops gradient values).
    const fill = screen.getByRole('button', {name: 'Pick color'}).querySelector('span');
    expect(fill).toHaveAttribute('style', expect.stringContaining(rgbGradient(DEFAULT_GRADIENT)));
  });

  it('switching back to solid takes the first stop color — no mode memory', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker value={DEFAULT_GRADIENT} gradient onChange={onChange} />);
    await openPanel(user);
    expect(screen.getByRole('button', {name: 'Gradient'})).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', {name: 'Solid'}));
    expect(onChange).toHaveBeenCalledWith('#ff0000');
    expect(screen.getByRole('button', {name: 'Gradient'})).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByLabelText('Angle')).toBeNull();
  });

  it('renders gradient mode from a controlled gradient value', async () => {
    const user = userEvent.setup();
    render(
      <ColorPicker
        value="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        gradient
      />
    );
    await openPanel(user);
    expect(screen.getByRole('button', {name: 'Gradient'})).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Angle')).toHaveValue(135);
    expect(screen.getByLabelText('Stop position 1')).toHaveValue(0);
    expect(screen.getByLabelText('Stop position 2')).toHaveValue(100);
    // The text field edits the selected stop (the first by default).
    expect(screen.getByRole('textbox')).toHaveValue('#667eea');
  });

  it('falls back to solid mode for an unsupported gradient value', async () => {
    const user = userEvent.setup();
    render(<ColorPicker value="linear-gradient(red)" gradient />);
    await openPanel(user);
    expect(screen.getByRole('button', {name: 'Gradient'})).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('textbox')).toHaveValue('#000000');
  });

  it('edits the angle', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker value={DEFAULT_GRADIENT} gradient onChange={onChange} />);
    await openPanel(user);
    fireEvent.change(screen.getByLabelText('Angle'), {target: {value: '45'}});
    expect(onChange).toHaveBeenCalledWith(
      'linear-gradient(45deg, #ff0000 0%, #ffffff 100%)'
    );
  });

  it('edits a stop position', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker value={DEFAULT_GRADIENT} gradient onChange={onChange} />);
    await openPanel(user);
    fireEvent.change(screen.getByLabelText('Stop position 2'), {target: {value: '80'}});
    expect(onChange).toHaveBeenCalledWith(
      'linear-gradient(90deg, #ff0000 0%, #ffffff 80%)'
    );
  });

  it('edits the selected stop color through the text field', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker value={DEFAULT_GRADIENT} gradient onChange={onChange} />);
    await openPanel(user);
    // Stop 1 is selected by default — the field shows its color.
    expect(screen.getByRole('textbox')).toHaveValue('#ff0000');
    await user.click(screen.getByRole('button', {name: 'Stop color 2: #ffffff'}));
    expect(screen.getByRole('textbox')).toHaveValue('#ffffff');
    const input = screen.getByRole('textbox');
    fireEvent.change(input, {target: {value: '#00ff00'}});
    fireEvent.keyDown(input, {key: 'Enter'});
    expect(onChange).toHaveBeenCalledWith(
      'linear-gradient(90deg, #ff0000 0%, #00ff00 100%)'
    );
  });

  it('adds a stop at the widest gap midpoint and selects it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker value={DEFAULT_GRADIENT} gradient onChange={onChange} />);
    await openPanel(user);
    await user.click(screen.getByRole('button', {name: 'Add stop'}));
    // #ff0000 + #ffffff averaged channel-wise at the 50% midpoint.
    expect(onChange).toHaveBeenCalledWith(
      'linear-gradient(90deg, #ff0000 0%, #ff8080 50%, #ffffff 100%)'
    );
    expect(screen.getByLabelText('Stop position 2')).toHaveValue(50);
    // The new stop is selected — the field shows its mixed color.
    expect(screen.getByRole('textbox')).toHaveValue('#ff8080');
  });

  it('removes stops down to the two-stop floor', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker value={THREE_STOPS} gradient onChange={onChange} />);
    await openPanel(user);
    await user.click(screen.getByRole('button', {name: 'Remove stop 2'}));
    expect(onChange).toHaveBeenCalledWith(
      'linear-gradient(90deg, #ff0000 0%, #0000ff 100%)'
    );
    expect(screen.queryByLabelText('Stop position 3')).toBeNull();
    // At two stops the removers disable — a gradient needs two ends.
    expect(screen.getByRole('button', {name: 'Remove stop 1'})).toBeDisabled();
    expect(screen.getByRole('button', {name: 'Remove stop 2'})).toBeDisabled();
  });

  it('applies gradient presets as preview bars', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const SUNSET = 'linear-gradient(90deg, #ff9a9e 0%, #fad0c4 100%)';
    render(
      <ColorPicker
        value="#ff0000"
        gradient
        onChange={onChange}
        presets={[
          {label: 'Sunset', gradient: SUNSET},
          {gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'},
          {label: 'Broken', gradient: 'not-a-gradient'},
        ]}
      />
    );
    await openPanel(user);
    // Labeled entry shows the label; unlabeled falls back to the value.
    const sunset = screen.getByRole('button', {name: 'Sunset'});
    expect(sunset).toHaveAttribute('style', expect.stringContaining(rgbGradient(SUNSET)));
    expect(
      screen.getByRole('button', {name: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'})
    ).toBeInTheDocument();
    // Unparsable gradient presets are skipped like unparsable colors.
    expect(screen.queryByRole('button', {name: 'Broken'})).toBeNull();
    await user.click(sunset);
    expect(onChange).toHaveBeenCalledWith(SUNSET);
    expect(screen.getByRole('button', {name: 'Gradient'})).toHaveAttribute('aria-pressed', 'true');
  });

  it('applies a solid preset from gradient mode — the mode flips to solid', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ColorPicker value={DEFAULT_GRADIENT} gradient presets={['#00ff00']} onChange={onChange} />
    );
    await openPanel(user);
    await user.click(screen.getByLabelText('#00ff00'));
    expect(onChange).toHaveBeenCalledWith('#00ff00');
    expect(screen.getByRole('button', {name: 'Gradient'})).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders labeled solid groups alongside flat presets', async () => {
    const user = userEvent.setup();
    render(
      <ColorPicker
        value="#ff0000"
        presets={[{label: 'Brand', colors: ['#00ff00']}, '#0000ff']}
      />
    );
    const panel = await openPanel(user);
    // The flat list keeps its original "Presets" row; structured
    // entries render after it in their given order.
    expect(panelButtonLabels(panel)).toEqual(['#0000ff', '#00ff00']);
    expect(screen.getByText('Brand')).toBeInTheDocument();
    expect(screen.getByText('Presets')).toBeInTheDocument();
  });

  it('keeps gradient commits out of the recent-colors list', async () => {
    const user = userEvent.setup();
    render(<ColorPicker value="#ff0000" gradient recent />);
    await openPanel(user);
    await user.click(screen.getByRole('button', {name: 'Gradient'}));
    expect(screen.queryByText('Recent colors')).toBeNull();
    // Mode switches and stop edits commit gradients — never recorded.
    await user.click(screen.getByRole('button', {name: 'Solid'}));
    // The solid commit (mode switch back) is recorded.
    expect(screen.getByText('Recent colors')).toBeInTheDocument();
    expect(screen.getByLabelText('#ff0000')).toBeInTheDocument();
  });

  it('accepts a typed gradient string in the value field', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorPicker value="#ff0000" gradient onChange={onChange} />);
    await openPanel(user);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, {target: {value: 'linear-gradient(45deg, #000 0%, #fff 100%)'}});
    fireEvent.keyDown(input, {key: 'Enter'});
    expect(onChange).toHaveBeenCalledWith(
      'linear-gradient(45deg, #000000 0%, #ffffff 100%)'
    );
    expect(screen.getByRole('button', {name: 'Gradient'})).toHaveAttribute('aria-pressed', 'true');
  });

  it('has no axe violations (gradient mode open)', async () => {
    const {axe} = await import('jest-axe');
    const user = userEvent.setup();
    render(
      <ColorPicker
        value="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        gradient
        allowAlpha
        presets={[
          {label: 'Sunset', gradient: 'linear-gradient(90deg, #ff9a9e 0%, #fad0c4 100%)'},
          '#00ff00',
        ]}
        recent
        aria-label="Background color"
      />
    );
    await openPanel(user, 'Background color');
    const results = await axe(document.body, {rules: {region: {enabled: false}}});
    expect(results.violations).toEqual([]);
  });
});
