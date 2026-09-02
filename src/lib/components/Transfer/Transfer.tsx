import type { ControlOrValue } from 'react-use-control';

import type { TransferItem } from './TransferCore';

import { useControl } from 'react-use-control';

import TransferCore from './TransferCore';

type TransferProps = {
  dataSource: TransferItem[];
  targetKeys?: ControlOrValue<string[]>;
  onChange?: (targetKeys: string[], direction: 'left' | 'right', moveKeys: string[]) => void;
  className?: string;
};

export default function Transfer({
  dataSource,
  targetKeys: targetKeysControl,
  onChange,
  className,
}: TransferProps) {
  const [targetKeys, setTargetKeys] = useControl(targetKeysControl, []);

  return (
    <TransferCore
      dataSource={dataSource}
      value={targetKeys}
      onChange={(next, direction, moveKeys) => {
        setTargetKeys(next);
        onChange?.(next, direction, moveKeys);
      }}
      className={className}
    />
  );
}

export type { TransferProps, TransferItem };
