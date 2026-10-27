/**
 * Shared Input size skin — the per-size padding/typography classes the
 * `InputCore` component wears (the `Input` sugar delegates to it). The
 * map itself now lives in `utils/field-skin.ts` (`fieldSizes`), shared
 * with Textarea and NumberInput; this module re-exports it so
 * ConfigProvider's size-tier assertions and any consumer importing the
 * Input-side name keep pointing at the one map. No css is emitted from
 * this file — split-css groups `fieldSizes` with every consuming
 * family via sharedLayers.
 */
export { fieldSizes as sizes } from '../../utils/field-skin';
