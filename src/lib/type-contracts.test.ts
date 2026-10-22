/**
 * Type-contract regression moat for the haze-ui public API surface.
 *
 * These `expectTypeOf` assertions are runtime no-ops: the suite runs
 * green through `pnpm vitest run src/lib/type-contracts.test.ts` while
 * the contracts hold, and a contract break (a state prop drifting off
 * the `ControlOrValue<T>` one-prop contract, an Omit'd native key
 * leaking back, a `classNames` slot set changing, a skin export losing
 * its string-class shape, or a `defaultXxx` double API appearing)
 * becomes a compile error surfaced by `pnpm typecheck` (`tsc --noEmit`
 * type-checks this file like every other source under `src/`). Wave 2
 * API-consistency rollout (classNames slots / ref-as-prop / skin
 * exports) relies on this file to keep the horizontal invariants from
 * regressing component-by-component.
 */
import type { LinariaClassName } from '@linaria/core';
import type { RowData, RowSelectionState } from '@tanstack/react-table';
import type { Control } from 'react-use-control';

import type {
  AccordionClassNames,
  AccordionProps,
  ButtonProps,
  CheckboxProps,
  ComboboxProps,
  DataTableFiltersState,
  DataTableProps,
  DialogClassNames,
  DialogProps,
  FileInputProps,
  InputProps,
  NumberInputProps,
  SelectClassNames,
  SelectProps,
  SwitchProps,
  TabsClassNames,
  TabsProps,
} from './index';

import { expectTypeOf } from 'vitest';

import { badgeSizes, badgeVariants } from './components/Badge';
import { buttonSizes, buttonVariants } from './components/Button';

describe('type contracts: ControlOrValue state props', () => {
  // The one-prop controllable-state contract: every user-facing state
  // prop is `Control<T> | T` (the `ControlOrValue<T>` alias from
  // react-use-control expands to exactly this union), never a split
  // value/onChange-only or defaultValue API. `NonNullable` strips the
  // optional-prop `undefined` so the anchor reads the value type.
  it('anchors boolean state props', () => {
    expectTypeOf<NonNullable<SwitchProps['checked']>>().toEqualTypeOf<Control<boolean> | boolean>();
    expectTypeOf<NonNullable<CheckboxProps['checked']>>().toEqualTypeOf<Control<boolean> | boolean>();
    expectTypeOf<NonNullable<DialogProps['open']>>().toEqualTypeOf<Control<boolean> | boolean>();
    expectTypeOf<NonNullable<ComboboxProps['open']>>().toEqualTypeOf<Control<boolean> | boolean>();
  });

  it('anchors string state props', () => {
    expectTypeOf<NonNullable<InputProps['value']>>().toEqualTypeOf<Control<string> | string>();
    expectTypeOf<NonNullable<TabsProps['value']>>().toEqualTypeOf<Control<string> | string>();
  });

  it('anchors collection state props', () => {
    expectTypeOf<NonNullable<AccordionProps['open']>>().toEqualTypeOf<Control<string[]> | string[]>();
    expectTypeOf<NonNullable<SelectProps['value']>>().toEqualTypeOf<
      Control<string | string[]> | string | string[]
    >();
    expectTypeOf<NonNullable<ComboboxProps['value']>>().toEqualTypeOf<
      Control<string | string[]> | string | string[]
    >();
  });

  it('anchors DataTable state props', () => {
    expectTypeOf<NonNullable<DataTableProps<RowData>['page']>>().toEqualTypeOf<Control<number> | number>();
    expectTypeOf<NonNullable<DataTableProps<RowData>['rowSelection']>>().toEqualTypeOf<
      Control<RowSelectionState> | RowSelectionState
    >();
    expectTypeOf<NonNullable<DataTableProps<RowData>['filters']>>().toEqualTypeOf<
      Control<DataTableFiltersState> | DataTableFiltersState
    >();
  });
});

describe('type contracts: native-prop Omit lists', () => {
  // Components rebase on native element props via
  // `Omit<ComponentPropsWithoutRef<'element'>, ...>`; the Omit list is
  // the conflict-resolution contract. Keys the component re-declares
  // with library semantics must not fall back to the native type, keys
  // it owns outright must be gone.
  it('InputProps replaces the native input size with the design-system union', () => {
    expectTypeOf<NonNullable<InputProps['size']>>().toEqualTypeOf<'sm' | 'md' | 'lg'>();
  });

  it('SelectProps replaces the native select size', () => {
    expectTypeOf<NonNullable<SelectProps['size']>>().toEqualTypeOf<'sm' | 'md' | 'lg'>();
  });

  it('NumberInputProps drops native type and replaces size/value', () => {
    expectTypeOf<NumberInputProps>().not.toHaveProperty('type');
    expectTypeOf<NonNullable<NumberInputProps['size']>>().toEqualTypeOf<'sm' | 'md' | 'lg'>();
    expectTypeOf<NonNullable<NumberInputProps['value']>>().toEqualTypeOf<Control<number> | number>();
  });

  it('ButtonProps drops the native type attribute (the component owns type)', () => {
    expectTypeOf<ButtonProps>().not.toHaveProperty('type');
  });

  it('CheckboxProps drops the native type attribute', () => {
    expectTypeOf<CheckboxProps>().not.toHaveProperty('type');
  });

  it('FileInputProps drops the native type attribute (file semantics are fixed)', () => {
    expectTypeOf<FileInputProps>().not.toHaveProperty('type');
  });
});

