import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';
import type {
  UploadClassNames,
  UploadEntry,
  UploadFileStatus,
  UploadHandle,
  UploadListItemRender,
  UploadRequest,
  UploadValueItem,
} from './types';

import { css } from '@linaria/core';
import { useRef, useState, useCallback, useEffect, useImperativeHandle } from 'react';

import { useStrings } from '../LocaleProvider';
import { formatFileSize } from '../FilePreview/file-preview-format';

import UploadList from './UploadList';
import { createXhrRequest } from './xhr-upload';

type UploadCoreProps = {
  /** The selected files — the field value, emitted verbatim (as the
   * complete next list) by `onChange`. Local `File` picks mix freely
   * with `UploadFile` echo entries describing files already on the
   * server; echo entries only render (and stay removable), they never
   * enter the upload pipeline. */
  value: UploadValueItem[];
  /** Emits the next file list: a single pick replaces `value`, a
   * `multiple` pick appends to it. Removals from the built-in list
   * (and `clear()`) also flow through here — echo entries come back
   * as the very objects the consumer passed in. */
  onChange: (files: UploadValueItem[]) => void;
  /** Comma-separated accept tokens (`.txt`, `image/*`, `text/plain`) —
   * the same grammar the native picker uses. Dropped files that do not
   * match are discarded silently (the native dialog already enforces
   * this for click picks). */
  accept?: string;
  /** Gate for the drag-and-drop affordance. `true` (default) renders
   * the dashed drop area with a drag-over highlight and accepts dropped
   * files; `false` renders a plain click-only picker area. */
  droppable?: boolean;
  /** Paste-to-upload: the zone (focusable — `role="button"`,
   * `tabIndex={0}`) listens for paste events and runs clipboard files
   * through the exact drop pipeline — `accept` grammar,
   * `beforeUpload`, `maxSize`, `maxCount` — reporting new files the
   * same way drops do. Clipboard content without files passes through
   * untouched. Works in droppable and click-only modes alike. */
  paste?: boolean;
  /** Gatekeeper applied to every file — click picks and drops alike —
   * before it enters the value: return `false` (or a promise resolving
   * to `false`) to drop the file. Verdicts for one pick are awaited
   * together (`Promise.all`) and committed as a single `onChange` once
   * every verdict resolved; the UI is not blocked while waiting.
   * A refused file never enters the list, so it never uploads. */
  beforeUpload?: (file: File) => boolean | Promise<boolean>;
  /** Per-file size cap in bytes, applied after the `beforeUpload`
   * verdicts and before `maxCount`. An over-limit file still enters
   * the value — as an error row carrying a size message — but never
   * uploads: auto mode, `retry` and the `UploadHandle` all refuse it,
   * leaving remove as the only action. `maxCount` caps the whole
   * committed list, rejected rows included (pipeline order:
   * `accept → beforeUpload → maxSize → maxCount`). The cap gates the
   * intake paths only — a `File` arriving through `value` is the
   * consumer's call and uploads normally. A non-positive or
   * non-finite value disables the cap. */
  maxSize?: number;
  /** Cap for the committed list. Applied last: existing entries win,
   * then the freshly picked survivors; anything beyond the first
   * `maxCount` entries is discarded silently. */
  maxCount?: number;
  /** A `multiple` pick appends to `value`, a single pick replaces it. */
  multiple?: boolean;
  /**
   * Custom upload executor. When given, every file entering the list
   * (see `manual`) runs through it: call `options.onProgress` with a
   * 0–100 percent, honor `options.signal` for cancellation, resolve on
   * success and reject on failure. Takes precedence over `action`.
   * Neither `request` nor `action` → pure collection mode, exactly the
   * pre-executor behavior.
   */
  request?: UploadRequest;
  /**
   * Upload endpoint for the built-in XHR executor: the file is sent as
   * multipart FormData (field `name`, extra fields `data`) with `method`
   * and `headers`; progress is wired to `xhr.upload.onprogress` and
   * cancellation to `xhr.abort()`. Ignored when `request` is given.
   */
  action?: string;
  /** HTTP method for `action` uploads — defaults to `POST`. */
  method?: string;
  /** Extra request headers for `action` uploads. */
  headers?: Record<string, string>;
  /** Form field name carrying the file in `action` mode — defaults
   * to `file`. */
  name?: string;
  /** Extra form fields appended alongside the file in `action` mode. */
  data?: Record<string, string | Blob>;
  /**
   * `true` keeps picked files at `idle` — the upload only starts via
   * the `UploadHandle` ref (`upload()`/`uploadAll()`). Only meaningful
   * with `request` or `action`.
   */
  manual?: boolean;
  /**
   * Cap on simultaneously in-flight uploads (default `4`). Files
   * beyond the cap queue in value order and start as running uploads
   * finish, fail or are cancelled — auto mode, the `UploadHandle`
   * triggers and retries all funnel through the same queue. A
   * non-finite value (`Infinity`) uploads everything at once — the
   * pre-queue behavior.
   */
  concurrency?: number;
  /**
   * Renders the built-in file list below the zone (default `false`):
   * file name, live progress (reusing `Progress`), status icon and
   * per-state actions — cancel while uploading, retry + remove on
   * error, remove otherwise. Pass an `itemRender` to replace whole
   * rows. Without `request`/`action` the list still tracks picks as
   * `idle` rows with remove actions.
   */
  showUploadList?: boolean | { itemRender?: UploadListItemRender };
  /**
   * Rendering style of the built-in list (default `text`): `text`
   * rows; `picture` — a text row with a 32px inline thumbnail before
   * the name (a `url` image for `UploadFile` echoes, an object-URL
   * preview for image files, a type-icon fallback otherwise); or a
   * `picture-card` grid of square thumbnail cards with the upload
   * mask, danger border + retry on error, and corner remove button.
   */
  listType?: 'text' | 'picture' | 'picture-card';
  /**
   * Click handler for the thumbnails of `picture` / `picture-card`
   * lists — the natural spot to open a lightbox (wire it to
   * `Image`/`ImagePreview`). Receives the value item the thumbnail
   * describes. The remove/retry/cancel buttons sit outside the hit
   * area and keep working.
   */
  onPreview?: (file: UploadValueItem) => void;
  /**
   * Overrides the built-in remove-button label (list rows and
   * picture-card corners); defaults to the locale string.
   */
  removeLabel?: string;
  /**
   * Picks directories instead of files: forwards the non-standard
   * `webkitdirectory`/`directory` attributes to the hidden input, so
   * the native dialog enumerates every file inside the chosen folder
   * (combine with `multiple` so the whole tree stays in the list).
   */
  directory?: boolean;
  /**
   * Fires whenever the tracked entries change (added, removed, status
   * or percent) with the complete snapshot in value order. Only tracks
   * while `request`/`action` or `showUploadList` is in play. `UploadFile`
   * echoes report their terminal `status`/`percent` like any row.
   */
  onStatusChange?: (files: UploadFileStatus[]) => void;
  /**
   * Semantic slot classes (AntD v6 `classNames` shape): the `trigger`
   * slot lands on the drop zone, the rest hand down to the built-in
   * list (see {@link UploadClassNames}).
   */
  classNames?: UploadClassNames;
  className?: string;
  children?: ReactNode;
  /**
   * The imperative `UploadHandle` (`upload`/`uploadAll`/`abort`/
   * `clear`) — a command object, not a DOM node. The component renders
   * no single root element (the drop zone and the list are siblings),
   * so there is no root container to forward a DOM ref to: style the
   * zone through `classNames.trigger`, or query the parts by their
   * `data-slot` attributes (`drop-zone`, `list`, `item`).
   */
  ref?: Ref<UploadHandle>;
} & Omit<
  ComponentPropsWithoutRef<'div'>,
  | 'value'
  | 'onChange'
  | 'children'
  | 'onClick'
  | 'onDrop'
  | 'onDragOver'
  | 'onDragEnter'
  | 'onDragLeave'
  | 'onKeyDown'
  | 'onPaste'
  | 'role'
  | 'tabIndex'
