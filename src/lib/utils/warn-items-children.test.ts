import { warnItemsChildrenConflict } from './warn-items-children';

describe('warnItemsChildrenConflict', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs the exact [haze-ui] message naming the component', () => {
    const error = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    warnItemsChildrenConflict('Tabs');

    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(
      '[haze-ui] Tabs: `items` and compound `children` are mutually exclusive — rendering `items` and ignoring `children`.'
    );
  });

  it('warns on every call — no dedup, the conflict names a call site to fix', () => {
    const error = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    warnItemsChildrenConflict('TaskList');
    warnItemsChildrenConflict('TaskList');

    expect(error).toHaveBeenCalledTimes(2);
    expect(error).toHaveBeenNthCalledWith(
      2,
      '[haze-ui] TaskList: `items` and compound `children` are mutually exclusive — rendering `items` and ignoring `children`.'
    );
  });
});
