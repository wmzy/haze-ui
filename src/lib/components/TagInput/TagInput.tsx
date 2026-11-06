import type { ControlOrValue } from 'react-use-control';

import type { FieldBridgeProps } from './TagInputCore';

import TagInputCore from './TagInputCore';
import TagInputShell from './tag-input-shell';

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

export default function TagInput(props: TagInputProps) {
  return <TagInputShell {...props} core={TagInputCore} />;
}

export type { TagInputProps };
