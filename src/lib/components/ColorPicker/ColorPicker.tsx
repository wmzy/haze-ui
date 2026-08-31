import type { Control } from 'react-use-control';

import { useControl } from 'react-use-control';

import ColorPickerCore from './ColorPickerCore';

type ColorPickerProps = {
  value?: Control<string> | string;
  presets?: string[];
  onChange?: (color: string) => void;
  className?: string;
};

export default function ColorPicker({
  value: valueControl,
  presets,
  onChange,
  className,
}: ColorPickerProps) {
  const [value, setValue] = useControl(
    valueControl as Control<string>,
    '#000000'
  );

  return (
    <ColorPickerCore
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      presets={presets}
      className={className}
    />
  );
}

export type { ColorPickerProps };
