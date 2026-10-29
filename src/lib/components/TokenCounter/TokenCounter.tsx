import { css } from '@linaria/core';

import { meterFill, meterTrack } from '../../utils/meter-skin';
import { statusSolidColors } from '../../utils/status-solid-skin';
import { useStrings } from '../LocaleProvider';

type TokenCounterProps = {
  used: number;
  max: number;
  label?: string;
  className?: string;
};

const wrapper = css`
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text-muted);
`;

/* The meter's geometry comes from utils/meter-skin (track pill +
   full-height fill); only the tone stays local — the track rides
   bg-muted and sits a step below the info row. The fill's width
   transition historically ran slow + a bare `ease`; it now follows
   the shared normal/haze-ease curve — an intentional unification. */
const trackTone = css`
  background: var(--haze-color-bg-muted);
  margin-top: var(--haze-space-1);
`;

const info = css`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

const count = css`
  font-variant-numeric: tabular-nums;
`;

export default function TokenCounter({ used, max, label, className }: TokenCounterProps) {
  const pct = max > 0 ? Math.min(100, (used / max) * 100) : 0;
  /* The fill tone axis is the shared solid status skin
     (utils/status-solid-skin) — primary/warning/danger are its
     literal arms, so no local color classes. */
  const fillClass = pct > 90 ? statusSolidColors.danger : pct > 70 ? statusSolidColors.warning : statusSolidColors.primary;
  const strings = useStrings('tokenCounter');

  return (
    <div data-slot='token-counter' x-class={[wrapper, className]}>
      <div x-class={[info]}>
        <span data-slot='label'>{label || strings.label}</span>
        <span data-slot='value' x-class={[count]}>{used.toLocaleString()} / {max.toLocaleString()}</span>
      </div>
      <div data-slot='track' x-class={[meterTrack, trackTone]}>
        <div data-slot='fill' x-class={[meterFill, fillClass]} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export type { TokenCounterProps };
