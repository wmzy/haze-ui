import { useEffect, useRef } from 'react';

/**
 * Remote-search report (Toast's latest-ref pattern: an inline arrow has a
 * fresh identity every parent render, so the callback rides a ref and the
 * report effect keys on the query alone). Fires once per actual query
 * transition — every keystroke, clearing the field, and the resets that
 * follow a selection or a panel close (back to '' or the picked label) —
 * including empty queries, which the consumer uses to restore the full
 * list. Never fires on mount.
 */
export function useSearchReport(
  onSearch: ((query: string) => void) | undefined,
  query: string
): void {
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);
  const reportedQueryRef = useRef(query);
  useEffect(() => {
    if (reportedQueryRef.current === query) return;
    reportedQueryRef.current = query;
    onSearchRef.current?.(query);
  }, [query]);
}
