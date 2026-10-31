import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { css } from '@linaria/core';
import { useEffect } from 'react';
import { useControl } from 'react-use-control';

import { useStrings } from '../LocaleProvider';
import { formatString } from '../LocaleProvider/locale';
import { useConfigDefaults } from '../ConfigProvider/useConfigDefaults';
import { focusRingVisible } from '../../utils/focus-ring';
import { quietSquareButton } from '../../utils/quiet-button-skin';

import { sizes } from './pagination-styles';

type PaginationProps = {
  page?: ControlOrValue<number>;
  total: number;
  pageSize?: ControlOrValue<number>;
  /** Page sizes offered by the size changer (`showSizeChanger`). */
  pageSizeOptions?: number[];
  /** Renders a page-size select; changing it resets to page 1. */
  showSizeChanger?: boolean;
  /** Renders a "Go to [input]" control that jumps on Enter (clamped). */
  showQuickJumper?: boolean;
  /** Renders a summary of `total` and the current page's item range. */
  showTotal?: (total: number, range: [number, number]) => ReactNode;
  /** Minimal mode: a page input plus prev/next instead of the page list. */
  simple?: boolean;
  /** Turns the ellipsis markers into buttons jumping ±5 pages (clamped). */
  ellipsisJump?: boolean;
  /** Value callback fired for every page jump and page-size change. */
  onPageChange?: (page: number, pageSize: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
} & Omit<ComponentPropsWithoutRef<'nav'>, 'onChange'>;

const nav = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-1);
  font-family: var(--haze-font-sans);
`;

/* Page-button chrome lives in the shared quiet square skin
 * (utils/quiet-button-skin quietSquareButton); the deltas kept here
 * are the horizontal padding multi-digit page numbers need past the
 * shared 36px minimum and the hover transition, plus the forced-colors
 * arms below. */
const btnDelta = css`
  padding: 0 var(--haze-space-2);
  transition: background var(--haze-duration-fast), border-color var(--haze-duration-fast);

  /* Forced-colors deltas over focusRingVisible: the page button's
     Highlight ring is inset; disabled pages drop the dim and render
     GrayText. The disabled arm compounds &[data-slot] (every seat
     carries one) because it overrides the shared disabled mute at the
     same specificity, and dev-server injection and the dist split
     disagree on rule order (Banner closeBtnSize precedent); the
     focus-visible offset is additive over focusRingVisible, which
     declares no outline-offset, so it needs no arming. */
  @media (forced-colors: active) {
    &:focus-visible {
      outline-offset: -2px;
    }

    &[data-slot]:disabled {
      opacity: 1;
      color: GrayText;
    }
  }
`;

/* The current page's primary chip, composed over quietSquareButton.
 * Every arm compounds &[aria-current='page'] — the attribute is set
 * exactly when this class is applied — because the chip must beat the
 * shared surface's same-specificity base and hover arms, and cascade
 * order differs between dev injection and the dist split
 * (quiet-button-skin discipline, Banner's closeBtnSize precedent). */
const activeBtn = css`
  &[aria-current='page'] {
    background: var(--haze-color-primary);
    border-color: var(--haze-color-primary);
    color: var(--haze-color-text-inverse);

    &:hover:not(:disabled) {
      background: var(--haze-color-primary-hover);
      border-color: var(--haze-color-primary-hover);
    }

    /* Forced-colors: the primary fill flattens onto Canvas — the
       current page would be indistinguishable from its siblings. The
       Windows-native Highlight chip renders instead (held stable on
       hover, which the UA would flatten back to Canvas). */
    @media (forced-colors: active) {
      background: Highlight;
      border-color: Highlight;
      color: HighlightText;

      &:hover:not(:disabled) {
        background: Highlight;
        border-color: Highlight;
      }
    }
  }
`;

const ellipsis = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: calc(var(--haze-space-8) + var(--haze-space-1));
  height: calc(var(--haze-space-8) + var(--haze-space-1));
  color: var(--haze-color-text-muted);
  font-size: var(--haze-text-sm);
`;

