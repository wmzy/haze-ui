import type { KeyboardEvent } from 'react';

import { removeBtn } from '../../utils/tag-skin';

type TagRemoveButtonProps = {
  /** Accessible name — the localized "Remove {tag}" string. */
  removeLabel: string;
  /** Removes the tag this button sits on. */
  onRemove: () => void;
  /** Disabled with the whole field. */
  disabled?: boolean;
};

/** The per-tag remove button TagInputCore and the sortable variant
 * render — the shared chip skin (utils/tag-skin.ts) plus the Backspace
 * arm, with the '×' glyph PromptInput's tag chips already carry. */
export default function TagRemoveButton({
  removeLabel,
  onRemove,
  disabled,
}: TagRemoveButtonProps) {
  return (
    <button
      data-slot="remove-button"
      x-class={[removeBtn]}
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
