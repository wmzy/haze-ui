import type {SetStateAction} from 'react';

import type {Control} from 'react-use-control';

import type {
  FieldPath,
  FormInstance,
  Name,
  PathValueOf
} from 'react-f0rm';

import {useMemo} from 'react';
import {useControl, useThru} from 'react-use-control';


import {getValueByPath, setValueByPath, useValueByPath} from 'react-f0rm';


// Re-exported for the barrel: consumers of 'haze-ui' get the form
// instance and value-at-path types alongside the bridge API.
export type {FormInstance, PathValueOf};

/** Segments of a field path: object keys and array indices. */
type PathSegments = (string | number)[];

/**
 * A parsed field path. Structurally identical to react-f0rm's internal
 * `Path`: `key` is the JSON-stringified segments and is what every form
 * store (values / errors / touched) is keyed by, so producing the exact
 * same `key` for the same name is what keeps this bridge interoperable
 * with the rest of the react-f0rm API.
 */
type ParsedPath = {value: PathSegments; key: string};

// Unbounded on purpose: the cache is keyed by literal path strings, which
// come from static field names in source — even a large form has a few
// dozen. Dynamically-built paths (e.g. `items[${i}].name`) each add an
// entry that lives for the page's lifetime; acceptable for realistic list
// sizes, revisit if pathological growth shows up.
const pathCache = new Map<string, PathSegments>();

/**
 * Parse a dotted/bracketed path string into segments, mirroring
 * react-f0rm's own `parsePath` rule for rule ('a.b', 'a[0]', 'a["b.c"]',
 * numeric brackets become numbers) so cached paths always key-match the
 * paths the form library builds internally.
 */
function parseName(path: string): PathSegments {
  const result: PathSegments = [];
  let identifier = '';
  const flushIdentifier = () => {
    result.push(identifier);
    identifier = '';
  };

  for (let i = 0; i < path.length; i++) {
    const char = path[i]!;
    if (char === '.') {
      if (identifier !== '') flushIdentifier();
    } else if (char === '[') {
      if (identifier !== '') flushIdentifier();
      const quote = path[i + 1];
      if (quote === '"' || quote === "'") {
        const close = path.indexOf(quote, i + 2);
        if (close === -1) {
          throw new TypeError(`Unterminated quote in path: ${path}`);
        }
        if (path[close + 1] !== ']') {
          throw new TypeError(
            `Expected "]" after quoted segment in path: ${path}`
          );
        }
        result.push(path.slice(i + 2, close));
        i = close + 1;
      } else {
        const close = path.indexOf(']', i + 1);
        if (close === -1) {
          throw new TypeError(`Unterminated bracket in path: ${path}`);
        }
        const content = path.slice(i + 1, close);
        result.push(/^-?\d+$/.test(content) ? Number(content) : content);
        i = close;
      }
    } else {
      identifier += char;
    }
  }
  if (identifier !== '' || result.length === 0) flushIdentifier();
  return result;
}

function toPath(name: Name): ParsedPath {
  if (typeof name !== 'string') return {value: name, key: JSON.stringify(name)};
  let segments = pathCache.get(name);
  if (!segments) {
    segments = parseName(name);
    pathCache.set(name, segments);
  }
  return {value: segments, key: JSON.stringify(segments)};
}

/** Cache a parsed path across re-renders. Array names passed inline (a
 * fresh literal per render) and repeated string names reuse one `Parsed`
 * object, keyed by the name's stable serialization. */
function useCachedPath(name: Name): ParsedPath {
  const cacheKey = typeof name === 'string' ? name : JSON.stringify(name);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- deps are the serialized name on purpose: the parsed path only depends on it
  return useMemo(() => toPath(name), [cacheKey]);
}

/**
 * Bind a react-f0rm field to haze-ui's Control system.
 *
 * The returned handle can be passed to any control-prop of a haze-ui
 * component (`value`, `checked`, ...) exactly like a local control:
 *
 * ```tsx
 * const form = useForm({initialValues: {email: ''}});
 * const email = useFormControl(form, 'email');
 * return <Input value={email} />;
 * ```
 *
 * How it works: the handle carries a `[form value, dispatch → form]` state
 * pair — the form owns the state, the handle only forwards it. Reads return
 * `getValueByPath` at render time (kept fresh by a `useValueByPath`
 * subscription that re-renders this component on own-field changes — and
 * only those, so sibling fields stay isolated); writes go through
 * `setValueByPath`, accepting either a plain value or a functional updater
 * that is evaluated against the live form value.
 *
 * The handle's identity is stable across re-renders, including own-field
 * value changes.
 *
 * @param form react-f0rm form instance
 * @param name field path — dotted string ('user.email', 'tags[0]') or
 *        segments array (['user', 0, 'name'])
 * @return a `Control` bound to the field's value
 */
export function useFormControl<
  TValues extends Record<string, any> = any,
  P extends FieldPath<TValues> | Name = Name
>(form: FormInstance<TValues>, name: P): Control<PathValueOf<TValues, P>> {
  type FieldValue = PathValueOf<TValues, P>;
  const path = useCachedPath(name);

  // Own-field subscription: drives this component's re-render when (and
  // only when) the bound field changes — without it, memoized haze-ui
  // children would freeze on the value captured at their last render.
  // react-f0rm types useValueByPath's return as `any`; anchor it to the
  // field's declared value type.
  const value = useValueByPath(form, path) as FieldValue;

  // Base control whose dummy state never changes (the initial `undefined`
  // is never written), so its identity — and therefore the useThru result —
  // stays stable even while the bound field's value changes.
  const [, , base] = useControl();

  return useThru(base as Control<FieldValue>, () => [
    value,
    // The setter takes React's loose SetStateAction<any>: under an
    // unresolved generic, `SetStateAction<FieldValue>` cannot be narrowed
    // by `typeof === 'function'` (TS keeps a `FieldValue & Function`
    // constituent that is not callable). Sanitize at the boundary instead
    // — both assertions start from `any`, which keeps them honest and
    // fixer-stable.
    (action: SetStateAction<any>) => {
      const current = getValueByPath(form, path) as FieldValue;
      const next: FieldValue =
        typeof action === 'function'
          ? (action as (prevState: FieldValue) => FieldValue)(current)
          : (action as FieldValue);
      setValueByPath(form, path, next);
    }
  ]);
}
