/**
 * Shared track height steps — the 4/8/12px ladder Progress's bar
 * (progress-styles `barSizes`) and Meter's track (meter-styles
 * `trackSizes`) wear byte-identically, so the read-only gauge composes
 * with the determinate bar at matching densities; declared here once
 * instead of as two hand-synced tables.
 *
 * Literal px on purpose: both maps have always shipped these steps off
 * the spacing scale. Moving them onto `--haze-space-*` would make the
 * tracks grow with the density tokens — a behaviour change, not a dedup.
 *
 * Plain strings, not css classes: each consumer interpolates the step
 * into its own Linaria class, so progress.css and meter.css each keep
 * emitting their own rule and neither family inlines the other's css
 * (no sharedLayers entry). A shared css class would not do —
 * interpolating a css class inside a css template silently drops that
 * class's declarations.
 *
 * Zero runtime code — no imports at all: consumed only inside css
 * templates, so Linaria evaluates the strings at build time and no
 * module of theirs reaches dist. RSC-neutral by construction and
 * deliberately absent from scripts/rsc-safe.mjs (that list requires a
 * dist module; the RSC-listed progress-styles never imports it at
 * runtime).
 */

/** `sm` track. */
export const trackSizeSm = 'height: 4px;';

/** `md` track. */
export const trackSizeMd = 'height: 8px;';

/** `lg` track. */
export const trackSizeLg = 'height: 12px;';
