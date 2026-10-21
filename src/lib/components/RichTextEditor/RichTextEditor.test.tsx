import type { RichTextEditorHandle } from './RichTextEditor';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { useControl } from 'react-use-control';

import RichTextEditor from './RichTextEditor';

/**
 * jsdom ships no layout: ProseMirror's `scrollToSelection` (reached when
 * typing chains `scrollIntoView`) reads Range client rects that jsdom
 * never implements. An empty rect list + a zero rect make the scroll
 * computation a no-op instead of an uncaught TypeError mid-keystroke.
 */
beforeAll(() => {
  Range.prototype.getClientRects = () => [] as unknown as DOMRectList;
  Range.prototype.getBoundingClientRect = () => new DOMRect(0, 0, 0, 0);
  // Clicks inside the editor resolve their document position through
  // elementFromPoint; without layout the contenteditable itself is the
  // only honest answer.
  document.elementFromPoint = () => document.querySelector('.tiptap');
});

const getEditable = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('.tiptap')!;

describe('RichTextEditor', () => {
  it('types into the contenteditable and publishes HTML (uncontrolled)', async () => {
    const user = userEvent.setup();
    const { container } = render(<RichTextEditor name='bio' />);
    const editable = await screen.findByRole('textbox');
    expect(editable).toHaveAttribute('contenteditable', 'true');

    await user.click(editable);
    await user.type(editable, 'Hello');

    const hidden = document.querySelector<HTMLInputElement>(
      "input[type='hidden'][name='bio']"
    )!;
    await waitFor(() => expect(hidden.value).toBe('<p>Hello</p>'));
    expect(container.querySelector('p.is-editor-empty')).toBeNull();
  });

  it('typing updates the controlled value', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [value, , valueCtrl] = useControl<string>(undefined, '');
      return (
        <>
          <RichTextEditor value={valueCtrl} />
          <output data-testid='mirror'>{value}</output>
        </>
      );
    }
    render(<Harness />);
    const editable = await screen.findByRole('textbox');
    await user.click(editable);
    await user.type(editable, 'Hi');
    await waitFor(() =>
      expect(screen.getByTestId('mirror').textContent).toBe('<p>Hi</p>')
    );
  });

  it('reflects external controlled value changes in the editor', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [, setValue, valueCtrl] = useControl<string>(
        undefined,
        '<p>initial</p>'
      );
      return (
        <>
          <RichTextEditor value={valueCtrl} />
          <button onClick={() => setValue('<h2>Replaced</h2>')}>replace</button>
        </>
      );
    }
    const { container } = render(<Harness />);
    await screen.findByRole('textbox');
    await waitFor(() =>
      expect(getEditable(container).innerHTML).toContain('initial')
    );

    await user.click(screen.getByRole('button', { name: 'replace' }));
    await waitFor(() =>
      expect(getEditable(container).innerHTML).toContain('Replaced')
    );
    expect(getEditable(container).querySelector('h2')).not.toBeNull();
  });

  it('keeps the caret when the controlled value round-trips equal HTML', async () => {
    const user = userEvent.setup();
    const ref = createRef<RichTextEditorHandle>();
    function Harness() {
      const [, setValue, valueCtrl] = useControl<string>(undefined, '');
      return (
        <>
          <RichTextEditor ref={ref} value={valueCtrl} />
          <button onClick={() => setValue('')}>clear</button>
        </>
      );
    }
    render(<Harness />);
    const editable = await screen.findByRole('textbox');
    await user.click(editable);
    await user.type(editable, 'Hello');

    const editor = ref.current!.getEditor()!;
    await waitFor(() => expect(editor.getHTML()).toBe('<p>Hello</p>'));
    // The caret sits after the 5 typed chars — the equal-HTML echo of the
    // controlled round-trip must not rebuild the document.
    expect(editor.state.selection.from).toBe(6);

    // An external reset to empty still clears (differs from current HTML).
    await user.click(screen.getByRole('button', { name: 'clear' }));
    await waitFor(() => expect(editor.isEmpty).toBe(true));
  });

  it('toggles bold from the toolbar with aria-pressed state', async () => {
    const user = userEvent.setup();
    const { container } = render(<RichTextEditor />);
    const editable = await screen.findByRole('textbox');
    await user.click(editable);
    await user.type(editable, 'Hello');
    await user.keyboard('{Control>}a{/Control}');

    const bold = screen.getByRole('button', { name: 'Bold' });
    expect(bold).toHaveAttribute('aria-pressed', 'false');

    await user.click(bold);
    expect(getEditable(container).querySelector('strong')).not.toBeNull();
    expect(bold).toHaveAttribute('aria-pressed', 'true');

    await user.click(bold);
    expect(getEditable(container).querySelector('strong')).toBeNull();
    expect(bold).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows the placeholder on the empty document', async () => {
    const { container } = render(<RichTextEditor placeholder='Tell your story' />);
    await screen.findByRole('textbox');
    const p = container.querySelector<HTMLElement>('p.is-editor-empty');
    expect(p).not.toBeNull();
    expect(p).toHaveAttribute('data-placeholder', 'Tell your story');
  });

  it('blocks editing when editable is false', async () => {
    const user = userEvent.setup();
    const ref = createRef<RichTextEditorHandle>();
    render(<RichTextEditor editable={false} ref={ref} />);
    const editable = await screen.findByRole('textbox');
    expect(editable).toHaveAttribute('contenteditable', 'false');
    expect(ref.current!.getEditor()!.isEditable).toBe(false);

    await user.click(editable);
    await user.keyboard('nope');
    expect(ref.current!.getEditor()!.getHTML()).toBe('<p></p>');

    // Read-only toolbars go inert with the editor.
    expect(screen.getByRole('button', { name: 'Bold' })).toBeDisabled();
  });

  it('merges className and forwards native props to the root', async () => {
    render(<RichTextEditor className='custom' id='editor-root' data-testid='rte' />);
    const root = await screen.findByTestId('rte');
    expect(root).toHaveAttribute('id', 'editor-root');
    expect(root).toHaveClass('custom');
    expect(root).toHaveAttribute('data-slot', 'rich-text-editor');
    expect(root.querySelector('[data-slot="rich-text-toolbar"]')).not.toBeNull();
    expect(
      root.querySelector('[data-slot="rich-text-toolbar-button"]')
    ).not.toBeNull();
    expect(root.querySelector('[data-slot="rich-text-content"]')).not.toBeNull();
  });

  it('renders a custom toolbar slot and hides it with false', async () => {
    const first = render(
      <RichTextEditor toolbar={<button type='button'>custom-tool</button>} />
    );
    await screen.findByRole('textbox');
    expect(screen.getByRole('button', { name: 'custom-tool' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Bold' })).toBeNull();

    first.unmount();
    render(<RichTextEditor toolbar={false} />);
    await screen.findByRole('textbox');
    expect(screen.queryByRole('toolbar')).toBeNull();
  });

  it('labels the contenteditable textbox', async () => {
    render(<RichTextEditor aria-label='Biography' />);
    expect(
      await screen.findByRole('textbox', { name: 'Biography' })
    ).toBeInTheDocument();
  });

  it('recreates the editor when editorKey changes', async () => {
    const ref = createRef<RichTextEditorHandle>();
    const { rerender } = render(<RichTextEditor ref={ref} value='<p>one</p>' />);
    await screen.findByRole('textbox');
    const first = ref.current!.getEditor()!;
    expect(first.getHTML()).toBe('<p>one</p>');

    rerender(<RichTextEditor ref={ref} value='<p>one</p>' editorKey='fresh' />);
    await waitFor(() => expect(ref.current!.getEditor()).not.toBe(first));
    expect(ref.current!.getEditor()!.getHTML()).toBe('<p>one</p>');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <RichTextEditor
        value='<p>Hello <strong>world</strong>, <em>nice</em> to see you</p>'
        placeholder='Bio'
        name='bio'
      />
    );
    await screen.findByRole('textbox');
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
