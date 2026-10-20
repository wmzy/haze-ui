import type { MotionPreset } from '@/lib/tokens';

import { useState } from 'react';
import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

import { Button, Flex, Switch } from '@/lib';
import { Presence } from '@/lib/headless';
import { motionPresets } from '@/lib/tokens';
import { page } from '@/views/ComponentDetail/styles';
import { GuideDocView, useGuideDoc } from '@/views/Guides/guide-content';

/*
 * Motion guide: the data-state-driven enter/exit pattern. Prose, the
 * preset gallery table and code samples live in guide-content.tsx; this
 * shell owns the live preset playground (stateful demo).
 */

/* Fixed-height stage: the card mounts/unmounts inside it without the
 * controls below jumping around the layout shift. */
const demoStage = css`
  min-height: 148px;
  border: 1px dashed var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  padding: var(--haze-space-4);
  margin: var(--haze-space-4) 0 var(--haze-space-2);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const demoCard = css`
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg-subtle);
  padding: var(--haze-space-4) var(--haze-space-6);
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-1);
  align-items: center;
  font-family: var(--haze-font-sans);
  color: var(--haze-color-text);
  box-shadow: var(--haze-shadow-sm);
`;

const demoStatus = css`
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-secondary);
  font-family: var(--haze-font-mono);
`;

const PRESETS: readonly MotionPreset[] = [
  'fade',
  'fadeScale',
  'slideUp',
  'slideDown',
  'slideLeft',
  'slideRight',
];

/**
 * The pattern in miniature: one control drives both the Switch and
 * Presence (the ControlOrValue idiom), Presence injects data-state and
 * defers the unmount while the preset's exit keyframes play, and the
 * preset class itself is the only styling involved.
 */
function PresetPlaygroundDemo({ switchLabel }: { switchLabel: string }) {
  const [preset, setPreset] = useState<MotionPreset>('fadeScale');
  // One control, two consumers: the Switch writes it, Presence reads it.
  const [shown, , shownCtrl] = useControl(undefined, true);

  return (
    <div>
      <Flex gap='var(--haze-space-2)' wrap align='center'>
        {PRESETS.map((name) => (
          <Button
            key={name}
            size='sm'
            variant={preset === name ? 'solid' : 'ghost'}
            onClick={() => setPreset(name)}
          >
            {name}
          </Button>
        ))}
        <Switch checked={shownCtrl} aria-label={switchLabel} />
      </Flex>
      <div className={demoStage}>
        <Presence present={shown}>
          <div x-class={[demoCard, motionPresets[preset]]}>
            <strong>{preset}</strong>
            <span className={demoStatus}>
              data-state: {shown ? 'open' : 'closed'}
            </span>
          </div>
        </Presence>
      </div>
    </div>
  );
}

export default function MotionGuide() {
  const doc = useGuideDoc('motion');
  const { switchLabel = 'Toggle the animated card' } = doc.ui ?? {};

  return (
    <div className={page}>
      <h1>{doc.title}</h1>
      <GuideDocView
        doc={doc}
        slots={{
          'preset-playground': <PresetPlaygroundDemo switchLabel={switchLabel} />,
        }}
      />
    </div>
  );
}
