import type {FormInstance} from 'react-f0rm';

import {useContext} from 'react';
import {FormContext} from 'react-f0rm';

/**
 * The form-resolution order FormItem and FormList share: the explicit
 * `form` prop first, then react-f0rm's form context (a mounted
 * `<FormProvider value={form}>`); neither — a descriptive error naming
 * both exits (parameterized by component name), instead of f0rm's bare
 * internal "no form provided".
 *
 * Returns `FormInstance<any>` — the honest type of the context fallback
 * (an untyped `<FormProvider>`), which is also what lets the callers'
 * permissive public `name: P` keep flowing into f0rm's typed accessors
 * exactly as it did against the old `form ?? formFromContext` union.
 */
export function useResolvedForm<TValues extends Record<string, any> = any>(
  form: FormInstance<TValues> | undefined,
  componentName: string
): FormInstance {
  const formFromContext = useContext(FormContext);
  const resolvedForm = form ?? formFromContext;
  if (!resolvedForm) {
    throw new Error(
      `${componentName}: no form provided — pass \`form={form}\` or render inside a <FormProvider value={form}>.`
    );
  }
  return resolvedForm;
}
