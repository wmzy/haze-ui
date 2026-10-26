import { warnDeprecated } from './deprecate';

/*
 * The dedup Set is module-scoped and intentionally not resettable, so
 * every test uses its own keys — that is also what the "distinct keys"
 * case exercises.
 */

describe('warnDeprecated', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('warns once per key, prefixed with [haze-ui]', () => {
    const warn = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    warnDeprecated(
      'test.once',
      "ButtonLink is deprecated — use <Button as='a'> instead."
    );
    warnDeprecated(
      'test.once',
      "ButtonLink is deprecated — use <Button as='a'> instead."
    );
    // Same key, different message: still the same bucket.
    warnDeprecated('test.once', 'anything at all');

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(
      "[haze-ui] ButtonLink is deprecated — use <Button as='a'> instead."
    );
  });

  it('warns once for each distinct key', () => {
    const warn = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    warnDeprecated('test.key-a', 'The `ghost` variant is deprecated.');
    warnDeprecated('test.key-b', 'The `extra` prop is deprecated.');
    warnDeprecated('test.key-a', 'The `ghost` variant is deprecated.');
    warnDeprecated('test.key-b', 'repeated render read');

    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenNthCalledWith(
      1,
      '[haze-ui] The `ghost` variant is deprecated.'
    );
    expect(warn).toHaveBeenNthCalledWith(
      2,
      '[haze-ui] The `extra` prop is deprecated.'
    );
  });

  it('stays silent in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const warn = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    warnDeprecated('test.production', 'never seen');
    // Repeated calls stay silent too.
    warnDeprecated('test.production', 'never seen');

    expect(warn).not.toHaveBeenCalled();
  });

  it('still warns when process is unavailable (browser bundle without a process shim)', () => {
    // `typeof process` must be the guard, not a bare reference — a bare
    // process.env read throws a ReferenceError in a process-less runtime.
    vi.stubGlobal('process', undefined);
    const warn = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    warnDeprecated('test.no-process', 'no-process deprecation');

    expect(warn).toHaveBeenCalledWith(
      '[haze-ui] no-process deprecation'
    );
  });
});
