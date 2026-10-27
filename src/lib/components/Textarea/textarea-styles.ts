/**
 * Shared Textarea size skin — the per-size padding/typography classes
 * the `TextareaCore` component wears (the `Textarea` sugar delegates
 * to it). The map was byte-identical to Input's and now lives once in
 * `utils/field-skin.ts` (`fieldSizes`); this module re-exports it so
 * ConfigProvider's size-tier assertions and any consumer importing the
 * Textarea-side name keep pointing at the one map. No css is emitted
 * from this file — split-css groups `fieldSizes` with every consuming
 * family via sharedLayers.
 */
export { fieldSizes as sizes } from '../../utils/field-skin';