/* Button reset layered on `ellipsis` so the jump variant keeps the
   marker's metrics without UA chrome (border, caption font, padding). */
const ellipsisJumpBtn = css`
  padding: 0;
  border: none;
  background: transparent;
  font-family: var(--haze-font-sans);
  cursor: pointer;

  &:hover:not(:disabled) {
    color: var(--haze-color-primary);
  }

  /* Forced-colors deltas over focusRingVisible: a transparent no-border
     button gets nothing from the UA — an inset CanvasText outline adds
     the boundary without shifting layout, upgrading to the inset
     Highlight ring on keyboard focus. */
  @media (forced-colors: active) {
    outline: 1px solid CanvasText;
    outline-offset: -1px;

    &:focus-visible {
      outline-offset: -2px;
    }
  }
`;

/* Shared secondary copy: showTotal summary, jumper affixes, simple-mode
   "/ N" total. */
const auxText = css`
  color: var(--haze-color-text-secondary);
  font-size: var(--haze-text-sm);
`;

/* Shared field skin for the size changer and the page inputs —
   metrics, border, surface and typography they hold in common; the
   focus treatment rides along via `focusRingVisible`, and each delta
   keeps only its padding/width/cursor/text-align specifics. */
const pgFieldBase = css`
  height: calc(var(--haze-space-8) + var(--haze-space-1));
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-size: var(--haze-text-sm);
  font-family: var(--haze-font-sans);
`;

const control = css`
  padding: 0 var(--haze-space-2);
  cursor: pointer;
`;

const jumperInput = css`
  width: var(--haze-space-12);
  padding: 0 var(--haze-space-1);
  text-align: center;
  cursor: text;
`;

/** Pages a jump-marker click moves (antd precedent). */
const ELLIPSIS_JUMP = 5;

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

