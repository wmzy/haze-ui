import { useState, useEffect, useRef } from 'react';
import { css } from '@linaria/core';

type StreamingTextProps = {
  text: string;
  speed?: number;
  onComplete?: () => void;
  showCursor?: boolean;
  className?: string;
};

const wrapper = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  line-height: var(--haze-leading-relaxed);
  color: var(--haze-color-text);
  white-space: pre-wrap;
`;

const cursor = css`
  display: inline-block;
  width: 0.5em;
  height: 1em;
  background: var(--haze-color-primary);
  margin-left: 1px;
  vertical-align: text-bottom;
  animation: blink 1s step-end infinite;

  @keyframes blink {
    50% { opacity: 0; }
  }
`;

export default function StreamingText({
  text,
  speed = 20,
  onComplete,
  showCursor = true,
  className,
}: StreamingTextProps) {
  // `displayed` is the single source of truth (always a prefix of `text`);
  // completion derives from it instead of a render-read ref.
  const [displayed, setDisplayed] = useState('');
  // Guards onComplete to fire exactly once per completed stream, even when
  // the effect re-runs from an unstable `onComplete` identity.
  const doneRef = useRef(false);

  // New text restarts the stream — adjust state during render (the
  // React-endorsed reset pattern) so no frame shows the stale text.
  const [prevText, setPrevText] = useState(text);
  if (text !== prevText) {
    setPrevText(text);
    setDisplayed('');
  }

  const isDone = displayed.length >= text.length;

  useEffect(() => {
    if (isDone) {
      if (!doneRef.current) {
        doneRef.current = true;
        onComplete?.();
      }
      return;
    }
    doneRef.current = false;
    const timer = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, speed);
    return () => clearTimeout(timer);
  }, [isDone, displayed, text, speed, onComplete]);

  return (
    <span x-class={[wrapper, className]}>
      {displayed}
      {showCursor && !isDone && <span x-class={[cursor]} />}
    </span>
  );
}

export type { StreamingTextProps };
