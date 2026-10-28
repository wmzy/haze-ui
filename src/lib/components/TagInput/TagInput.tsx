import type { ControlOrValue } from 'react-use-control';

import type { FieldBridgeProps } from './TagInputCore';

import { useControl } from 'react-use-control';

import { NativeHiddenFields } from '../../utils/native-form';

import TagInputCore from './TagInputCore';

type TagInputProps = {
  value?: ControlOrValue<string[]>;
  onChange?: (value: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  disabled?: boolean;
  className?: string;
  /**
   * Form field name: renders one hidden input per tag under the same
   * name (native repeated-field semantics) so `<form action={fn}>` /
   * `new FormData(form).getAll(name)` receive every tag — the inner
   * text input never carries it (partial drafts would leak). An empty
   * list submits nothing. react-f0rm `FormItem` usage never passes it,
   * so both worlds coexist.
   */
  name?: string;
} & FieldBridgeProps;

export default function TagInput({
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
}: TagInputProps) {
  const [tags, setTags] = useControl(valueControl, []);

  return (
    <>
      <TagInputCore
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

export type { TagInputProps };
