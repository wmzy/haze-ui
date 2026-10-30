import type {
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
  Ref,
} from 'react';

import { css } from '@linaria/core';
import { useCallback, useRef } from 'react';

import { getDirection, inlineAxisKeys } from '../../utils/direction';
import { focusRingVisible } from '../../utils/focus-ring';
import { mergeRefs } from '../../utils/refs';

import { sizes } from './segmented-styles';

type SegmentedOption =
  | string
  | { value: string; label: ReactNode; disabled?: boolean };

type SegmentedCoreProps = {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /**
   * Forwarded to the group's focus target — the selected option's
   * `<button>` (falling back to the first enabled option).
   */
  ref?: Ref<HTMLButtonElement>;
};

const container = css`
  display: inline-flex;
  background: var(--haze-color-bg-muted);
  border-radius: var(--haze-radius-md);
  /* 2px sits below the scale's first step (4px) — the hairline inset
     between the track and its chips; literal on purpose. */
  padding: 2px;
  gap: 2px;
  font-family: var(--haze-font-sans);
  overflow-x: auto;
`;

const btn = css`
  border: none;
  border-radius: var(--haze-radius-sm);
  background: transparent;
  color: var(--haze-color-text-secondary);
  cursor: pointer;
  font-family: var(--haze-font-sans);
  font-weight: var(--haze-weight-medium);
  /* WCAG 2.5.8 target-size floor: sm padding (0 vertical) would let the
     text box shrink under 24px. */
  min-height: var(--haze-space-6);
  transition: background var(--haze-duration-fast), color var(--haze-duration-fast);
  white-space: nowrap;

  &:hover:not(:disabled) {
    color: var(--haze-color-text);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Keyboard ring: utils/focus-ring's focusRingVisible, composed on
     the segment buttons below — the local copy had drifted (a 2px
     ring against the shared 3px) while duplicating the Highlight
     arm; the family-specific forced-colors offsets stay local. */

  /* Forced-colors: unselected segments are transparent no-border
     buttons — the UA gives them nothing to draw. An inset 1px
     CanvasText outline adds the visible boundary without shifting
     layout (borders would reflow the flex row); the keyboard focus
     Highlight ring from the composed focusRingVisible insets its
     offset here so the ring stays inside the chip. */
  @media (forced-colors: active) {
    outline: 1px solid CanvasText;
    outline-offset: -1px;

    &:focus-visible {
      outline-offset: -2px;
    }

    &:disabled {
      opacity: 1;
      color: GrayText;
      outline-color: GrayText;
    }
  }
`;

const activeBtn = css`
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  box-shadow: var(--haze-shadow-sm);

  /* Forced-colors: the white-on-muted selection (background +
     shadow) flattens to Canvas with the shadow dropped — the selected
     segment would vanish. Selection renders as the Windows-native
     Highlight chip instead; the unselected inset CanvasText outline
     from the btn class keeps the chip's neighbors bounded. */
  @media (forced-colors: active) {
    background: Highlight;
    color: HighlightText;
  }
`;

function normalize(option: SegmentedOption) {
  if (typeof option === 'string')
    return { value: option, label: option, disabled: false };
  return option;
}

/**
 * Keyboard model: roving tabindex + select-on-move arrows (RTL-aware
 * via `inlineAxisKeys`, key set aligned with TabList: arrows + Home/
 * End). `role` deliberately stays `group` — the exhaustive ARIA shape
 * for a single-select segmented control is `radiogroup` + `radio`, but
 * swapping it now would break the published aria contract (consumer
 * role queries, axe baselines) for what is a keyboard-only enhancement.
 * The roving stop plus arrow selection delivers the expected keyboard
 * behavior without changing what assistive tech announces.
 */
export default function SegmentedCore({
  options,
  value,
  onChange,
  size = 'md',
  className,
  ref,
}: SegmentedCoreProps) {
  const groupRef = useRef<HTMLDivElement | null>(null);

  // The consumer's ref rides the group's tab stop — the selected
  // option's button, falling back to the first enabled one when
  // nothing usable is selected; as the selection moves, the ref
  // re-attaches to the new stop.
  const attachStop = useCallback(
    (node: HTMLButtonElement | null) => mergeRefs(ref)(node),
    [ref]
  );

  // Roving tab stop: the selected option, unless it is disabled (a
  // disabled button cannot hold the group's single stop) — then the
  // first enabled option, else degenerate index 0.
  const selectedIndex = options.findIndex(
    (opt) => normalize(opt).value === value
  );
  const stopIndex =
    selectedIndex >= 0 && !normalize(options[selectedIndex]!).disabled
      ? selectedIndex
      : Math.max(0, options.findIndex((opt) => !normalize(opt).disabled));

  // Select-on-move, the single-select sibling of TabList's strip
  // keyboard model (menuKeyboard's moveFocusInAxis is pure focus
  // movement — a different contract from arrows that must select).
  // Written inline for the same reason TabList does not share one.
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const stops = Array.from(
      groupRef.current?.querySelectorAll<HTMLButtonElement>(
        "[data-slot='segment']"
      ) ?? []
    );
    if (stops.length === 0) return;
    const current = stops.findIndex((stop) =>
      stop.contains(document.activeElement)
    );

    // Step from `from` in `step` direction, wrapping, skipping
    // disabled stops; land on the first enabled one and select it.
    const move = (from: number, step: 1 | -1) => {
      const len = stops.length;
      for (let offset = 1; offset <= len; offset += 1) {
        const index = (from + step * offset + len * 2) % len;
        if (stops[index]!.disabled) continue;
        stops[index]!.focus();
        onChange(normalize(options[index]!).value);
        return;
      }
    };

    const { next: nextKey, prev: prevKey } = inlineAxisKeys(
      'horizontal',
      getDirection(groupRef.current)
    );

    const anchor = current < 0 ? stopIndex : current;
    switch (event.key) {
      case nextKey:
        event.preventDefault();
        move(anchor, 1);
        return;
      case prevKey:
        event.preventDefault();
        move(anchor, -1);
        return;
      case 'Home':
        event.preventDefault();
        move(-1, 1);
        return;
      case 'End':
        event.preventDefault();
        move(stops.length, -1);
        return;
    }
  };

  return (
    <div
      ref={groupRef}
      data-slot='segmented'
      x-class={[container, sizes[size], className]}
      role="group"
      onKeyDown={handleKeyDown}
    >
      {options.map((opt, index) => {
        const { value: val, label, disabled } = normalize(opt);
        return (
          <button
            key={val}
            data-slot='segment'
            ref={index === stopIndex ? attachStop : undefined}
            type="button"
            tabIndex={index === stopIndex ? 0 : -1}
            x-class={[btn, focusRingVisible, value === val && activeBtn]}
            disabled={disabled}
            onClick={() => onChange(val)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export type { SegmentedCoreProps, SegmentedOption };
