import type { TagInputProps } from './TagInput';

import { useControl } from 'react-use-control';

import { NativeHiddenFields } from '../../utils/native-form';

import SortableTagInputCore from './SortableTagInputCore';

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
export default function SortableTagInput({
  value: valueControl,
  onChange,
  placeholder,
  maxTags,
  disabled,
  className,
  name,
  id,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
  ref,
}: SortableTagInputProps) {
  const [tags, setTags] = useControl(valueControl, []);

  return (
    <>
      <SortableTagInputCore
        ref={ref}
        value={tags}
        onChange={(next) => {
          setTags(next);
          onChange?.(next);
        }}
        placeholder={placeholder}
        maxTags={maxTags}
        disabled={disabled}
        className={className}
        id={id}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedby}
      />
      <NativeHiddenFields name={name} values={tags} />
    </>
  );
}

export type { SortableTagInputProps };
