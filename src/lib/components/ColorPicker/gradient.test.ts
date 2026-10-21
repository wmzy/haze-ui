import {
  gradientFromColor,
  normalizeGradient,
  parseGradient,
  serializeGradient,
} from './gradient';

describe('parseGradient', () => {
  it('parses the canonical form', () => {
    expect(parseGradient('linear-gradient(135deg, #667eea 0%, #764ba2 100%)')).toEqual({
      angle: 135,
      stops: [
        {color: '#667eea', position: 0},
        {color: '#764ba2', position: 100},
      ],
    });
  });

  it('round trips byte-identically through serialize', () => {
    const canonical = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    expect(serializeGradient(parseGradient(canonical)!)).toBe(canonical);
  });

  it('is round-trip stable for arbitrary tolerated inputs', () => {
    const inputs = [
      'linear-gradient(to right, #000000, #ffffff)',
      'linear-gradient(#ff0000, #0000ff 60%, #00ff00)',
      'linear-gradient(90deg, rgba(255, 0, 0, 0.5) 25%, #00ff00 75%)',
      'linear-gradient(450deg, #000000 -5%, #ffffff 150%)',
      '  LINEAR-GRADIENT( 45deg , #111 0% , #222 100% )  ',
    ];
    for (const input of inputs) {
      const once = parseGradient(input);
      expect(once).not.toBeNull();
      const twice = parseGradient(serializeGradient(once!));
      expect(twice).toEqual(once);
      expect(serializeGradient(twice!)).toBe(serializeGradient(once!));
    }
  });

  it('maps to-keywords to degrees', () => {
    expect(parseGradient('linear-gradient(to top, #000, #fff)')!.angle).toBe(0);
    expect(parseGradient('linear-gradient(to right, #000, #fff)')!.angle).toBe(90);
    expect(parseGradient('linear-gradient(to bottom, #000, #fff)')!.angle).toBe(180);
    expect(parseGradient('linear-gradient(to left, #000, #fff)')!.angle).toBe(270);
    expect(parseGradient('linear-gradient(to top right, #000, #fff)')!.angle).toBe(45);
    expect(parseGradient('linear-gradient(to top left, #000, #fff)')!.angle).toBe(315);
    expect(parseGradient('linear-gradient(to bottom right, #000, #fff)')!.angle).toBe(135);
  });

  it('defaults the angle to 180deg (CSS to bottom) when omitted', () => {
    expect(parseGradient('linear-gradient(#000000, #ffffff)')!.angle).toBe(180);
  });

  it('distributes omitted positions the CSS way', () => {
    // No positions at all: even spread.
    expect(parseGradient('linear-gradient(90deg, #000, #111, #222)')!.stops.map((s) => s.position)).toEqual([0, 50, 100]);
    // Ends default to 0%/100%, known anchors hold.
    expect(parseGradient('linear-gradient(#ff0000, #0000ff 60%, #00ff00)')!.stops.map((s) => s.position)).toEqual([0, 60, 100]);
    // Interior gaps interpolate between anchors.
    expect(
      parseGradient('linear-gradient(#000 20%, #111, #222, #333 80%)')!
        .stops.map((s) => s.position)
    ).toEqual([20, 40, 60, 80]);
  });

  it('canonicalizes stop colors to hex and keeps alpha', () => {
    expect(parseGradient('linear-gradient(90deg, rgba(255, 0, 0, 0.5) 0%, hsl(120, 100%, 50%) 100%)')!.stops.map((s) => s.color)).toEqual(['#ff000080', '#00ff00']);
  });

  it('normalizes: angle wraps, positions clamp, stops sort', () => {
    const parsed = parseGradient('linear-gradient(450deg, #ffffff 100%, #000000 -5%)')!;
    expect(parsed.angle).toBe(90);
    expect(parsed.stops).toEqual([
      {color: '#000000', position: 0},
      {color: '#ffffff', position: 100},
    ]);
  });

  it('dedupes same-position same-color stops, keeps hard stops', () => {
    const collapsed = parseGradient('linear-gradient(90deg, #000000 0%, #000000 0%, #fff 100%)')!;
    expect(collapsed.stops).toEqual([
      {color: '#000000', position: 0},
      {color: '#ffffff', position: 100},
    ]);
    // Distinct colors at one position are the CSS hard-stop technique.
    const hard = parseGradient('linear-gradient(90deg, #000000 50%, #ffffff 50%)')!;
    expect(hard.stops).toEqual([
      {color: '#000000', position: 50},
      {color: '#ffffff', position: 50},
    ]);
  });

  it('rejects non-linear-gradient strings', () => {
    expect(parseGradient('#ff0000')).toBeNull();
    expect(parseGradient('rgb(255, 0, 0)')).toBeNull();
    expect(parseGradient('radial-gradient(#000, #fff)')).toBeNull();
    expect(parseGradient('conic-gradient(#000, #fff)')).toBeNull();
    expect(parseGradient('repeating-linear-gradient(#000, #fff)')).toBeNull();
    expect(parseGradient('linear-gradient(#000000)')).toBeNull();
    expect(parseGradient('linear-gradient(to right, red, blue)')).toBeNull(); // named colors unsupported
    expect(parseGradient('linear-gradient(')).toBeNull();
    expect(parseGradient('linear-gradient()')).toBeNull();
    expect(parseGradient('')).toBeNull();
  });
});

describe('serializeGradient', () => {
  it('emits the canonical CSS string', () => {
    expect(
      serializeGradient({
        angle: 90,
        stops: [
          {color: '#ff0000', position: 0},
          {color: '#ffffff', position: 100},
        ],
      })
    ).toBe('linear-gradient(90deg, #ff0000 0%, #ffffff 100%)');
  });

  it('normalizes what it is given (wrap, clamp, sort)', () => {
    expect(
      serializeGradient({
        angle: 370,
        stops: [
          {color: '#ffffff', position: 120},
          {color: '#000000', position: -10},
        ],
      })
    ).toBe('linear-gradient(10deg, #000000 0%, #ffffff 100%)');
  });

  it('trims float noise from positions', () => {
    expect(
      serializeGradient({
        angle: 90,
        stops: [
          {color: '#000000', position: 0},
          {color: '#ffffff', position: 99.999999},
        ],
      })
    ).toBe('linear-gradient(90deg, #000000 0%, #ffffff 100%)');
  });
});

describe('normalizeGradient', () => {
  it('is idempotent', () => {
    const once = normalizeGradient({angle: 730, stops: [{color: '#fff', position: 80}, {color: '#000', position: 3}]});
    expect(normalizeGradient(once)).toEqual(once);
  });
});

describe('gradientFromColor', () => {
  it('opens a solid into the default two-stop gradient', () => {
    expect(gradientFromColor({r: 255, g: 0, b: 0})).toEqual({
      angle: 90,
      stops: [
        {color: '#ff0000', position: 0},
        {color: '#ffffff', position: 100},
      ],
    });
    expect(serializeGradient(gradientFromColor({r: 255, g: 0, b: 0, a: 0.5}))).toBe(
      'linear-gradient(90deg, #ff000080 0%, #ffffff 100%)'
    );
  });
});
