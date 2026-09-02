import type { ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useControl } from 'react-use-control';

import UploadCore from './UploadCore';

type UploadProps = {
  /** Selected files; uncontrolled (accumulating internally) when omitted. */
  value?: ControlOrValue<File[]>;
  accept?: string;
  multiple?: boolean;
  /** Fires with the freshly picked files only — the accumulated list is
   * the `value` channel (or internal state when uncontrolled). */
  onChange?: (files: File[]) => void;
  className?: string;
  children?: ReactNode;
};

export default function Upload({
  value: valueControl,
  accept,
  multiple = false,
  onChange,
  className,
  children,
}: UploadProps) {
  const [files, setFiles] = useControl(valueControl, []);

  return (
    <UploadCore
      value={files}
      onChange={(next) => {
        const picked = next.filter((file) => !files.includes(file));
        setFiles(next);
        onChange?.(picked);
      }}
      accept={accept}
      multiple={multiple}
      className={className}
    >
      {children}
    </UploadCore>
  );
}

export type { UploadProps };
