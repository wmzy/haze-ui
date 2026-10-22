export {default as Card} from './Card';
export type {CardProps} from './Card';
// The variant skin classes `Card` wears, exported for composition
// (same shape and rationale as Button's `buttonVariants`/`buttonSizes`).
// Defined in Card.tsx itself — the directory is atomically RSC-safe
// (scripts/rsc-safe.mjs), so a sibling styles module would push the
// barrel's import closure across the client boundary.
export {variants as cardVariants} from './Card';
