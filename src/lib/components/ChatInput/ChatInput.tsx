import type { ControlOrValue } from 'react-use-control';

import { useCallback } from 'react';
import { useControl } from 'react-use-control';
import { css } from '@linaria/core';

import { useStrings } from '../LocaleProvider';
import { Button } from '../Button';
import { useAutosizeTextarea } from '../../hooks/useAutosizeTextarea';
import { focusWithinRing } from '../../utils/field-skin';

type ChatInputProps = {
  value?: ControlOrValue<string>;
  onSend?: (message: string) => void;
  /**
   * While `true` the send button becomes a stop control: it shows the
   * stop glyph with the `chat.stopGeneration` label, stays enabled
   * regardless of the draft, and activating it — by click or by Enter —
   * calls `onStop` instead of `onSend` (Enter never sends mid-generation;
   * Shift+Enter still inserts a newline).
   */
  generating?: boolean;
  /** Called when the user requests the running generation to stop. */
  onStop?: () => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
};

/** Composer chrome: keeps its radius-lg box (fieldChrome is radius-md),
 * so the surface stays local and only the transition remains here — the
 * wrapper focus arm is the shared focusWithinRing (utils/field-skin)
 * composed below; the textarea inside owns the focus, the wrapper paints
 * the ring. */
const wrapper = css`
  display: flex;
  align-items: flex-end;
  gap: var(--haze-space-2);
  padding: var(--haze-space-3);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-lg);
  background: var(--haze-color-bg);
  font-family: var(--haze-font-sans);
  transition: border-color var(--haze-duration-fast), box-shadow var(--haze-duration-fast);
`;

const textarea = css`
  flex: 1;
  resize: none;
  border: none;
  outline: none;
  background: none;
  font-size: var(--haze-text-sm);
  font-family: var(--haze-font-sans);
  color: var(--haze-color-text);
  line-height: var(--haze-leading-relaxed);
  min-height: 1.5rem;
  max-height: 10rem;
  padding: 0;
`;

/** Local icon-square delta over Button's solid square-md skin: the fixed
 * 2rem box keeps the ↑/stop glyph centered in the composer row. The rem
 * literal is deliberate — it scales with the user's font size and no
 * rem-valued size token exists (ChatMessage avatars use the same one). */
const sendBtn = css`
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
`;

/** Explicit width/height: a viewBox-only inline svg contributes zero
 * content size in flex containers and collapses to 0×0. */
const StopGlyph = () => (
  <svg
    width='12'
    height='12'
    viewBox='0 0 12 12'
    fill='currentColor'
    aria-hidden='true'
    focusable='false'
  >
    <rect x='2' y='2' width='8' height='8' rx='1.5' />
  </svg>
);

export default function ChatInput({
  value: valueControl,
  onSend,
  generating = false,
  onStop,
  placeholder,
  disabled,
  maxLength,
  className,
}: ChatInputProps) {
  const [value, setValue] = useControl(valueControl, '');
  const strings = useStrings('chatInput');
  const chatStrings = useStrings('chat');
  const placeholderLabel = placeholder ?? strings.placeholder;
  // Auto-grow with the typed content (no maxRows — the shipped cap is
  // the textarea class's CSS max-height, beyond which the box clips).
  const { ref: textareaRef, resize, reset } = useAutosizeTextarea();

  const handleSend = useCallback(() => {
    if (generating) {
      onStop?.();
      return;
    }
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend?.(trimmed);
    setValue('');
    // collapse back to the single starting row for the next draft
    reset();
  }, [generating, onStop, value, disabled, onSend, setValue, reset]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    resize();
  };

  return (
    <div data-slot='chat-input' x-class={[wrapper, focusWithinRing, className]}>
      <textarea
        ref={textareaRef}
        data-slot='input'
        x-class={[textarea]}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholderLabel}
        disabled={disabled}
        maxLength={maxLength}
        rows={1}
      />
      <Button
        data-slot={generating ? 'stop-button' : 'send-button'}
        variant='solid'
        size='md'
        square
        className={sendBtn}
        onClick={handleSend}
        disabled={disabled || (!generating && !value.trim())}
        aria-label={generating ? chatStrings.stopGeneration : strings.send}
      >
        {generating ? <StopGlyph /> : <>&uarr;</>}
      </Button>
    </div>
  );
}

export type { ChatInputProps };
