import type { Dispatch, SetStateAction } from 'react';

import { useState } from 'react';

/**
 * Panel search query of the searchable pickers (Select's floating
 * paths, TreeSelect, Cascader): internal panel UI state (never a
 * prop), reset on close so a stale filter never survives to the next
 * open — a closed panel would otherwise hide the very value the user
 * just picked. The reset adjusts during render (the React-endorsed
 * pattern) rather than in an effect, per the repo's
 * set-state-in-effect lint posture.
 *
 * Deliberately css-less and split off utils/picker-chips so the
 * chip-less Cascader family css does not inherit the chips skin.
 */
export function usePanelQuery(
  open: boolean
): [string, Dispatch<SetStateAction<string>>] {
  const [query, setQuery] = useState('');
  if (!open && query !== '') {
    setQuery('');
  }
  return [query, setQuery];
}