export default function Pagination({
  page: pageControl,
  total,
  pageSize: pageSizeControl,
  pageSizeOptions,
  showSizeChanger = false,
  showQuickJumper = false,
  showTotal,
  simple = false,
  ellipsisJump = false,
  onPageChange,
  size,
  className,
  ...rest
}: PaginationProps) {
  const [page, setPage] = useControl(pageControl, 1);
  const [pageSize, setPageSize] = useControl(pageSizeControl, 10);
  const [draft, setDraft] = useControl(undefined, simple ? '1' : '');
  const strings = useStrings('pagination');
  // Three tiers: explicit prop → ConfigProvider `Pagination.size` →
  // built-in 'md' (a missing provider stays byte-identical).
  const config = useConfigDefaults('Pagination');
  const resolvedSize = size ?? config.size ?? 'md';
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pages = getPageNumbers(page, totalPages);

  // In simple mode the input is the page readout, so it tracks external
  // page changes (prev/next, controlled `page`). The standalone jumper
  // keeps whatever the user typed until the next commit instead.
  useEffect(() => {
    if (simple) setDraft(String(page));
  }, [page, simple, setDraft]);

  /** Single navigation seam: clamps, syncs state, fires the value callback.
   * Returns the clamped page so callers echoing it back (the jumper draft)
   * don't restate the clamp. */
  const navigate = (nextPage: number, nextPageSize: number) => {
    const nextTotalPages = Math.max(1, Math.ceil(total / nextPageSize));
    const clamped = Math.min(Math.max(1, nextPage), nextTotalPages);
    if (nextPageSize !== pageSize) setPageSize(nextPageSize);
    if (clamped !== page) setPage(clamped);
    if (clamped !== page || nextPageSize !== pageSize) {
      onPageChange?.(clamped, nextPageSize);
    }
    return clamped;
  };

  /** Enter-commit for the quick jumper and the simple-mode input; the
      clamping is `navigate`'s, echoed back into the draft. */
  const commitDraft = () => {
    const parsed = parseInt(draft, 10);
    if (Number.isNaN(parsed)) {
      setDraft(simple ? String(page) : '');
      return;
    }
    setDraft(String(navigate(parsed, pageSize)));
  };

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  // One element serves both mounts — the simple-mode readout and the
  // standalone jumper render the identical input (field, commit seam,
  // label), never at the same time.
  const jumperField = (
    <input
      data-slot='input'
      type="text"
      x-class={[pgFieldBase, focusRingVisible, jumperInput]}
      value={draft}
      aria-label={strings.jumperLabel}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commitDraft();
      }}
    />
  );

  const baseOptions = pageSizeOptions ?? [...DEFAULT_PAGE_SIZE_OPTIONS];
  const sizeOptions = baseOptions.includes(pageSize)
    ? baseOptions
    : [...baseOptions, pageSize].sort((a, b) => a - b);

  return (
    <nav data-slot='pagination' x-class={[nav, sizes[resolvedSize], className]} {...rest}>
      {showTotal ? (
        <span data-slot='total' x-class={[auxText]}>
          {showTotal(total, [rangeStart, rangeEnd])}
        </span>
      ) : null}
      <button
        data-slot='prev'
        type="button"
        x-class={[quietSquareButton, btnDelta, focusRingVisible]}
        disabled={page <= 1}
        onClick={() => navigate(page - 1, pageSize)}
        aria-label={strings.previous}
      >
        ‹
      </button>
      {simple ? (
        <>
          {jumperField}
          <span data-slot='total' x-class={[auxText]}>/ {totalPages}</span>
        </>
      ) : (
        pages.map((p, i) =>
          p === '...' ? (
            ellipsisJump ? (
              <button
                key={`e${i}`}
                data-slot='ellipsis'
                type="button"
                x-class={[ellipsis, ellipsisJumpBtn, focusRingVisible]}
                aria-label={formatString(
                  pages.indexOf(page) > i
                    ? strings.ellipsisBackward
                    : strings.ellipsisForward,
                  { count: ELLIPSIS_JUMP }
                )}
                onClick={() =>
                  navigate(
                    pages.indexOf(page) > i ? page - ELLIPSIS_JUMP : page + ELLIPSIS_JUMP,
                    pageSize
                  )
                }
              >
                …
              </button>
            ) : (
              <span key={`e${i}`} data-slot='ellipsis' x-class={[ellipsis]}>…</span>
            )
          ) : (
            <button
              key={p}
              data-slot='item'
              type="button"
              x-class={[quietSquareButton, btnDelta, focusRingVisible, p === page && activeBtn]}
              aria-current={p === page ? 'page' : undefined}
              onClick={() => navigate(p, pageSize)}
            >
              {p}
            </button>
          )
        )
      )}
      <button
        data-slot='next'
        type="button"
        x-class={[quietSquareButton, btnDelta, focusRingVisible]}
        disabled={page >= totalPages}
        onClick={() => navigate(page + 1, pageSize)}
        aria-label={strings.next}
      >
        ›
      </button>
      {showSizeChanger ? (
        <select
          data-slot='size-changer'
          x-class={[pgFieldBase, focusRingVisible, control]}
          value={String(pageSize)}
          aria-label={strings.sizeLabel}
          onChange={(e) => navigate(1, parseInt(e.target.value, 10))}
        >
          {sizeOptions.map((option) => (
            <option key={option} data-slot='option' value={String(option)}>
              {formatString(strings.sizeOption, { count: option })}
            </option>
          ))}
        </select>
      ) : null}
      {showQuickJumper && !simple ? (
        <>
          {strings.jumperPrefix ? (
            <span data-slot='prefix' x-class={[auxText]}>{strings.jumperPrefix}</span>
          ) : null}
          {jumperField}
          {strings.jumperSuffix ? (
            <span data-slot='suffix' x-class={[auxText]}>{strings.jumperSuffix}</span>
          ) : null}
        </>
      ) : null}
    </nav>
  );
}

export type { PaginationProps };
