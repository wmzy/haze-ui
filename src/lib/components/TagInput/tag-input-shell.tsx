import type { ComponentType } from 'react';

import type { TagInputProps } from './TagInput';
import type { TagInputCoreProps } from './TagInputCore';

import { useControl } from 'react-use-control';

import { NativeHiddenFields } from '../../utils/native-form';

/** The Core a shell drives — TagInputCore (plain list) or
 * SortableTagInputCore (drag reordering); both expose the same public
 * field surface (the sortable one drops Core's internal injection
 * seams). */
type CoreComponent = ComponentType<
  Omit<TagInputCoreProps, 'renderTag' | 'wrapTagList'>
>;

/**
 * The shared sugar-shell body of TagInput and SortableTagInput — twin
 * wrappers that differ only in which Core they drive. The shell owns the
 * useControl seam (the single source of truth for the tag list), the
 * onChange double write (control update + public callback) and the
 * native-form name bridge, and forwards the field props to the Core.
 */
export default function TagInputShell({
  core: Core,
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
}: TagInputProps & { core: CoreComponent }) {
  const [tags, setTags] = useControl(valueControl, []);

  return (
    <>
      <Core
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
