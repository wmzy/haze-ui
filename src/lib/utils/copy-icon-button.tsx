import { useClipboard } from '../hooks/useClipboard';

import { COPIED_FEEDBACK_MS, CopyFeedbackGlyph } from './copy-glyph';

/**
 * Wiring-only share for the bare copy affordance (JsonView's row button,
 * ChatMessage's hover-bar action): the useClipboard feedback window and
 * the quiet-button JSX (data-slot='copy-button' + swapped glyph). The
 * seat/tint chrome classes stay per-family — passed in as props — so no
 * css family moves across split-css groups; this module therefore emits
 * no css of its own. CopyButton (the full polymorphic abstract) keeps
 * its own wiring and is untouched.
 */
type CopyIconButtonProps = {
  /** Accessibility name, already locale-resolved by the caller. */
  label: string;
  /** Read at click time so live sources (refs, props) are current. */
  getValue: () => string;
  /** Seat chrome class(es) of the consuming family. */
  className?: string | readonly (string | false | undefined)[];
  /** Extra class applied while the copied feedback window is open. */
  copiedClassName?: string;
};

export function CopyIconButton({
  label,
  getValue,
  className,
  copiedClassName,
}: CopyIconButtonProps) {
  const { copied, copy } = useClipboard(COPIED_FEEDBACK_MS);

  return (
    <button
      type='button'
      data-slot='copy-button'
      x-class={[className, copied && copiedClassName]}
      aria-label={label}
      onClick={() => void copy(getValue())}
    >
      <CopyFeedbackGlyph copied={copied} />
    </button>
  );
}

export type { CopyIconButtonProps };
