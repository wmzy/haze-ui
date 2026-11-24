import { useControl } from 'react-use-control';

import { InlineCompletion } from '@/lib/components/InlineCompletion';

import { intro } from '../styles';

import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  maxWidth420,
  PropsSection,
} from './shared';

// ─── InlineCompletion ─────────────────────────────────────────
const CANNED = [
  'The quick brown fox jumps over the lazy dog',
  'Design tokens keep every component on the same scale',
  'Press Tab to accept the suggestion',
];

/** Fake completion engine: the first canned line that continues the
 * current draft, offered as the remaining suffix. */
function suggestFor(value: string): string | undefined {
  if (value === '') return undefined;
  return CANNED.find(
    (line) => line.startsWith(value) && line !== value
  )?.slice(value.length);
}

function SingleLineDemo() {
  const [value, setValue, control] = useControl(undefined, '');
  return (
    <>
      <InlineCompletion
        value={control}
        suggestion={suggestFor(value)}
        aria-label='Single line completion'
        style={maxWidth420}
      />
      <p className={intro}>Accepted value: {value || '—'}</p>
      <button type='button' onClick={() => setValue('')}>
        Reset draft
      </button>
    </>
  );
}

function MultilineDemo() {
  const [value, , control] = useControl(undefined, '');
  return (
    <InlineCompletion
      multiline
      rows={4}
      value={control}
      suggestion={suggestFor(value)}
      aria-label='Multiline completion'
      style={maxWidth420}
    />
  );
}

export default function InlineCompletionDemo() {
  return (
    <DemoPage
      title='InlineCompletion'
      description={
        <>
          Ghost-text completion over a plain input or textarea: the remaining
          suggestion overlays the field, Tab accepts it into the value, Escape
          dismisses it.
        </>
      }
    >
      <DemoSection title='Single line'>
        <p className={intro}>
          Type one of the canned prefixes (try{' '}
          <code>{'The quick bro'}</code>), then press Tab.
        </p>
        <SingleLineDemo />
      </DemoSection>

      <DemoSection title='Multiline host'>
        <MultilineDemo />
      </DemoSection>

      <PropsSection of='InlineCompletionProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Ghost text is <code>aria-hidden</code>; the behavior is announced
            through an <code>aria-describedby</code> hint while a suggestion
            is active
          </li>
          <li>
            A consumer-provided <code>aria-describedby</code> is merged, not
            replaced
          </li>
          <li>
            Tab without an active suggestion keeps native focus behavior
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='inlinecompletion' />
    </DemoPage>
  );
}
