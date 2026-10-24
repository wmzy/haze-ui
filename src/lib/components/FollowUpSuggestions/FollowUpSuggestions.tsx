import type { ComponentPropsWithoutRef, Ref } from 'react';

import { css } from '@linaria/core';

import { Button } from '../Button';
import { Skeleton } from '../Skeleton';

/**
 * AI chat follow-up suggestions ("猜你想问"): a horizontally wrapping
 * row of clickable prompt chips shown after an answer. Chips wear
 * Button's outline sm skin — Chip is display-only (a span), so Button
 * supplies the native button semantics keyboard users need. Stateless:
 * the caller owns the selection flow via `onSelect`.
 */
type FollowUpSuggestionsProps = {
  /** Candidate prompts; one chip per entry, rendered in order. */
  suggestions: string[];
  /** Fired with the clicked chip's text. */
  onSelect?: (value: string) => void;
  /** Disables every chip (pointer and keyboard). */
  disabled?: boolean;
  /**
   * Swaps the chips for skeleton placeholders — one per suggestion, or
   * three when the list is still empty — so the row keeps its layout
   * while the suggestions stream in.
   */
  loading?: boolean;
  className?: string;
  /** Forwarded to the root list div. */
  ref?: Ref<HTMLDivElement>;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'onSelect'>;

const list = css`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--haze-space-2);
`;

const item = css`
  display: flex;
`;

/** Skeleton widths cycle so the placeholder row reads as varied prompt
 * chips rather than a form grid; each is a token composition (an sm
 * Button's chip is roughly N text-sm characters wide). */
const SKELETON_WIDTHS = [
  'calc(var(--haze-text-sm) * 6)',
  'calc(var(--haze-text-sm) * 9)',
  'calc(var(--haze-text-sm) * 12)',
] as const;

/** An sm Button's content box: text-sm at leading-tight plus its two
 * space-1 paddings — the skeleton matches the chip height it replaces. */
const SKELETON_HEIGHT = 'calc(var(--haze-text-sm) * var(--haze-leading-tight) + var(--haze-space-2))';

/** Placeholders rendered while loading when `suggestions` is still empty. */
const DEFAULT_SKELETON_COUNT = 3;

export default function FollowUpSuggestions({
  suggestions,
  onSelect,
  disabled = false,
  loading = false,
  className,
  ref,
  ...rest
}: FollowUpSuggestionsProps) {
  return (
    <div
      ref={ref}
      data-slot='follow-up-suggestions'
      role='list'
      x-class={[list, className]}
      {...rest}
    >
      {loading
        ? Array.from(
            { length: suggestions.length > 0 ? suggestions.length : DEFAULT_SKELETON_COUNT },
            (_, index) => (
              // Decorative placeholders: hidden from the a11y tree, the
              // list simply reads as empty until the suggestions land.
              <div key={index} data-slot='follow-up-suggestion-skeleton' aria-hidden='true' x-class={[item]}>
                <Skeleton
                  variant='rectangular'
                  width={SKELETON_WIDTHS[index % SKELETON_WIDTHS.length]}
                  height={SKELETON_HEIGHT}
                />
              </div>
            ),
          )
        : suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion}-${index}`}
              data-slot='follow-up-suggestion'
              role='listitem'
              x-class={[item]}
            >
              <Button
                variant='outline'
                size='sm'
                disabled={disabled}
                onClick={() => onSelect?.(suggestion)}
              >
                {suggestion}
              </Button>
            </div>
          ))}
    </div>
  );
}

export type { FollowUpSuggestionsProps };
