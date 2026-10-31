/**
 * Pure file formatting helpers shared by two families: FilePreview's
 * meta chips (size + extension badge) and Upload's list/limit messages
 * (size). Born in FilePreview's private file-preview-format, lifted to
 * utils when UploadCore became the second consumer — component
 * directories never import each other, shared code lives here. Plain
 * functions, no css (nothing to register in split-css sharedLayers).
 */

/**
 * Human-readable byte size: `B` below 1 KiB, then the largest fitting
 * binary unit (`KB`/`MB`/`GB`/`TB`) with 2 significant decimals
 * (`512 B`, `1.00 KB`, `1.50 MB`). Non-finite or negative input (and
 * `undefined`) yields an empty string so callers can skip the meta chip.
 */
export function formatFileSize(bytes?: number): string {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return '';
  if (bytes < 1024) return `${bytes} B`;

  const units = ['KB', 'MB', 'GB', 'TB'] as const;
  let value = bytes;
  let unitIndex = -1;
  do {
    value /= 1024;
    unitIndex += 1;
  } while (value >= 1024 && unitIndex < units.length - 1);

  const decimals = value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(decimals)} ${units[unitIndex]}`;
}

/**
 * Uppercase extension of a file name for the type badge (`report.pdf` →
 * `PDF`). Leading-dot files (` .vimrc`), extension-less names and a
 * trailing dot return an empty string (no badge).
 */
export function getFileExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  if (dot <= 0 || dot === name.length - 1) return '';
  return name.slice(dot + 1).toUpperCase();
}
