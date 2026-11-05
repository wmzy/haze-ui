import type { ControlOrValue } from 'react-use-control';
import type { UploadCoreProps } from './UploadCore';
import type { UploadValueItem } from './types';

import { useControl } from 'react-use-control';

import UploadCore from './UploadCore';

/**
 * Sugar over UploadCore: every prop (and its JSDoc) is
 * {@link UploadCoreProps} verbatim except the two re-declared here —
 * `value` becomes controllable (uncontrolled, accumulating internally
 * when omitted) and `onChange` reports freshly picked files only.
 */
type UploadProps = {
  /** Selected files — local `File` picks mixed freely with `UploadFile`
   * echo entries (files already on the server); uncontrolled
   * (accumulating internally) when omitted. */
  value?: ControlOrValue<UploadValueItem[]>;
  /** Fires with the freshly picked files only (always local `File`s)
   * — the accumulated list is the `value` channel (or internal state
   * when uncontrolled). Removals and `clear()` do not fire this (they
   * are not picks). */
  onChange?: (files: File[]) => void;
} & Omit<UploadCoreProps, 'value' | 'onChange'>;

export default function Upload({
  value: valueControl,
  onChange,
  ...rest
}: UploadProps) {
  const [files, setFiles] = useControl(valueControl, []);

  // value/onChange are destructured away, so rest is exactly the Core
  // remainder — spread last so the picked-diff wiring above wins.
  return (
    <UploadCore
      value={files}
      onChange={(next) => {
        // items new to the value are always freshly picked local Files
        // (echo entries only ever arrive through the value itself)
        const picked = next.filter((file): file is File => !files.includes(file));
        setFiles(next);
        if (picked.length > 0) onChange?.(picked);
      }}
      {...rest}
    />
  );
}

export type { UploadProps };
