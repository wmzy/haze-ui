import type { ControlOrValue } from 'react-use-control';

import type { FieldBridgeProps } from './TagInputCore';

import { useControl } from 'react-use-control';

import SortableTagInputCore from './SortableTagInputCore';

type SortableTagInputProps = {
  value?: ControlOrValue<string[]>;
  onChange?: (value: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  disabled?: boolean;
  className?: string;
} & FieldBridgeProps;

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
  id,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedby,
  ref,
}: SortableTagInputProps) {
  const [tags, setTags] = useControl(valueControl, []);

  return (
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
  );
}

export type { SortableTagInputProps };
