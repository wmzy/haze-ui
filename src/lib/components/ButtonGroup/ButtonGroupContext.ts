import { createContext, useContext } from 'react';

/**
 * The resolved skin a ButtonGroup hands down to its subtree: the
 * group-wide `size`/`variant`, whether the group is `disabled`, and the
 * bar's `orientation`. `ButtonGroupSeparator` consumes it to orient and
 * ink itself; `Button` children pick the skin up through prop
 * injection instead (Button is not wired to this context), so the
 * context serves custom children composing the exported
 * `buttonVariants`/`buttonSizes` skin classes.
 */
type ButtonGroupValue = {
  size: 'sm' | 'md' | 'lg';
  variant: 'solid' | 'outline' | 'ghost';
  disabled: boolean;
  orientation: 'horizontal' | 'vertical';
  /** The group's `classNames.separator` slot, inherited by every
   * ButtonGroupSeparator child (TagGroup's item-slot precedent). */
  separatorClass?: string;
};

const ButtonGroupContext = createContext<ButtonGroupValue | undefined>(
  undefined,
);

const ButtonGroupProvider = ButtonGroupContext.Provider;

/**
 * Reads the enclosing ButtonGroup's resolved skin. Returns `undefined`
 * outside a group (a standalone ButtonGroupSeparator falls back to the
 * horizontal-rule look and the group-less default ink).
 */
function useButtonGroup(): ButtonGroupValue | undefined {
  return useContext(ButtonGroupContext);
}

export { ButtonGroupContext, ButtonGroupProvider, useButtonGroup };
export type { ButtonGroupValue };
