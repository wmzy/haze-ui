/**
 * Props bag for a pressable that can enter a busy/loading state — the
 * behavior half of `Button`'s `loading` prop, for consumers composing
 * their own trigger (list rows, table actions, custom submit
 * controls):
 *
 * ```tsx
 * const busyProps = useBusyPressable(submitting, disabledProp);
 * <button {...busyProps} onClick={submit}>
 *   {submitting ? <Spinner size="sm" /> : null}
 *   Save
 * </button>
 * ```
 *
 * The bag carries exactly two things:
 *
 * - `disabled` — forced `true` while busy, so activation (click, Enter,
 *   form submission via `type="submit"`) is blocked at the platform
 *   level, not by convention. When a caller's own `disabled` is
 *   supplied, busy ORs into it — busy never *re-enables* a disabled
 *   control.
 * - `aria-busy` — mirrors the busy phase to assistive technology; pair
 *   the swapped-in indicator with `aria-hidden` (or a labeled status
 *   spinner) so it is not double-announced.
 *
 * Anchors have no `disabled` attribute: when the pressable is an
 * `<a>`, translate to `aria-disabled` + `tabIndex={-1}` the way
 * `ButtonLink` does.
 */
export function useBusyPressable(
  busy?: boolean,
  disabled?: boolean,
): {
  disabled: boolean;
  'aria-busy': true | undefined;
} {
  return {
    disabled: Boolean(disabled) || Boolean(busy),
    'aria-busy': busy || undefined,
  };
}