>;

const zoneBase = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--haze-space-8) var(--haze-space-4);
  border: 2px dashed transparent;
  border-radius: var(--haze-radius-lg);
  color: var(--haze-color-text-muted);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  cursor: pointer;
  transition: border-color var(--haze-duration-fast), background var(--haze-duration-fast);
  text-align: center;
`;

const dropArea = css`
  border-color: var(--haze-color-border);
  background: var(--haze-color-bg-subtle);

  &:hover,
  &[data-dragover='true'] {
    border-color: var(--haze-color-primary);
    background: var(--haze-color-primary-subtle);
  }
`;

const clickArea = css`
  background: var(--haze-color-bg-subtle);

  &:hover {
    background: var(--haze-color-primary-subtle);
  }
`;

const iconStyle = css`
  margin-bottom: var(--haze-space-3);
  color: var(--haze-color-text-muted);
`;

const hiddenInput = css`
  display: none;
`;

/** Lowercases and folds `jpg` into `jpeg` — browsers (and testing
 * libraries) treat the two spellings as interchangeable when matching
 * `accept` tokens. */
function normalizeForAccept(nameOrType: string): string {
  return nameOrType.toLowerCase().replace(/([./])jpg\b/g, '$1jpeg');
}

/** Whether `file` passes an `accept` attribute value: comma-separated
 * extension tokens (`.txt`) and MIME types, with `type/*` wildcards.
 * Mirrors what the native file dialog enforces for click picks, so
 * drops get the same semantics. */