describe('type contracts: classNames slot shapes', () => {
  // AntD v6-style `classNames` records: every key is an optional
  // string slot mirroring the part's data-slot name. The key set is
  // public API — adding/removing/renaming a slot must trip this file.
  it('DialogClassNames', () => {
    expectTypeOf<DialogClassNames>().toEqualTypeOf<Partial<Record<'root' | 'header', string>>>();
  });

  it('SelectClassNames', () => {
    expectTypeOf<SelectClassNames>().toEqualTypeOf<
      Partial<Record<'trigger' | 'content' | 'option' | 'clearButton' | 'item' | 'searchInput', string>>
    >();
  });

  it('TabsClassNames', () => {
    expectTypeOf<TabsClassNames>().toEqualTypeOf<Partial<Record<'root' | 'list' | 'tab' | 'panel', string>>>();
  });

  it('AccordionClassNames', () => {
    expectTypeOf<AccordionClassNames>().toEqualTypeOf<
      Partial<Record<'accordion' | 'item' | 'summary' | 'content', string>>
    >();
  });
});

describe('type contracts: skin exports', () => {
  // shadcn-precedent skin maps (`buttonVariants`/`sizes` …): exact
  // variant/size key sets, every value a Linaria class name
  // (`LinariaClassName`, the branded `string` the css tag returns) so
  // consumers can spread them into custom elements. (Tag/Tooltip skin
  // exports land with their sibling wave; Button/Badge are the merged
  // precedent anchored here.)
  it('buttonVariants/buttonSizes keep exact keys with string values', () => {
    expectTypeOf<keyof typeof buttonVariants>().toEqualTypeOf<'solid' | 'outline' | 'ghost'>();
    expectTypeOf<(typeof buttonVariants)[keyof typeof buttonVariants]>().toEqualTypeOf<LinariaClassName>();
    expectTypeOf<keyof typeof buttonSizes>().toEqualTypeOf<'sm' | 'md' | 'lg'>();
    expectTypeOf<(typeof buttonSizes)[keyof typeof buttonSizes]>().toEqualTypeOf<LinariaClassName>();
  });

  it('badgeVariants/badgeSizes keep exact keys with string values', () => {
    expectTypeOf<keyof typeof badgeVariants>().toEqualTypeOf<'default' | 'success' | 'warning' | 'danger' | 'info'>();
    expectTypeOf<(typeof badgeVariants)[keyof typeof badgeVariants]>().toEqualTypeOf<LinariaClassName>();
    expectTypeOf<keyof typeof badgeSizes>().toEqualTypeOf<'sm' | 'md'>();
    expectTypeOf<(typeof badgeSizes)[keyof typeof badgeSizes]>().toEqualTypeOf<LinariaClassName>();
  });
});

describe('type contracts: no defaultXxx double API', () => {
  it('pure-props families declare no defaultXxx twin', () => {
    // Tabs/Combobox/Dialog props carry no native element base, so any
    // default* key here would be a library-declared double API — the
    // uncontrolled initial value rides the ControlOrValue prop itself.
    expectTypeOf<TabsProps>().not.toHaveProperty('defaultValue');
    expectTypeOf<ComboboxProps>().not.toHaveProperty('defaultValue');
    expectTypeOf<ComboboxProps>().not.toHaveProperty('defaultOpen');
    expectTypeOf<DialogProps>().not.toHaveProperty('defaultOpen');
    expectTypeOf<AccordionProps>().not.toHaveProperty('defaultOpen');
  });

  it('native-based fields keep defaultChecked/defaultValue as untouched React platform passthrough', () => {
    // React's HTMLAttributes ships defaultChecked/defaultValue on
    // every element prop type (@types/react), so Switch/Select inherit
    // them through ...rest like any native attribute. The library
    // neither consumes nor reshapes them; a Control-shaped
    // re-declaration (the double-API regression this guards) would
    // change these types away from the platform shapes.
    expectTypeOf<SwitchProps['defaultChecked']>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<SelectProps['defaultValue']>().toEqualTypeOf<
      string | number | readonly string[] | undefined
    >();
  });
});
