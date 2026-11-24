/**
 * Props-table merge rules shared by the two generated consumers of
 * src/generated/props.json — llms-full.txt (scripts/generate-llms-full.mjs)
 * and the MCP docs snapshot (scripts/generate-mcp-docs.mjs) — mirroring the
 * docs site's PropsTable (src/views/ComponentDetail/PropsTable.tsx):
 *
 *   - generated rows (TS Compiler API) keep their verbatim type; a matching
 *     hand-written row (src/generated/props-docs.json) only layers
 *     description/default on top;
 *   - doc rows the generator cannot see (className, `...rest`, children —
 *     "ghost rows") are appended afterwards in handwritten order.
 */

/**
 * A component's documentable types: [typeName, generatedRows] pairs,
 * propsTypes first then otherTypes (TreeNodeData, …) — same precedence as
 * the docs site's type index. props.json already stores both maps
 * key-sorted; sort anyway so output never depends on insertion order.
 */
export const typeEntries = (entry) => [
  ...Object.entries(entry.propsTypes ?? {}).sort(([a], [b]) =>
    a < b ? -1 : 1
  ),
  ...Object.entries(entry.otherTypes ?? {}).sort(([a], [b]) =>
    a < b ? -1 : 1
  ),
];

/**
 * Merge one type's generated rows with its handwritten doc rows. `required`
 * adds the `required` column (the extracted flag on generated rows, false on
 * ghost rows) — llms-full.txt has no such column, so it is opt-in.
 */
export function mergeRows(
  generatedRows,
  docRows = [],
  { required = false } = {}
) {
  const docsByName = new Map(docRows.map((row) => [row.name, row]));
  const rows = generatedRows.map((row) => {
    const doc = docsByName.get(row.name);
    docsByName.delete(row.name);
    return {
      name: row.name,
      type: row.type,
      ...(required ? { required: row.required ?? false } : {}),
      default: doc?.default,
      description: doc?.description ?? '',
    };
  });
  for (const doc of docRows) {
    if (!docsByName.has(doc.name)) continue;
    rows.push({
      name: doc.name,
      type: doc.type ?? '—',
      ...(required ? { required: false } : {}),
      default: doc.default,
      description: doc.description ?? '',
    });
  }
  return rows;
}