function matchesAccept(file: File, accept: string): boolean {
  const name = normalizeForAccept(file.name);
  const type = normalizeForAccept(file.type);
  return accept
    .toLowerCase()
    .split(',')
    .map((token) => normalizeForAccept(token.trim()))
    .filter((token) => token.length > 0)
    .some((token) =>
      token.startsWith('.')
        ? name.endsWith(token)
        : token.endsWith('/*')
          ? type.startsWith(token.slice(0, -1))
          : type === token
    );
}

function clampPercent(percent: number): number {
  return Math.max(0, Math.min(100, Math.round(percent)));
}

/** `maxSize` sanitation, mirroring `resolveConcurrency`: only positive
 * finite numbers cap anything; `0`, negatives, `Infinity` and `NaN`
 * mean "no cap". The prop's default (`undefined`) lands here as null.
 */
function resolveMaxSize(maxSize: number | undefined): number | null {
  return maxSize != null && Number.isFinite(maxSize) && maxSize > 0
    ? maxSize
    : null;
}

/** The intake-rejection message for an over-limit file — both sizes in
 * `FilePreview`'s human units (`2.50 MB exceeds the 1.00 MB limit`).
 * Rows carry it instead of the retryable "upload failed" convention. */
function sizeErrorMessage(file: File, maxSize: number): string {
  return `${formatFileSize(file.size)} exceeds the ${formatFileSize(maxSize)} limit`;
}

/** Queue depth cap for `concurrency`: positive finite numbers are
 * honored (fractional floors to whole slots); anything else —
 * `Infinity`, `NaN`, non-positive — means unlimited, the pre-queue
 * fire-everything behavior. The `4` default lands through the prop's
 * default value, never here. */
function resolveConcurrency(concurrency: number): number {
  return Number.isFinite(concurrency) && concurrency >= 1
    ? Math.floor(concurrency)
    : Infinity;
}

// Value items carry no serializable identity, so list keys come from
// this WeakMap — stable per object instance across renders/picks.
// `UploadFile` echoes prefer their explicit `uid`.
const itemUids = new WeakMap<object, string>();
const uidCounter = { n: 0 };
function uidFor(item: UploadValueItem): string {
  if (!(item instanceof File) && item.uid) return item.uid;
  const existing = itemUids.get(item);
  if (existing) return existing;
  uidCounter.n += 1;
  const uid = `haze-upload-file-${uidCounter.n}`;
  itemUids.set(item, uid);
  return uid;
}

