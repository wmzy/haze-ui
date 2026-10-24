/**
 * variant-to-color — the "unify color prop" migration (haze-ui v1.34.0).
 *
 * Changelog evidence (CHANGELOG.md, v1.34.0 / 2026-10-24, Features):
 *   "add masked/phone inputs, rebuild ScrollArea, unify color prop
 *    ([1c4e323](https://github.com/wmzy/haze-ui/commit/1c4e32358552e1de8b34dc564932280dd6f4134f))"
 *
 * What the commit actually renamed (values were NOT remapped — every old
 * value is still valid on the new prop, so the `values` tables stay empty):
 *
 *   component   old prop       new prop   old values (all still valid)
 *   Alert       variant        color      info|success|warning|danger
 *   Badge       variant        color      default|success|warning|danger|info
 *   Banner      variant        color      info|success|warning|danger
 *   Tag         variant        color      default|primary|success|warning|danger
 *   Sparkline   tone           color      primary|success|warning|danger
 *   Meter       thresholds[].tone  thresholds[].color   success|warning|danger
 *
 * Sparkline's own `variant` ('line' | 'area') is unrelated and untouched;
 * likewise `variant` on other components (e.g. Button solid/outline/ghost).
 *
 * Scope: JSX attributes only (not React.createElement calls). Meter
 * thresholds renames only inline object literals; opaque expressions
 * (identifiers, member/call expressions) are reported and left alone.
 * Elements that already carry both the old and the new prop are reported
 * and skipped so the codemod never creates a duplicate attribute.
 */

/**
 * Per-component prop renames: { Component: { oldProp: { to, values } } }.
 * `values` maps old string-literal values to new ones when a migration also
 * changed the value vocabulary; empty = values pass through unchanged.
 */
const PROP_RENAMES = {
  Alert: { variant: { to: 'color', values: {} } },
  Badge: { variant: { to: 'color', values: {} } },
  Banner: { variant: { to: 'color', values: {} } },
  Tag: { variant: { to: 'color', values: {} } },
  Sparkline: { tone: { to: 'color', values: {} } },
};

/**
 * Per-component renames for object keys inside array-ish attributes:
 * { Component: { attributeName: { oldKey: { to, values } } } }.
 */
const ARRAY_FIELD_RENAMES = {
  Meter: { thresholds: { tone: { to: 'color', values: {} } } },
};

/** Expression kinds whose contents we cannot statically inspect. */
const OPAQUE_EXPRESSION_TYPES = new Set([
  'Identifier',
  'MemberExpression',
  'OptionalMemberExpression',
  'CallExpression',
  'TaggedTemplateExpression',
  'AwaitExpression',
  'JSXElement',
]);

function mapStringValue(literalNode, values) {
  if (!values || typeof literalNode.value !== 'string') return;
  const mapped = values[literalNode.value];
  if (!mapped) return;
  literalNode.value = mapped;
  if (typeof literalNode.raw === 'string') {
    const quote = literalNode.raw.startsWith('"') ? '"' : "'";
    literalNode.raw = `${quote}${mapped}${quote}`;
  }
}

/** Visit object-literal properties under `expression` (babel's ObjectProperty
 *  and estree's Property — only one exists per parser flavor, and
 *  Collection.find silently ignores array type args, hence two passes). */
function forEachObjectProperty(j, expression, visitor) {
  for (const type of [j.ObjectProperty, j.Property]) {
    if (!type) continue;
    j(expression).find(type).forEach(visitor);
  }
}

/** Bare component name: `Tag` -> Tag, `Haze.Tag` -> Tag, `ns:tag` -> null. */
function bareName(node) {
  if (node.type === 'JSXIdentifier') return node.name;
  if (node.type === 'JSXMemberExpression') return bareName(node.property);
  return null;
}

function isPlainAttribute(attr, name) {
  return (
    attr.type === 'JSXAttribute' &&
    attr.name.type === 'JSXIdentifier' &&
    attr.name.name === name
  );
}

export default function variantToColor(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  const stats = typeof api.stats === 'function' ? api.stats : () => {};
  const report = typeof api.report === 'function' ? api.report : () => {};
  let changed = 0;

  root.find(j.JSXOpeningElement).forEach((openPath) => {
    const name = bareName(openPath.node.name);
    if (!name) return;
    const attributes = openPath.node.attributes;
    if (!attributes) return;

    const propRenames = PROP_RENAMES[name];
    if (propRenames) {
      for (const attr of attributes) {
        if (attr.type !== 'JSXAttribute' || attr.name.type !== 'JSXIdentifier') continue;
        const rule = propRenames[attr.name.name];
        if (!rule) continue;
        const taken = attributes.some((other) => other !== attr && isPlainAttribute(other, rule.to));
        if (taken) {
          stats('conflict');
          report(`${name}: both ${attr.name.name} and ${rule.to} are set — rename skipped, resolve by hand`);
          continue;
        }
        attr.name.name = rule.to;
        if (attr.value) mapStringValue(attr.value, rule.values);
        changed += 1;
      }
    }

    const fieldRenames = ARRAY_FIELD_RENAMES[name];
    if (fieldRenames) {
      for (const attr of attributes) {
        if (attr.type !== 'JSXAttribute' || attr.name.type !== 'JSXIdentifier') continue;
        const rules = fieldRenames[attr.name.name];
        if (!rules || !attr.value || attr.value.type !== 'JSXExpressionContainer') continue;
        const expression = attr.value.expression;
        let renamedFields = 0;
        for (const [oldKey, rule] of Object.entries(rules)) {
          forEachObjectProperty(j, expression, (propPath) => {
            const key = propPath.node.key;
            if (key.type !== 'Identifier' || key.name !== oldKey || propPath.node.computed) return;
            const siblings = propPath.parent.node.properties || [];
            const taken = siblings.some(
              (sibling) =>
                sibling !== propPath.node &&
                (sibling.type === 'ObjectProperty' || sibling.type === 'Property') &&
                sibling.key.type === 'Identifier' &&
                sibling.key.name === rule.to,
            );
            if (taken) {
              stats('conflict');
              report(`${name} ${attr.name.name}: both ${oldKey} and ${rule.to} keys present — rename skipped`);
              return;
            }
            key.name = rule.to;
            if (propPath.node.value) mapStringValue(propPath.node.value, rule.values);
            renamedFields += 1;
          });
        }
        changed += renamedFields;
        if (
          renamedFields === 0 &&
          OPAQUE_EXPRESSION_TYPES.has(expression.type)
        ) {
          report(`${name} ${attr.name.name} is not an inline literal — ${Object.keys(rules).join('/')} keys inside it were not renamed`);
        }
      }
    }
  });

  if (changed > 0) stats('renamed', changed);
  return changed > 0 ? root.toSource() : undefined;
}
