import type { KeyboardEvent } from 'react';

type TagRemoveButtonProps = {
  /** Accessible name — the localized "Remove {tag}" string. */
  removeLabel: string;
  /** Removes the tag this button sits on. */
  onRemove: () => void;
  /** Disabled with the whole field. */
  disabled?: boolean;
  /**
   * Surface chrome class(es) of the consuming family — the button is
   * wiring-only (CopyIconButton's contract). TagInput, the sortable
   * variant and PromptInput pass the chip skin (utils/tag-skin's
   * removeBtn); Tag and Chip pass their dismiss chrome (utils/
   * status-skin's dismissBtn plus their per-component delta). Every
   * class staying at the call site is what lets one button serve five
   * families without moving any css family across split-css groups.
   */
  className?: string | readonly (string | false | undefined)[];
};

/**
 * The per-tag remove button TagInputCore, the sortable variant,
 * PromptInput's tag chips, Tag and Chip render: the '×' glyph, the
 * `data-slot='remove-button'` hook, the accessible name and the
 * Backspace arm. Zero-css by contract — the chrome arrives through
 * `className` and this module imports nothing at runtime: no hooks, no
 * DOM access (RSC-safe by inspection). Tag and Chip are RSC-listed
 * consumers, so the module needs a scripts/rsc-safe.mjs entry
 * (utils/truncate.ts's precedent).
 */
export default function TagRemoveButton({
  removeLabel,
  onRemove,
  disabled,
  className,
}: TagRemoveButtonProps) {
  return (
    <button
      data-slot="remove-button"
      x-class={[className]}
      type="button"
      onClick={onRemove}
      onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
        // Backspace on a tag's remove button removes that tag too,
        // so consecutive Backspace presses walk through the tags
        // with focus following.
        if (e.key === 'Backspace') {
          e.preventDefault();
          onRemove();
        }
      }}
      aria-label={removeLabel}
      disabled={disabled}
    >
      ×
    </button>
  );
}

export type { TagRemoveButtonProps };