export default function UploadCore({
  value,
  onChange,
  accept,
  droppable = true,
  paste = false,
  beforeUpload,
  maxCount,
  maxSize,
  multiple = false,
  request,
  action,
  method,
  headers,
  name,
  data,
  manual = false,
  concurrency = 4,
  showUploadList,
  listType,
  onPreview,
  removeLabel,
  directory,
  onStatusChange,
  classNames,
  className,
  children,
  ref,
  ...rest
}: UploadCoreProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // Transient drag-over highlight — hover-like UI state, never a
  // user-facing prop, so local state (not useControl) is correct here.
  const [dragOver, setDragOver] = useState(false);
  // Internal status machine: one entry per tracked file (value order).
  // Never a user-facing prop — the value channel stays `File[]`; the
  // machine is observed through `onStatusChange` / the built-in list.
  const [entries, setEntries] = useState<UploadEntry[]>([]);
  const strings = useStrings('upload');

  // The executor is armed only when the consumer opted in; without it
  // the component stays a pure collector (zero behavioral change).
  const executor: UploadRequest | undefined =
    request ??
    (action != null
      ? createXhrRequest({ action, method, headers, name, data })
      : undefined);
  const armed = executor != null;
  const listEnabled = showUploadList != null && showUploadList !== false;
  // Status is tracked while uploads can run, or while the list (with
  // its remove actions) is rendered.
  const tracking = armed || listEnabled;

  // Mirror the latest applied value so async beforeUpload verdicts
  // merge onto the freshest list instead of the one captured at pick
  // time (a parent may have committed another pick meanwhile).
  const latestValue = useRef(value);
  useEffect(() => {
    latestValue.current = value;
  });

  // Mirrors for the imperative handle and the async upload chain —
  // they run outside the render that produced the latest props.
  const entriesRef = useRef(entries);
  useEffect(() => {
    entriesRef.current = entries;
  });
  const latestExecutor = useRef(executor);
  useEffect(() => {
    latestExecutor.current = executor;
  });
  const latestOnChange = useRef(onChange);
  useEffect(() => {
    latestOnChange.current = onChange;
  });
  const latestOnStatusChange = useRef(onStatusChange);
  useEffect(() => {
    latestOnStatusChange.current = onStatusChange;
  });
  // The queue drains from long-lived closures (request settle
  // callbacks) — they must read the freshest cap, not the one captured
  // at enqueue time.
  const latestConcurrency = useRef(resolveConcurrency(concurrency));
  useEffect(() => {
    latestConcurrency.current = resolveConcurrency(concurrency);
  });

  // Files refused at intake for exceeding `maxSize` → their rejection
  // message. Every intake re-evaluates the whole batch (entries set or
  // deleted in `commit`), so the map is always the freshest verdict;
  // the entries sync renders these files as error rows and every
  // upload entry point refuses them.
  const sizeRejected = useRef(new Map<File, string>());

  // One AbortController per in-flight upload — also the synchronous
  // "already running" guard (state updates may not have flushed when
  // two triggers race in the same tick).
  const controllers = useRef(new Map<string, AbortController>());
  // The concurrency queue: uploads requested while all slots are busy
  // park here in value order (`pendingUids` is the dedupe guard — a
  // queued file must not re-enter the queue from a second trigger).
  const pendingFiles = useRef<File[]>([]);
  const pendingUids = useRef(new Set<string>());
  // Uids that already went through runUpload. Autostart only fires for
  // fresh entries — an aborted upload returns to idle WITHOUT being
  // restarted by the auto mode (restart would loop: abort → idle →
  // autostart → …). Retries go through the retry action or the handle.
  const attemptedUids = useRef(new Set<string>());
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    const inFlight = controllers.current;
    return () => {
      mountedRef.current = false;
      inFlight.forEach((controller) => controller.abort());
      inFlight.clear();
    };
  }, []);

  // Requests an upload for `file` — auto mode, the imperative handle
  // and retries all funnel through here. Beyond `concurrency`
  // in-flight uploads the request parks in the queue (value order) and
  // `drain` starts it as a slot frees up (success, failure, cancel).
  const runUpload = useCallback((file: File) => {
    if (!latestExecutor.current || !mountedRef.current) return;
    // Intake-rejected files (over `maxSize`) never upload through any
    // path: autostart sees no idle entry, and retry, `upload(file)` and
    // `uploadAll()` all stop here.
    if (sizeRejected.current.has(file)) return;
    const entry = entriesRef.current.find((e) => e.file === file);
    if (!entry || controllers.current.has(entry.uid)) return;
    if (pendingUids.current.has(entry.uid)) return;

    // Starts one file — the pre-queue machinery, unchanged: one
    // controller, the status commits, and a drain on settle.
    function startUpload(queued: File, queuedEntry: UploadEntry) {
      const exec = latestExecutor.current;
      if (!exec || !mountedRef.current) return;
      const { uid } = queuedEntry;
      const controller = new AbortController();
      controllers.current.set(uid, controller);
      setEntries((prev) =>
        prev.map((e) =>
          e.uid === uid ? { ...e, status: 'uploading', percent: 0 } : e
        )
      );
      exec(queued, {
        signal: controller.signal,
        onProgress: (percent) => {
          setEntries((prev) =>
            prev.map((e) =>
              e.uid === uid && e.status === 'uploading'
                ? { ...e, percent: clampPercent(percent) }
                : e
            )
          );
        },
      })
        .then(() => {
          setEntries((prev) =>
            prev.map((e) =>
              e.uid === uid && e.status === 'uploading'
                ? { ...e, status: 'success', percent: 100 }
                : e
            )
          );
        })
        .catch((error: unknown) => {
          setEntries((prev) =>
            prev.map((e) => {
              if (e.uid !== uid || e.status !== 'uploading') return e;
              const aborted =
                controller.signal.aborted ||
                (error instanceof DOMException && error.name === 'AbortError');
              // A cancelled upload is not a failure: the file drops back
              // to idle (it leaves the list entirely when the cancel was
              // a remove — the sync effect below already dropped it).
              return aborted
                ? { ...e, status: 'idle', percent: 0 }
                : { ...e, status: 'error' };
            })
          );
        })
        .finally(() => {
          controllers.current.delete(uid);
          // A slot freed up — bring the next queued file in.
          drain();
        });
    }

    // Pops queued files while in-flight count allows. Stale heads (the
    // file left the value, or is already running through another
    // path) drop out of the queue without starting.
    function drain() {
      if (!mountedRef.current || latestExecutor.current == null) {
        // Unmounted or disarmed: discard the queue — files keep their
        // current status; re-arming goes through the normal autostart.
        pendingFiles.current.length = 0;
        pendingUids.current.clear();
        return;
      }
      while (
        pendingFiles.current.length > 0 &&
        controllers.current.size < latestConcurrency.current
      ) {
        const queued = pendingFiles.current.shift()!;
        const queuedEntry = entriesRef.current.find((e) => e.file === queued);
        pendingUids.current.delete(
          queuedEntry ? queuedEntry.uid : uidFor(queued)
        );
        if (queuedEntry && !controllers.current.has(queuedEntry.uid)) {
          startUpload(queued, queuedEntry);
        }
      }
    }

    // Enqueue (the attempt mark keeps auto mode from double-queueing
    // the file while it waits) and immediately look for a free slot.
    attemptedUids.current.add(entry.uid);
    pendingUids.current.add(entry.uid);
    pendingFiles.current.push(file);
    drain();
  }, []);

  // Keep the tracked entries in lockstep with the value: files that
  // entered (picked, dropped, echoed) get fresh entries carrying their
  // status forward; files that left are dropped. Dormant in pure
  // collection mode.
  useEffect(() => {
    if (!tracking) {
      setEntries((prev) => (prev.length > 0 ? [] : prev));
      return;
    }
    // A file that left the value forgets its attempt mark — if it is
    // ever re-added (same File object), autostart picks it up again.
    // Size rejections follow the same lifecycle.
    const liveUids = new Set(value.map((item) => uidFor(item)));
    attemptedUids.current.forEach((uid) => {
      if (!liveUids.has(uid)) attemptedUids.current.delete(uid);
    });
    sizeRejected.current.forEach((_message, file) => {
      if (!liveUids.has(uidFor(file))) sizeRejected.current.delete(file);
    });
    setEntries((prev) => {
      if (prev.length === 0 && value.length === 0) return prev;
      const byItem = new Map(prev.map((e) => [e.file, e] as const));
      let changed = value.length !== prev.length;
      const next = value.map((item) => {
        const existing = byItem.get(item);
        if (existing) {
          byItem.delete(item);
          if (item instanceof File) return existing;
          // Echo entries follow their terminal description — a consumer
          // may flip `status`/`percent` between renders.
          const status = item.status ?? 'success';
          const percent = clampPercent(item.percent ?? 0);
          if (existing.status === status && existing.percent === percent) {
            return existing;
          }
          changed = true;
          return { ...existing, status, percent };
        }
        changed = true;
        if (!(item instanceof File)) {
          return {
            uid: uidFor(item),
            file: item,
            status: item.status ?? 'success',
            percent: clampPercent(item.percent ?? 0),
          };
        }
        // Fresh local pick: an intake size rejection lands straight at
        // `error` with its message (never idle, so autostart skips it);
        // everything else starts idle as before.
        const rejected = sizeRejected.current.get(item);
        return rejected != null
          ? {
              uid: uidFor(item),
              file: item,
              status: 'error' as const,
              percent: 0,
              error: rejected,
            }
          : { uid: uidFor(item), file: item, status: 'idle' as const, percent: 0 };
      });
      return changed || byItem.size > 0 ? next : prev;
    });
  }, [value, tracking]);

  // Auto mode: every entry that lands in the list is requested right
  // away (initial value included) — exactly once per stay in the list;
  // the concurrency queue decides when it actually starts.
  // Cancelled/failed files wait for an explicit retry. Manual mode
  // leaves them idle for the handle to trigger. Echo entries sit at a
  // terminal status, so they never take this path.
  useEffect(() => {
    if (!armed || manual) return;
    entries.forEach((e) => {
      if (e.file instanceof File && e.status === 'idle' && !attemptedUids.current.has(e.uid)) {
        runUpload(e.file);
      }
    });
  }, [entries, armed, manual, runUpload]);

  useEffect(() => {
    const emit = latestOnStatusChange.current;
    if (!emit || !tracking) return;
    emit(entries.map(({ file, status, percent, error }) => ({ file, status, percent, error })));
  }, [entries, tracking]);

  // Imperative surface: `ref.current?.upload()/uploadAll()/abort()/clear()`.
  // The methods only drive state, controllers and the value channel, so
  // every exit path stays single-sourced with the UI actions.
  useImperativeHandle(
    ref,
    () => ({
      upload: (file?: File) => {
        if (file !== undefined) {
          runUpload(file);
          return;
        }
        entriesRef.current.forEach((e) => {
          // echo entries never re-enter the pipeline — status is terminal
          if (
            e.file instanceof File &&
            (e.status === 'idle' || e.status === 'error')
          ) {
            runUpload(e.file);
          }
        });
      },
      uploadAll: () => {
        entriesRef.current.forEach((e) => {
          if (e.file instanceof File && e.status !== 'uploading') {
            runUpload(e.file);
          }
        });
      },
      abort: () => {
        // Queued requests die with the in-flight ones — abort stops
        // everything; the files stay listed at their current status
        // waiting for a retry or a handle trigger.
        pendingFiles.current.length = 0;
        pendingUids.current.clear();
        controllers.current.forEach((controller) => controller.abort());
      },
      clear: () => {
        pendingFiles.current.length = 0;
        pendingUids.current.clear();
        controllers.current.forEach((controller) => controller.abort());
        controllers.current.clear();
        if (mountedRef.current) latestOnChange.current([]);
      },
    }),
    [runUpload]
  );

  const abortEntry = useCallback((file: UploadValueItem) => {
    const entry = entriesRef.current.find((e) => e.file === file);
    if (!entry) return;
    if (pendingUids.current.has(entry.uid)) {
      // Still queued (never started): drop it from the queue — no
      // controller to abort, and a drain racing this removal must not
      // start the file the caller is taking out.
      const index = pendingFiles.current.indexOf(file as File);
      if (index !== -1) pendingFiles.current.splice(index, 1);
      pendingUids.current.delete(entry.uid);
      return;
    }
    controllers.current.get(entry.uid)?.abort();
  }, []);

  // Remove/cancel both abort an in-flight upload and drop the file
  // from the value; the sync effect then forgets its entry.
  const removeFile = useCallback(
    (file: UploadValueItem) => {
      abortEntry(file);
      if (!mountedRef.current) return;
      onChange(latestValue.current.filter((f) => f !== file));
    },
    [abortEntry, onChange]
  );

  const retryFile = useCallback(
    (file: UploadValueItem) => {
      if (!(file instanceof File)) return;
      if (entriesRef.current.find((e) => e.file === file)?.status !== 'error') return;
      runUpload(file);
    },
    [runUpload]
  );

  const commit = useCallback(
    (picked: File[]) => {
      if (picked.length === 0) return;

      const emit = (kept: File[]) => {
        if (kept.length === 0) return;
        // maxSize verdicts are re-evaluated for the whole batch on
        // every intake: over-limit files are marked (they stay in the
        // batch as error rows), anything at or under the cap — or with
        // no cap at all — forgets a stale rejection from an earlier
        // pick of the same File.
        const cap = resolveMaxSize(maxSize);
        if (cap != null) {
          kept.forEach((file) => {
            if (file.size > cap) {
              sizeRejected.current.set(file, sizeErrorMessage(file, cap));
            } else {
              sizeRejected.current.delete(file);
            }
          });
        } else {
          sizeRejected.current.clear();
        }
        const next = multiple ? [...latestValue.current, ...kept] : kept;
        // Order of operations: accept (applied by the caller for drops
        // and pastes, by the native dialog for picks) → beforeUpload →
        // maxSize (rejected rows stay, marked) → maxCount. maxCount
        // keeps existing entries first; excess fresh files — rejected
        // rows included — are dropped silently.
        onChange(maxCount == null ? next : next.slice(0, maxCount));
      };

      if (!beforeUpload) {
        emit(picked);
        return;
      }
      // Async gate: the UI keeps working while verdicts are pending;
      // the whole batch resolves into exactly one onChange. A rejected
      // gate aborts the pick (no onChange) — gate crashes are the
      // consumer's error surface, not this component's.
      Promise.all(picked.map((file) => Promise.resolve(beforeUpload(file))))
        .then((verdicts) => {
          emit(picked.filter((_, index) => verdicts[index]));
        })
        .catch(() => undefined);
    },
    [multiple, maxCount, maxSize, beforeUpload, onChange]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  // `webkitdirectory`/`directory` are non-standard (no React DOM
  // types); browsers key off attribute presence, so empty-string
  // values. Typed through a variable — JSX spread of a non-literal
  // skips excess-property checking.
  const directoryAttributes: { webkitdirectory?: string; directory?: string } =
    directory ? { webkitdirectory: '', directory: '' } : {};

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // role="button": Enter and Space activate; Space would also scroll.
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      commit(Array.from(e.target.files || []));
      e.target.value = '';
    },
    [commit]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      // Drop path: enforce the accept grammar ourselves (mismatches are
      // discarded silently) so drops share the picker's semantics.
      const dropped = Array.from(e.dataTransfer.files);
      commit(accept ? dropped.filter((file) => matchesAccept(file, accept)) : dropped);
    },
    [commit, accept]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const files = Array.from(e.clipboardData.files);
      // Clipboard without files (text, images as markup) passes through
      // untouched — only a real file payload is ours to intercept.
      if (files.length === 0) return;
      e.preventDefault();
      // Paste path: the same accept grammar and commit pipeline a drop
      // takes (beforeUpload, maxSize, maxCount all apply), so reporting
      // and list behavior follow the drop path exactly.
      commit(accept ? files.filter((file) => matchesAccept(file, accept)) : files);
    },
    [commit, accept]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Dragging onto a child element first fires dragleave here with the
    // child as relatedTarget — only clear the highlight when the drag
    // actually left the zone.
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    setDragOver(false);
  }, []);

  return (
    <>
      <div
        data-slot='drop-zone'
        /* before {...rest}: an explicit aria-label prop wins over the
           locale fallback so consumers can name the zone themselves */
        aria-label={strings.label}
        {...rest}
        x-class={[
          zoneBase,
          droppable ? dropArea : clickArea,
          classNames?.trigger,
          className,
        ]}
        data-dragover={droppable && dragOver ? 'true' : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDrop={droppable ? handleDrop : undefined}
        onDragOver={droppable ? handleDragOver : undefined}
        onDragEnter={droppable ? handleDragEnter : undefined}
        onDragLeave={droppable ? handleDragLeave : undefined}
        onPaste={paste ? handlePaste : undefined}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          x-class={[hiddenInput]}
          type="file"
          accept={accept}
          multiple={multiple}
          {...directoryAttributes}
          onChange={handleChange}
          // implementation detail of the dropzone (role="button"): hide it
          // from a11y tree and tab order; input.click() still opens the dialog
          hidden
        />
        {children || (
          <>
            <svg data-slot='icon' x-class={[iconStyle]} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <div data-slot='hint'>{droppable ? strings.hint : strings.clickHint}</div>
          </>
        )}
      </div>
      {listEnabled && entries.length > 0 && (
        <UploadList
          entries={entries}
          classNames={classNames}
          listType={listType}
          removeLabel={removeLabel}
          onPreview={onPreview}
          itemRender={
            typeof showUploadList === 'object' ? showUploadList.itemRender : undefined
          }
          onRemove={removeFile}
          onRetry={retryFile}
          onCancel={removeFile}
        />
      )}
    </>
  );
}

export type { UploadCoreProps };
