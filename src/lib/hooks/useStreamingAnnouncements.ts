import { useEffect, useRef, useState } from 'react';

import { useStrings } from '../components/LocaleProvider/useStrings';

/**
 * Default live-region cadence: one announcement per ~1.2s of streaming.
 * Announcing per character (or per token) would restart the reader's
 * utterance on every tick — the throttle is the point, not an
 * optimization.
 */
const ANNOUNCE_INTERVAL_DEFAULT = 1200;

type UseStreamingAnnouncementsOptions = {
  /**
   * While `true` the stream is live: the start cue lands, snapshots are
   * throttled to `intervalMs`, and the ending edge announces the final
   * text once. Keep it `false` before and outside a stream.
   */
  active: boolean;
  /**
   * Latest text to announce — read lazily at each boundary (timer fire),
   * long after the render that armed it, so it must not close over
   * stale mirrors. Render-scope values and refs both work.
   */
  getText: () => string;
  /** Snapshot cadence in milliseconds (default 1200). */
  intervalMs?: number;
  /**
   * Changing this key restarts the announcement lifecycle mid-flight
   * (the start cue included): the region is blanked during the render
   * that observes the change. Omit for a region whose stream identity
   * never changes on the fly.
   */
  resetKey?: string;
};

/**
 * Screen-reader mirror for a streaming region (StreamingText and
 * ChatMessage's `streaming` mode): a plain text mutation carries no live
 * semantics, so the component renders a hidden `role='status'` region
 * and this hook drives its three utterances —
 *
 * 1. a "Generating" cue as the stream starts (a state write, not
 *    initial content: content present at mount is not a live-region
 *    change, so it would never be announced);
 * 2. a fresh snapshot of `getText()` at most once per `intervalMs`;
 * 3. the final text exactly once when a live stream ends — never for a
 *    region that never streamed (same reason as above).
 *
 * Exactly-once guards: the ending edge is guarded by a ref, and the
 * throttle's next timer is armed inside the callback (not by effect
 * re-runs), so the cadence survives React's same-value bail-out when
 * consecutive snapshots hold equal text.
 *
 * @returns the text the live region should currently carry.
 */
export function useStreamingAnnouncements({
  active,
  getText,
  intervalMs = ANNOUNCE_INTERVAL_DEFAULT,
  resetKey,
}: UseStreamingAnnouncementsOptions): string {
  const { generating: startCue } = useStrings('streamingText');
  const [announced, setAnnounced] = useState('');

  // A new resetKey restarts the lifecycle — adjust state during render
  // (the React-endorsed reset pattern) so no frame shows the previous
  // stream's announcement.
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setAnnounced('');
  }

  // Latest-value mirror of `getText` (assigned in an effect so no ref is
  // written during render; declared first so every effect below reads
  // the current render's closure, not the previous one's).
  const getTextRef = useRef(getText);
  useEffect(() => {
    getTextRef.current = getText;
  });

  // Start cue: when the stream starts — from silence (`announced ===
  // ''`) or over a previous stream's final text (an inactive→active
  // edge) — the cue is a state write the live region announces.
  const fresh = announced === '';
  const prevActiveRef = useRef(false);
  useEffect(() => {
    const started = active && !prevActiveRef.current;
    prevActiveRef.current = active;
    if (active && (started || fresh)) setAnnounced(startCue);
  }, [active, fresh, startCue]);

  // Throttled snapshots: re-armed inside the timer callback on purpose —
  // a snapshot whose text equals the previous one makes setState bail
  // without a re-render, so the loop must not depend on effect re-runs.
  // Cleanup cancels the pending snapshot when the stream ends/unmounts.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!active) return;
    const arm = () => {
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        arm();
        setAnnounced(getTextRef.current());
      }, intervalMs);
    };
    arm();
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [active, intervalMs]);

  // Ending edge: announce the final text exactly once, and only after a
  // live stream (the guard ref) — a region that never streamed stays
  // silent. Any pending snapshot is already cancelled by the throttle
  // effect's cleanup.
  const wasActiveRef = useRef(false);
  useEffect(() => {
    if (active) {
      wasActiveRef.current = true;
      return;
    }
    if (!wasActiveRef.current) return;
    wasActiveRef.current = false;
    setAnnounced(getTextRef.current());
  }, [active]);

  return announced;
}

export type { UseStreamingAnnouncementsOptions };
