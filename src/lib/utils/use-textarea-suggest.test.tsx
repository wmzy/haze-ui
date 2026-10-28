import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

import { useRef, useState } from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useTextareaSuggest } from './use-textarea-suggest';

/**
 * Minimal site wiring around the hook — the same shape PromptInput and
 * MentionsCore compose: a controlled textarea, panel-open state keyed on
 * the synced marker, and the shared keydown ahead of the site's own.
 */
function SuggestField({
  enabled = true,
  triggers = ['@'],
  optionCount = 3,
}: {
  enabled?: boolean;
  triggers?: string[];
  optionCount?: number;
}) {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [committed, setCommitted] = useState<number | null>(null);
  const [escaped, setEscaped] = useState(false);
  const [fellThrough, setFellThrough] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggest = useTextareaSuggest({
    enabled,
    triggers,
    textareaRef,
    value,
  });

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    const consumed = suggest.handleListKeyDown(e, {
      open,
      optionCount,
      onCommit: setCommitted,
      onEscape: () => setEscaped(true),
    });
    if (consumed) return;
    setFellThrough(e.key);
  };

  return (
    <div>
      <textarea
        ref={textareaRef}
        aria-label="field"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(suggest.syncFromCaret(e.target.value, e.target.selectionStart) !== null);
        }}
        onKeyDown={handleKeyDown}
      />
      <output data-testid="marker">
        {suggest.marker ? `${suggest.marker.trigger}${suggest.marker.query}` : 'none'}
      </output>
      <output data-testid="highlight">{suggest.highlightIndex}</output>
      <output data-testid="committed">{committed ?? 'none'}</output>
      <output data-testid="escaped">{String(escaped)}</output>
      <output data-testid="fell-through">{fellThrough || 'none'}</output>
      <button
        onClick={() =>
          suggest.stageCaretRestore(3)
        }
      >
        stage
      </button>
      <button onClick={() => setValue('committed insertion text')}>
        commit-value
      </button>
    </div>
  );
}

describe('useTextareaSuggest', () => {
  it('tracks the token at the caret, honoring the word-boundary rule', async () => {
    const user = userEvent.setup();
    render(<SuggestField />);
    const textarea = screen.getByRole('textbox', { name: 'field' });

    await user.type(textarea, 'mail a@b.co');
    expect(screen.getByTestId('marker')).toHaveTextContent('none');

    await user.type(textarea, ' hi @bo');
    expect(screen.getByTestId('marker')).toHaveTextContent('@bo');
  });

  it('never records a marker while completion is disabled', async () => {
    const user = userEvent.setup();
    render(<SuggestField enabled={false} />);
    await user.type(screen.getByRole('textbox', { name: 'field' }), 'hi @bo');
    expect(screen.getByTestId('marker')).toHaveTextContent('none');
  });

  it('cycles the highlight with arrows and clamps at both ends', async () => {
    const user = userEvent.setup();
    render(<SuggestField />);
    const textarea = screen.getByRole('textbox', { name: 'field' });
    expect(screen.getByTestId('highlight')).toHaveTextContent('-1');

    await user.type(textarea, 'hi @');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(screen.getByTestId('highlight')).toHaveTextContent('1');
    // Clamped at the last row…
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(screen.getByTestId('highlight')).toHaveTextContent('2');
    // …and at the first.
    await user.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}');
    expect(screen.getByTestId('highlight')).toHaveTextContent('0');
  });

  it('keeps arrow keys native while the panel is closed', async () => {
    const user = userEvent.setup();
    render(<SuggestField />);
    const textarea = screen.getByRole('textbox', { name: 'field' });
    await user.type(textarea, 'ab');
    await user.keyboard('{ArrowDown}');
    expect(screen.getByTestId('fell-through')).toHaveTextContent('ArrowDown');
    expect(screen.getByTestId('highlight')).toHaveTextContent('-1');
  });

  it('resets the highlight when the token query changes', async () => {
    const user = userEvent.setup();
    render(<SuggestField />);
    const textarea = screen.getByRole('textbox', { name: 'field' });
    await user.type(textarea, 'hi @bo');
    await user.keyboard('{ArrowDown}');
    expect(screen.getByTestId('highlight')).toHaveTextContent('0');
    await user.type(textarea, 'b');
    expect(screen.getByTestId('highlight')).toHaveTextContent('-1');
  });

  it('commits the highlighted row on Enter', async () => {
    const user = userEvent.setup();
    render(<SuggestField />);
    const textarea = screen.getByRole('textbox', { name: 'field' });
    await user.type(textarea, 'hi @');
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(screen.getByTestId('committed')).toHaveTextContent('1');
  });

  it('commits the first row on Enter without prior navigation', async () => {
    const user = userEvent.setup();
    render(<SuggestField />);
    const textarea = screen.getByRole('textbox', { name: 'field' });
    await user.type(textarea, 'hi @');
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('committed')).toHaveTextContent('0');
  });

  it('keeps Enter native when nothing is selectable', async () => {
    const user = userEvent.setup();
    render(<SuggestField optionCount={0} />);
    const textarea = screen.getByRole('textbox', { name: 'field' });
    await user.type(textarea, 'hi @');
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('committed')).toHaveTextContent('none');
    // Not prevented — the newline lands.
    expect(textarea).toHaveValue('hi @\n');
  });

  it('routes Escape to the site and consumes the event', async () => {
    const user = userEvent.setup();
    render(<SuggestField />);
    const textarea = screen.getByRole('textbox', { name: 'field' });
    await user.type(textarea, 'hi @');
    await user.keyboard('{Escape}');
    expect(screen.getByTestId('escaped')).toHaveTextContent('true');
    // The '@' keydown fell through before the panel opened; the Escape
    // itself was consumed and never reached the site handler.
    expect(screen.getByTestId('fell-through')).toHaveTextContent('@');
  });

  it('restores the staged caret once the value commits', async () => {
    const user = userEvent.setup();
    render(<SuggestField />);
    const textarea = screen.getByRole('textbox', { name: 'field' });
    await user.type(textarea, 'hi @bob ');
    // Insertion flow: stage the post-insert offset, then commit new text.
    await user.click(screen.getByRole('button', { name: 'stage' }));
    await user.click(screen.getByRole('button', { name: 'commit-value' }));
    expect(textarea).toHaveFocus();
    expect((textarea as HTMLTextAreaElement).selectionStart).toBe(3);
    expect((textarea as HTMLTextAreaElement).selectionEnd).toBe(3);
  });
});
