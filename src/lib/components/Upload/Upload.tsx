import type { ReactNode, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';
import type {
  UploadClassNames,
  UploadFileStatus,
  UploadHandle,
  UploadListItemRender,
  UploadRequest,
  UploadValueItem,
} from './types';

import { useControl } from 'react-use-control';

import UploadCore from './UploadCore';

type UploadProps = {
  /** Selected files — local `File` picks mixed freely with `UploadFile`
   * echo entries (files already on the server); uncontrolled
   * (accumulating internally) when omitted. */
  value?: ControlOrValue<UploadValueItem[]>;
  accept?: string;
  /** Renders the drag-and-drop drop area (default) or a plain
   * click-only picker area — see `UploadCoreProps.droppable`. */
  droppable?: boolean;
  /** Gatekeeper for every picked or dropped file — see
   * `UploadCoreProps.beforeUpload`. */
  beforeUpload?: (file: File) => boolean | Promise<boolean>;
  /** Cap for the committed list — see `UploadCoreProps.maxCount`. */
  maxCount?: number;
  multiple?: boolean;
  /** Custom upload executor — see `UploadCoreProps.request`. */
  request?: UploadRequest;
  /** Upload endpoint for the built-in XHR executor — see
   * `UploadCoreProps.action`. */
  action?: string;
  /** HTTP method for `action` uploads (default `POST`). */
  method?: string;
  /** Extra request headers for `action` uploads. */
  headers?: Record<string, string>;
  /** Form field name carrying the file in `action` mode (default `file`). */
  name?: string;
  /** Extra form fields appended alongside the file in `action` mode. */
  data?: Record<string, string | Blob>;
  /** Picks only enter the list; uploads start via the `UploadHandle`
   * ref — see `UploadCoreProps.manual`. */
  manual?: boolean;
  /** Cap on simultaneously in-flight uploads (default `4`); excess
   * files queue in value order — see `UploadCoreProps.concurrency`. */
  concurrency?: number;
  /** Built-in file list with progress and per-state actions — see
   * `UploadCoreProps.showUploadList`. */
  showUploadList?: boolean | { itemRender?: UploadListItemRender };
  /** Rendering style of the built-in list (`text` rows, a `picture`
   * row with a 32px inline thumbnail, or a `picture-card` thumbnail
   * grid) — see `UploadCoreProps.listType`. */
  listType?: 'text' | 'picture' | 'picture-card';
  /** Click handler for `picture` / `picture-card` thumbnails (e.g. a
   * lightbox) — see `UploadCoreProps.onPreview`. */
  onPreview?: (file: UploadValueItem) => void;
  /** Overrides the built-in remove-button label — see
   * `UploadCoreProps.removeLabel`. */
  removeLabel?: string;
  /** Picks directories instead of files — see
   * `UploadCoreProps.directory`. */
  directory?: boolean;
  /** Status-machine snapshot callback — see
   * `UploadCoreProps.onStatusChange`. */
  onStatusChange?: (files: UploadFileStatus[]) => void;
  /** Fires with the freshly picked files only (always local `File`s)
   * — the accumulated list is the `value` channel (or internal state
   * when uncontrolled). Removals and `clear()` do not fire this (they
   * are not picks). */
  onChange?: (files: File[]) => void;
  /**
   * Semantic slot classes (AntD v6 `classNames` shape): declared once
   * here and applied to the drop zone plus the built-in list (see
   * {@link UploadClassNames}). Not passing it renders identical output.
   */
  classNames?: UploadClassNames;
  className?: string;
  children?: ReactNode;
  /**
   * The imperative `UploadHandle` (`upload`/`uploadAll`/`abort`/
   * `clear`) — a command object, not a DOM node. The family renders no
   * single root element (the drop zone and the list are siblings), so
   * there is no root container to forward a DOM ref to: style the
   * zone through `classNames.trigger`, or query the parts by their
   * `data-slot` attributes (`drop-zone`, `list`, `item`).
   */
  ref?: Ref<UploadHandle>;
};

export default function Upload({
  value: valueControl,
  accept,
  droppable,
  beforeUpload,
  maxCount,
  multiple = false,
  request,
  action,
  method,
  headers,
  name,
  data,
  manual,
  concurrency,
  showUploadList,
  listType,
  onPreview,
  removeLabel,
  directory,
  onStatusChange,
  onChange,
  classNames,
  className,
  children,
  ref,
}: UploadProps) {
  const [files, setFiles] = useControl(valueControl, []);

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
      accept={accept}
      droppable={droppable}
      beforeUpload={beforeUpload}
      maxCount={maxCount}
      multiple={multiple}
      request={request}
      action={action}
      method={method}
      headers={headers}
      name={name}
      data={data}
      manual={manual}
      concurrency={concurrency}
      showUploadList={showUploadList}
      listType={listType}
      onPreview={onPreview}
      removeLabel={removeLabel}
      directory={directory}
      onStatusChange={onStatusChange}
      classNames={classNames}
      className={className}
      ref={ref}
    >
      {children}
    </UploadCore>
  );
}

export type { UploadProps };
