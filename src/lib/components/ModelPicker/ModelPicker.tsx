import type { ControlOrValue } from 'react-use-control';

import { useControl } from 'react-use-control';
import { css } from '@linaria/core';

import { PickerCaret, pickerNativeCaret, pickerNativeSelect } from '../../utils/picker-trigger';
import { useStrings } from '../LocaleProvider';

type ModelOption = {
  value: string;
  label: string;
  description?: string;
  contextLength?: string;
};

type ModelPickerProps = {
  value?: ControlOrValue<string>;
  onChange?: (value: string) => void;
  options: ModelOption[];
  disabled?: boolean;
  className?: string;
};

const wrapper = css`
  position: relative;
  font-family: var(--haze-font-sans);
`;

/** md metrics over the shared native-select skin
 * (utils/picker-trigger): the padding/font-size pair SelectCore's own
 * `sizes.md` carries. */
const select = css`
  padding: var(--haze-space-2) var(--haze-space-3);
  font-size: var(--haze-text-sm);
`;

export default function ModelPicker({
  value: valueControl,
  onChange,
  options,
  disabled,
  className,
}: ModelPickerProps) {
  const [value, setValue] = useControl(valueControl, '');
  const strings = useStrings('modelPicker');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(e.target.value);
    onChange?.(e.target.value);
  };

  return (
    <div data-slot='model-picker' x-class={[wrapper, className]}>
      <select data-slot='trigger' x-class={[pickerNativeSelect, select]} aria-label={strings.label} value={value} onChange={handleChange} disabled={disabled}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} data-slot='option'>
            {opt.label}{opt.contextLength ? ` (${opt.contextLength})` : ''}
          </option>
        ))}
      </select>
      <PickerCaret x-class={pickerNativeCaret} />
    </div>
  );
}

export type { ModelPickerProps, ModelOption };
