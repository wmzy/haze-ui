/**
 * Shared chip size fragments — the padding + font-size pair of each step
 * in the sm/md ladder Badge (badge-styles `sizes`) and Tag (tag-styles
 * `tagSizes`) wear byte-identically; declared here once instead of as
 * two hand-synced tables. (Chip keeps its own single size in
 * chip-styles.ts.)
 *
 * Plain strings, not css classes: each consumer interpolates the pair
 * into its own Linaria class, so badge.css and tag.css each keep
 * emitting their own rule and neither family inlines the other's css
 * (no sharedLayers entry). A shared css class would not do —
 * interpolating a css class inside a css template silently drops that
 * class's declarations.
 *
 * Zero runtime code — no imports at all: consumed only inside css
 * templates, so Linaria evaluates the strings at build time and no
 * module of theirs reaches dist. RSC-neutral by construction and
 * deliberately absent from scripts/rsc-safe.mjs (that list requires a
 * dist module; the RSC-listed badge-styles / tag-styles never import
 * them at runtime).
 */

/** `sm`: zero block / space-2 inline padding over xs type. */
export const chipSizeSm = `
  padding: var(--haze-space-0) var(--haze-space-2);
  font-size: var(--haze-text-xs);
`;

/** `md`: space-1 block / space-3 inline padding over sm type. */
export const chipSizeMd = `
  padding: var(--haze-space-1) var(--haze-space-3);
  font-size: var(--haze-text-sm);
`;
