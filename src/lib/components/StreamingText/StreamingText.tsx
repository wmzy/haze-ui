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
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed('');
    doneRef.current = false;
  }, [text]);

  useEffect(() => {
    if (doneRef.current) return;
    if (indexRef.current >= text.length) {
      doneRef.current = true;
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));
    }, speed);

    return () => clearTimeout(timer);
  }, [displayed, text, speed, onComplete]);

  const isDone = indexRef.current >= text.length;

  return (
    <span x-class={[wrapper, className]}>
      {displayed}
      {showCursor && !isDone && <span x-class={[cursor]} />}
    </span>
  );
}

export type { StreamingTextProps };
