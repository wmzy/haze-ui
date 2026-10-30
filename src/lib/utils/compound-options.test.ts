import type { ReactNode } from 'react';

import type { CompoundOptionTypes } from './compound-options';

import { createElement } from 'react';

import { walkCompoundOptions } from './compound-options';

const Option = ({
  children,
}: {
  value?: unknown;
  disabled?: unknown;
  children?: ReactNode;
}) => children ?? null;
const Group = ({
  children,
}: { label?: unknown; children?: ReactNode }) => children ?? null;

const types: CompoundOptionTypes = {
  option: (type) => type === Option,
  group: (type) => type === Group,
};

describe('walkCompoundOptions pure walker', () => {
  it('extracts option nodes with raw value/label and normalized disabled', () => {
    const nodes = walkCompoundOptions(
      [
        createElement(Option, { value: 1 }, 'One'),
        createElement(Option, { value: 'two', disabled: 'yes' }, 'Two'),
      ],
      types
    );
    expect(nodes).toEqual([
      { kind: 'option', value: 1, label: 'One', disabled: false },
      { kind: 'option', value: 'two', label: 'Two', disabled: false },
    ]);
  });

  it('expands groups depth-first with standalone group nodes', () => {
    const nodes = walkCompoundOptions(
      createElement(
        Group,
        { label: 'Outer' },
        createElement(Option, { value: 'a' }, 'A'),
        createElement(
          Group,
          { label: 'Inner' },
          createElement(Option, { value: 'b' }, 'B')
        )
      ),
      types
    );
    expect(nodes).toEqual([
      {
        kind: 'group',
        label: 'Outer',
        nodes: [
          { kind: 'option', value: 'a', label: 'A', disabled: false },
          {
            kind: 'group',
            label: 'Inner',
            nodes: [{ kind: 'option', value: 'b', label: 'B', disabled: false }],
          },
        ],
      },
    ]);
  });

  it('ignores stray non-family children', () => {
    const nodes = walkCompoundOptions(
      [
        'plain text',
        createElement('div', null, 'stray'),
        createElement(Option, { value: 'keep' }, 'Keep'),
      ],
      types
    );
    expect(nodes).toEqual([
      { kind: 'option', value: 'keep', label: 'Keep', disabled: false },
    ]);
  });

  it('drops options without a value but passes non-scalar values through', () => {
    const nodes = walkCompoundOptions(
      [
        createElement(Option, null, 'No value'),
        createElement(Option, { value: ['a', 'b'] }, 'Multi'),
        createElement(Option, { value: 'keep' }),
      ],
      types
    );
    expect(nodes).toEqual([
      { kind: 'option', value: ['a', 'b'], label: 'Multi', disabled: false },
      { kind: 'option', value: 'keep', label: undefined, disabled: false },
    ]);
  });

  it('keeps non-string group labels verbatim for consumers to coerce', () => {
    const [node] = walkCompoundOptions(
      createElement(Group, { label: 42 }, createElement(Option, { value: 'x' })),
      types
    );
    expect(node).toEqual({
      kind: 'group',
      label: 42,
      nodes: [{ kind: 'option', value: 'x', label: undefined, disabled: false }],
    });
  });
});
