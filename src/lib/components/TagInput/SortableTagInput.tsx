import type { TagInputProps } from './TagInput';

import SortableTagInputCore from './SortableTagInputCore';
import TagInputShell from './tag-input-shell';

/** The wrappers differ only in which Core they drive (drag reordering
 * vs the plain list); the public surface — value/onChange, field props,
 * the native-form `name` bridge — is identical, so the props type is
 * shared rather than duplicated. */
type SortableTagInputProps = TagInputProps;

/**
 * Controllable-state sugar over `SortableTagInputCore`: drag-and-drop tag
 * reordering built on the @dnd-kit dependency (the plain `TagInput` never
 * touches it). Reorders leave through
 * `onChange` with the new array — the same single exit as add/remove.
 * Keyboard: focus a tag's label, Space lifts, arrows move, Space drops,
 * Escape cancels.
 */
export default function SortableTagInput(props: SortableTagInputProps) {
  return <TagInputShell {...props} core={SortableTagInputCore} />;
}

export type { SortableTagInputProps };
