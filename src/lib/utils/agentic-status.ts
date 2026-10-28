/**
 * The shared agentic status vocabulary — the pending → running →
 * done/error lifecycle every agentic surface speaks (Trace steps,
 * StepTimeline rows, Plan items, ToolCallCard headers). Families with
 * extra states (StepTimeline/Plan's `active`, Plan's `skipped`) extend
 * the union locally; everything shared about a status — its tone and
 * its localized word — lives here.
 */

/** The four statuses every agentic component has in common. */
export type AgenticStatus = 'pending' | 'running' | 'done' | 'error';

/** The semantic color tone a status lands on. */
export type AgenticStatusTone = 'muted' | 'primary' | 'success' | 'danger';

/** Status → tone: which semantic color family carries the state. */
export const agenticStatusTone: Record<AgenticStatus, AgenticStatusTone> = {
  pending: 'muted',
  running: 'primary',
  done: 'success',
  error: 'danger',
};

/**
 * Locale strings for the four statuses — the shape of the
 * `toolCallCard` locale section Trace and ToolCallCard read.
 */
export type AgenticStatusLabels = Record<AgenticStatus, string>;

/** The localized status word (sr-only announcements, status labels). */
export function agenticStatusLabel(
  status: AgenticStatus,
  labels: AgenticStatusLabels,
): string {
  return labels[status];
}
