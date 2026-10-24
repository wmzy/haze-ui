/*
 * Stacking ladder: the z-index tiers every layered surface in the library
 * resolves through. Native top-layer rendering (popover/anchor positioning
 * and modal <dialog> on modern engines) paints outside the normal stacking
 * order and needs no z-index at all — the ladder exists for the surfaces
 * that stack the ordinary way:
 *
 * - z-local-1/2/3 — component-local paint order only (a focused button
 *   lifting over its row seam, a drag ghost over siblings, a pinned
 *   header over scrolling rows, DataTable's sticky/fixed cell lattice,
 *   Schedule's now-indicator). These never leave the component.
 * - z-overlay — fixed overlays above page content that still stack
 *   normally: BottomSheet / ConfirmDialog scrims, Affix, the Tour card,
 *   the ContextMenu panel off the top layer, Workbench's slide-out
 *   regions (its scrim/chrome sit just below/above via calc on this
 *   tier so a re-tiered overlay keeps the shell's internal order).
 * - z-overlay-fallback — the floating JS fallback tier (utils/floating
 *   placement classes) on engines without the popover API: panels are
 *   absolutely positioned in the trigger's container and must clear
 *   whatever fixed overlays the app mounts, hence the headroom above
 *   z-overlay.
 * - z-toast — the toast viewport, above everything by design.
 *
 * Consumers coordinate their own custom layers with these tiers simply by
 * referencing the same custom properties. All tokens are theme- and
 * density-invariant; the declarations ride the spacing class (the
 * always-applied invariant token carrier — same class that carries radius
 * and shadow) via zIndexDeclarations(), so the tiers resolve wherever
 * spacing does, and overriding a token on a subtree re-tiers just that
 * subtree. Pure constants — no hooks, no DOM (RSC-safe; see
 * scripts/rsc-safe.mjs).
 */

export const Z_INDEX_TOKENS = [
  {name: '--haze-z-local-1', label: 'Z Local 1', value: '1'},
  {name: '--haze-z-local-2', label: 'Z Local 2', value: '2'},
  {name: '--haze-z-local-3', label: 'Z Local 3', value: '3'},
  {name: '--haze-z-overlay', label: 'Z Overlay', value: '100'},
  {name: '--haze-z-overlay-fallback', label: 'Z Overlay Fallback', value: '1000'},
  {name: '--haze-z-toast', label: 'Z Toast', value: '9999'},
] as const;

export type ZIndexToken = (typeof Z_INDEX_TOKENS)[number];

/**
 * The z-index declarations the spacing css template emits, one per tier.
 * Exported for the token tests — the css template interpolates this exact
 * function and Linaria evaluates it at build time (colors.ts /
 * spacingDeclarations precedent).
 */
export function zIndexDeclarations(): string {
  return Z_INDEX_TOKENS.map((token) => `${token.name}: ${token.value};`).join('\n');
}
