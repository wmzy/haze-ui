import { useState } from 'react';

import { FollowUpSuggestions } from '@/lib';

import PropsTable from '../PropsTable';

import A11yNote from '../A11yNote';

import { intro, section } from '../styles';

import { CssVarsSection } from './shared';

const initialSuggestions = [
  'Compare the two options in a table',
  'What are the caveats?',
  'Turn this into a checklist',
];

function FollowUpSuggestionsPlayground() {
  const [picked, setPicked] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);

  return (
    <div style={{ maxWidth: 480 }}>
      <p aria-live='polite'>
        {picked ? `Prompt sent: ${picked}` : 'No suggestion picked yet'}
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button type='button' onClick={() => setLoading((v) => !v)}>
          {loading ? 'Stop loading' : 'Simulate streaming'}
        </button>
        <button type='button' onClick={() => setDisabled((v) => !v)}>
          {disabled ? 'Enable chips' : 'Disable chips'}
        </button>
      </div>
      <FollowUpSuggestions
        suggestions={picked ? initialSuggestions.filter((s) => s !== picked) : initialSuggestions}
        onSelect={setPicked}
        loading={loading}
        disabled={disabled}
        aria-label='Follow-up suggestions'
      />
    </div>
  );
}

// ─── FollowUpSuggestions ───────────────────────────────────────
export default function FollowUpSuggestionsDemo() {
  return (
    <>
      <h1>FollowUpSuggestions</h1>
      <p className={intro}>
        Clickable follow-up suggestion chips shown under AI chat answers —
        wire <code>onSelect</code> to your prompt box to send the follow-up.
      </p>

      <div className={section}>
        <h2>Demo</h2>
        <FollowUpSuggestionsPlayground />
      </div>

      <div className={section}>
        <h2>FollowUpSuggestions Props</h2>
        <PropsTable of='FollowUpSuggestionsProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              Container is <code>role=&quot;list&quot;</code> with{' '}
              <code>role=&quot;listitem&quot;</code> wrappers; each chip is a
              native <code>button</code>, so Tab/Enter/Space work for free
            </li>
            <li>
              Chips read their full suggestion text as their accessible name
            </li>
            <li>
              <code>loading</code> skeletons are <code>aria-hidden</code> —
              they never enter the a11y tree; give the container an{' '}
              <code>aria-label</code> when it has no visible heading
            </li>
          </ul>
        </A11yNote>
      </div>

      <CssVarsSection component='follow-up-suggestions' />
    </>
  );
}
