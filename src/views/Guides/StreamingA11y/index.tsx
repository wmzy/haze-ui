import { useEffect, useRef, useState } from 'react';
import { css } from '@linaria/core';

import {
  Button,
  ChatMessage,
  MarkdownRenderer,
  StreamingText,
} from '@/lib';
import { page } from '@/views/ComponentDetail/styles';
import { GuideDocView, useGuideDoc } from '@/views/Guides/guide-content';

/*
 * Screen-reader support for streaming AI output. Prose, code samples
 * and the strategy table live in guide-content.tsx; this shell owns the
 * two live demos (StreamingText replay and markdown ChatMessage) and
 * injects them as slots. Demo copy arrives via doc.ui.
 */

const demoFrame = css`
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  padding: var(--haze-space-4);
  margin: var(--haze-space-4) 0 var(--haze-space-2);
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-3);
  font-family: var(--haze-font-sans);
  max-width: 560px;
`;

const demoBar = css`
  display: flex;
  gap: var(--haze-space-2);
  align-items: center;
`;

type DemoUi = {
  replayLabel: string;
  generateLabel: string;
  waitingHint: string;
  streamText: string;
  markdownSource: string;
};

/**
 * StreamingText demo: a replay button restarts the stream (a key bump
 * remounts the component, which resets both the visible text and the
 * announcement lifecycle).
 */
function StreamingDemo({ replayLabel, streamText }: { replayLabel: string; streamText: string }) {
  const [runId, setRunId] = useState(0);
  return (
    <div className={demoFrame}>
      <div className={demoBar}>
        <Button size='sm' variant='outline' onClick={() => setRunId((n) => n + 1)}>
          {replayLabel}
        </Button>
      </div>
      <StreamingText key={runId} text={streamText} speed={18} />
    </div>
  );
}

/**
 * ChatMessage streaming demo with markdown inside: the parent owns the
 * generation state, flips `streaming`, and lets ChatMessage handle
 * aria-busy plus the announcement lifecycle over whatever is rendered.
 */
function ChatStreamingDemo({
  generateLabel,
  waitingHint,
  markdownSource,
}: {
  generateLabel: string;
  waitingHint: string;
  markdownSource: string;
}) {
  const [streaming, setStreaming] = useState(false);
  const [source, setSource] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    },
    [],
  );

  const generate = () => {
    if (streaming) return;
    const words = markdownSource.split(/(\s+)/);
    let index = 0;
    setSource('');
    setStreaming(true);
    timerRef.current = setInterval(() => {
      index += 2;
      setSource(words.slice(0, index).join(''));
      if (index >= words.length) {
        if (timerRef.current !== null) clearInterval(timerRef.current);
        timerRef.current = null;
        setStreaming(false);
      }
    }, 90);
  };

  return (
    <div className={demoFrame}>
      <div className={demoBar}>
        <Button size='sm' variant='outline' onClick={generate} disabled={streaming}>
          {generateLabel}
        </Button>
      </div>
      <ChatMessage role="assistant" name="haze-bot" streaming={streaming}>
        {source ? <MarkdownRenderer content={source} /> : <em>{waitingHint}</em>}
      </ChatMessage>
    </div>
  );
}

export default function StreamingA11yGuide() {
  const doc = useGuideDoc('streamingA11y');

  const {
    replayLabel = 'Replay stream',
    generateLabel = 'Generate reply',
    waitingHint = 'waiting…',
    streamText = '',
    markdownSource = '',
  } = doc.ui ?? {};

  const demoUi: DemoUi = {
    replayLabel,
    generateLabel,
    waitingHint,
    streamText,
    markdownSource,
  };

  return (
    <div className={page}>
      <h1>{doc.title}</h1>
      <GuideDocView
        doc={doc}
        slots={{
          'streaming-demo': (
            <StreamingDemo replayLabel={demoUi.replayLabel} streamText={demoUi.streamText} />
          ),
          'chat-demo': (
            <ChatStreamingDemo
              generateLabel={demoUi.generateLabel}
              waitingHint={demoUi.waitingHint}
              markdownSource={demoUi.markdownSource}
            />
          ),
        }}
      />
    </div>
  );
}
