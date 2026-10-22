import { createContext, useContext } from 'react';

/**
 * What an InputGroup hands down to its subtree: the group's resolved
 * `size` and the inherited `classNames.addon` slot. `InputGroupAddon`
 * consumes it; field children (`Input`, `Select`, …) pick the size up
 * through prop injection instead — they are not wired to this context.
 */
type InputGroupValue = {
  size: 'sm' | 'md' | 'lg';
  /** The group's `classNames.addon` slot, inherited by every
   * InputGroupAddon child (TagGroup's item-slot precedent). */
  addonClass?: string;
};

const InputGroupContext = createContext<InputGroupValue | undefined>(
  undefined,
);

const InputGroupProvider = InputGroupContext.Provider;

/**
 * Reads the enclosing InputGroup's resolved size. Returns `undefined`
 * outside a group (a standalone InputGroupAddon falls back to `md`).
 */
function useInputGroup(): InputGroupValue | undefined {
  return useContext(InputGroupContext);
}

export { InputGroupContext, InputGroupProvider, useInputGroup };
export type { InputGroupValue };
