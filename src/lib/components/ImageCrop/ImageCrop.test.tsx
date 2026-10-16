import type { ImageCropHandle, ImageCropProps } from './ImageCrop';

import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { useControl } from 'react-use-control';

import ImageCrop from './ImageCrop';
import {
  fitAspect,
  moveRect,
  normalizeRect,
  pointerToNormalized,
  resizeFromAnchor,
} from './image-crop-geometry';

function createContextStub() {
  return {
    drawImage: vi.fn(),
  };
}

let ctx: ReturnType<typeof createContextStub>;
// module-level mock (the Tour.test precedent): reconfiguring the return
// mid-test must not touch HTMLCanvasElement.prototype.getContext itself
// (unbound-method).
const getContextMock = vi.fn();

beforeEach(() => {
  ctx = createContextStub();
  getContextMock.mockImplementation(
    () => ctx
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    getContextMock
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  getContextMock.mockReset();
});

const FRAME = { left: 0, top: 0, width: 640, height: 360 } as DOMRect;

/** Renders and loads a 640×360 source, pinning the frame rect the pointer
 * math normalizes against. */
function renderLoaded(props: Partial<ImageCropProps> = {}) {
  const view = render(
    <ImageCrop src="crop.jpg" alt="Test image" {...props} />
  );
  loadImage({ width: 640, height: 360 });
  const frame = document.querySelector('[data-slot="crop-frame"]');
  if (frame === null) throw new Error('crop frame not rendered');
  vi.spyOn(frame, 'getBoundingClientRect').mockReturnValue(FRAME);
  return view;
}

function loadImage(size = { width: 640, height: 360 }) {
  const img = document.querySelector('img[data-slot="source"]');
  if (img === null) throw new Error('loader img not rendered');
  Object.defineProperty(img, 'naturalWidth', { value: size.width });
  Object.defineProperty(img, 'naturalHeight', { value: size.height });
  fireEvent.load(img);
  return img;
}

function getBox(label = 'Crop region'): HTMLElement {
  return screen.getByRole('group', { name: label });
}

function getCanvas(): HTMLCanvasElement {
  const canvas = document.querySelector('canvas');
  if (canvas === null) throw new Error('canvas not rendered');
  return canvas;
}

/** last rect reported through onChange */
const lastRect = (onChange: ReturnType<typeof vi.fn>) => {
  const call = onChange.mock.calls.at(-1);
  if (call === undefined) throw new Error('onChange never fired');
  return call[0] as { x: number; y: number; width: number; height: number };
};

describe('ImageCrop', () => {
  it('renders the loaded image on a canvas with a labeled centered crop box', () => {
    renderLoaded();
    const canvas = getCanvas();
    expect(canvas).toHaveAttribute('role', 'img');
    expect(canvas).toHaveAccessibleName('Test image');
    expect(canvas).toHaveAttribute('width', '640');
    expect(canvas).toHaveAttribute('height', '360');
    // painted at natural size — the CSS layer scales it down
    expect(ctx.drawImage).toHaveBeenCalledWith(
      loadImage(),
      0,
      0,
      640,
      360
    );

    const box = getBox();
    expect(box).toHaveStyle({
      left: '10%',
      top: '10%',
      width: '80%',
      height: '80%',
    });
    // four corner handles, pointer affordances hidden from AT
    const corners = box.querySelectorAll('[data-slot="crop-handle"]');
    expect(corners).toHaveLength(4);
    expect(corners[0]).toHaveAttribute('data-corner', 'nw');
    expect(corners[3]).toHaveAttribute('data-corner', 'se');
    expect(corners[0]).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows a skeleton before load and a status notice on error', () => {
    render(<ImageCrop src="crop.jpg" alt="Test image" />);
    expect(document.querySelector('[data-slot="loading"]')).not.toBeNull();
    expect(document.querySelector('canvas')).toBeNull();

    const img = document.querySelector('img[data-slot="source"]');
    fireEvent.error(img!);
    expect(screen.getByRole('status')).toHaveTextContent(
      /failed to load the image/i
    );
    expect(document.querySelector('canvas')).toBeNull();
  });

  it('degrades to a notice when the 2d context is unavailable', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    render(<ImageCrop src="crop.jpg" alt="Test image" />);
    loadImage();
    expect(screen.getByRole('status')).toHaveTextContent(/not supported/i);
    expect(document.querySelector('canvas')).toBeNull();
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
  });

  it('moves the crop with arrow keys in 1% steps and clamps at the edges', () => {
    const onChange = vi.fn();
    renderLoaded({ onChange });
    const box = getBox();

    fireEvent.keyDown(box, { key: 'ArrowRight' });
    fireEvent.keyDown(box, { key: 'ArrowDown' });
    expect(lastRect(onChange)).toEqual({
      x: 0.11,
      y: 0.11,
      width: 0.8,
      height: 0.8,
    });
    expect(box).toHaveStyle({ left: '11%', top: '11%' });

    // hammering past the edge saturates at 0 / 1 - size, never overflows
    for (let i = 0; i < 20; i += 1) {
      fireEvent.keyDown(box, { key: 'ArrowLeft' });
    }
    expect(lastRect(onChange).x).toBe(0);
    for (let i = 0; i < 20; i += 1) {
      fireEvent.keyDown(box, { key: 'ArrowRight' });
    }
    expect(lastRect(onChange).x).toBeCloseTo(0.2, 6);
    // unrelated keys fall through untouched (saturated repeats are
    // already folded away by the commit guard)
    const calls = onChange.mock.calls.length;
    fireEvent.keyDown(box, { key: 'Enter' });
    fireEvent.keyDown(box, { key: ' ' });
    expect(onChange.mock.calls.length).toBe(calls);
  });

  it('resizes with Shift+arrow keys and floors at the minimum size', () => {
    const onChange = vi.fn();
    renderLoaded({ onChange });
    const box = getBox();

    fireEvent.keyDown(box, { key: 'ArrowRight', shiftKey: true });
    expect(lastRect(onChange)).toEqual({
      x: 0.1,
      y: 0.1,
      width: 0.81,
      height: 0.8,
    });
    // growth beyond the image clamps against the position budget
    fireEvent.keyDown(box, { key: 'ArrowRight', shiftKey: true });
    fireEvent.keyDown(box, { key: 'ArrowRight', shiftKey: true });
    expect(lastRect(onChange).width).toBeCloseTo(0.83, 6);
    expect(lastRect(onChange).x).toBeCloseTo(0.1, 6);
    // shrinking floors at MIN_CROP (5%) — one axis per arrow pair
    for (let i = 0; i < 100; i += 1) {
      fireEvent.keyDown(box, { key: 'ArrowLeft', shiftKey: true });
    }
    expect(lastRect(onChange).width).toBe(0.05);
    for (let i = 0; i < 100; i += 1) {
      fireEvent.keyDown(box, { key: 'ArrowUp', shiftKey: true });
    }
    expect(lastRect(onChange).height).toBe(0.05);
  });

  it('locks the aspect ratio and refits consumer rects through it', () => {
    const onChange = vi.fn();
    renderLoaded({ onChange, aspect: 1 });
    const box = getBox();

    // a square crop of a 640×360 image: height saturates at 100%, width
    // re-derives (640/360 · 1 = 0.5625), then recenters
    expect(box).toHaveStyle({
      left: '21.88%',
      top: '0%',
      width: '56.25%',
      height: '100%',
    });

    // growing is a no-op — height has no budget left
    fireEvent.keyDown(box, { key: 'ArrowRight', shiftKey: true });
    expect(onChange).not.toHaveBeenCalled();

    // shrinking keeps the pair consistent
    fireEvent.keyDown(box, { key: 'ArrowLeft', shiftKey: true });
    const shrunk = lastRect(onChange);
    expect(shrunk.width).toBeCloseTo(0.5525, 6);
    expect(shrunk.height).toBeCloseTo(0.5525 * (640 / 360), 5);
  });

  it('refits a stale/unfitting controlled rect before it ever displays', () => {
    render(
      <ImageCrop
        src="crop.jpg"
        alt="Test image"
        aspect={1}
        value={{ x: 0, y: 0, width: 0.8, height: 0.2 }}
      />
    );
    loadImage();
    expect(getBox()).toHaveStyle({
      left: '0%',
      top: '0%',
      width: '56.25%',
      height: '100%',
    });
  });

  it('drags the box with pointer events and clamps inside the image', () => {
    const onChange = vi.fn();
    renderLoaded({ onChange });
    const box = getBox();

    fireEvent.pointerDown(box, { pointerId: 1, clientX: 64, clientY: 36 });
    fireEvent.pointerMove(box, { pointerId: 1, clientX: 128, clientY: 72 });
    fireEvent.pointerUp(box, { pointerId: 1, clientX: 128, clientY: 72 });
    // +64px/+36px on a 640×360 frame = +10%/+10%
    expect(lastRect(onChange)).toEqual({
      x: 0.2,
      y: 0.2,
      width: 0.8,
      height: 0.8,
    });

    // dragged off the right edge: x saturates at 1 - width
    fireEvent.pointerDown(box, { pointerId: 1, clientX: 128, clientY: 72 });
    fireEvent.pointerMove(box, { pointerId: 1, clientX: 5000, clientY: 72 });
    fireEvent.pointerUp(box, { pointerId: 1, clientX: 5000, clientY: 72 });
    expect(lastRect(onChange).x).toBeCloseTo(0.2, 6);
  });

  it('resizes through each corner handle, anchored at the opposite corner', () => {
    const onChange = vi.fn();
    renderLoaded({ onChange });
    const box = getBox();

    // se: anchor (0.1, 0.1); dragging to the frame center yields 0.4×0.4
    const se = box.querySelector('[data-corner="se"]')!;
    fireEvent.pointerDown(se, { pointerId: 1, clientX: 576, clientY: 324 });
    fireEvent.pointerMove(se, { pointerId: 1, clientX: 320, clientY: 180 });
    fireEvent.pointerUp(se, { pointerId: 1, clientX: 320, clientY: 180 });
    expect(lastRect(onChange)).toEqual({
      x: 0.1,
      y: 0.1,
      width: 0.4,
      height: 0.4,
    });

    // nw: anchor is the bottom-right corner of the now-0.4-sized box
    // (0.5, 0.5) — dragging up-left grows the box from there
    const nw = box.querySelector('[data-corner="nw"]')!;
    fireEvent.pointerDown(nw, { pointerId: 1, clientX: 64, clientY: 36 });
    fireEvent.pointerMove(nw, { pointerId: 1, clientX: 128, clientY: 72 });
    fireEvent.pointerUp(nw, { pointerId: 1, clientX: 128, clientY: 72 });
    expect(lastRect(onChange)).toEqual({
      x: 0.2,
      y: 0.2,
      width: 0.3,
      height: 0.3,
    });
  });

  it('keeps the aspect through handle drags', () => {
    const onChange = vi.fn();
    renderLoaded({ onChange, aspect: 1 });
    const box = getBox();

    // start {x: 0.21875, y: 0, w: 0.5625, h: 1}; se anchor (0.21875, 0)
    const se = box.querySelector('[data-corner="se"]')!;
    fireEvent.pointerDown(se, { pointerId: 1, clientX: 500, clientY: 360 });
    fireEvent.pointerMove(se, { pointerId: 1, clientX: 384, clientY: 144 });
    fireEvent.pointerUp(se, { pointerId: 1, clientX: 384, clientY: 144 });
    const rect = lastRect(onChange);
    expect(rect.x).toBeCloseTo(0.21875, 6);
    expect(rect.y).toBe(0);
    expect(rect.width).toBeCloseTo(0.38125, 6);
    expect(rect.height).toBeCloseTo(0.38125 * (640 / 360), 5);
  });

  it('ignores pointer moves from other pointers mid-gesture', () => {
    const onChange = vi.fn();
    renderLoaded({ onChange });
    const box = getBox();

    fireEvent.pointerDown(box, { pointerId: 1, clientX: 64, clientY: 36 });
    fireEvent.pointerMove(box, { pointerId: 2, clientX: 320, clientY: 180 });
    fireEvent.pointerMove(box, { pointerId: 1, clientX: 128, clientY: 72 });
    fireEvent.pointerUp(box, { pointerId: 1, clientX: 128, clientY: 72 });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(lastRect(onChange).x).toBeCloseTo(0.2, 6);
  });

  it('locks dragging and keyboard operation when disabled', () => {
    const onChange = vi.fn();
    renderLoaded({ onChange, disabled: true });
    const box = getBox();
    expect(box).toHaveAttribute('aria-disabled', 'true');
    expect(box).toHaveAttribute('tabindex', '-1');

    fireEvent.keyDown(box, { key: 'ArrowRight' });
    fireEvent.pointerDown(box, { pointerId: 1, clientX: 64, clientY: 36 });
    fireEvent.pointerMove(box, { pointerId: 1, clientX: 320, clientY: 180 });
    fireEvent.pointerUp(box, { pointerId: 1, clientX: 320, clientY: 180 });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('pushes commits into a controlled value', () => {
    function Controlled() {
      const [value, setValue, control] = useControl(undefined, {
        x: 0.1,
        y: 0.1,
        width: 0.8,
        height: 0.8,
      });
      return (
        <>
          <ImageCrop src="crop.jpg" alt="Test image" value={control} onChange={setValue} />
          <output data-testid="committed">
            {`${value.x.toFixed(2)},${value.y.toFixed(2)},${value.width.toFixed(2)}`}
          </output>
        </>
      );
    }
    render(<Controlled />);
    loadImage();
    expect(screen.getByTestId('committed')).toHaveTextContent('0.10,0.10,0.80');
    fireEvent.keyDown(getBox(), { key: 'ArrowRight' });
    expect(screen.getByTestId('committed')).toHaveTextContent('0.11,0.10,0.80');
  });

  it('applies className and forwards native props to the root', () => {
    render(
      <ImageCrop src="crop.jpg" alt="Test image" className="custom" data-testid="cropper" />
    );
    loadImage();
    const root = screen.getByTestId('cropper');
    expect(root).toHaveClass('custom');
    expect(root).toHaveAttribute('data-slot', 'image-crop');
  });

  it('accepts a custom crop label and circle shape', () => {
    renderLoaded({ cropLabel: 'Photo crop', shape: 'circle' });
    const box = getBox('Photo crop');
    expect(box).toHaveAttribute('data-shape', 'circle');
  });

  describe('getCroppedCanvas', () => {
    it('rasterizes the current crop at natural resolution', () => {
      const ref = createRef<ImageCropHandle>();
      render(
        <ImageCrop ref={ref} src="crop.jpg" alt="Test image" aspect={1} />
      );
      const img = loadImage();
      const canvas = ref.current!.getCroppedCanvas()!;
      expect(canvas).toBeInstanceOf(HTMLCanvasElement);
      // aspect=1 default on 640×360: 0.5625·640 × 1·360 = 360×360
      expect(canvas.width).toBe(360);
      expect(canvas.height).toBe(360);
      expect(ctx.drawImage).toHaveBeenCalledWith(
        img,
        0.21875 * 640,
        0,
        0.5625 * 640,
        360,
        0,
        0,
        360,
        360
      );
    });

    it('reflects the latest committed rect', () => {
      const ref = createRef<ImageCropHandle>();
      render(<ImageCrop ref={ref} src="crop.jpg" alt="Test image" />);
      const img = loadImage();
      fireEvent.keyDown(getBox(), { key: 'ArrowRight' });
      fireEvent.keyDown(getBox(), { key: 'ArrowDown' });
      const canvas = ref.current!.getCroppedCanvas()!;
      expect(canvas.width).toBe(512);
      expect(canvas.height).toBe(288);
      expect(ctx.drawImage).toHaveBeenLastCalledWith(
        img,
        0.11 * 640,
        0.11 * 360,
        0.8 * 640,
        0.8 * 360,
        0,
        0,
        512,
        288
      );
    });

    it('returns null before load and without a 2d context', () => {
      const ref = createRef<ImageCropHandle>();
      render(<ImageCrop ref={ref} src="crop.jpg" alt="Test image" />);
      expect(ref.current!.getCroppedCanvas()).toBeNull();

      loadImage();
      // the output canvas is created fresh per call — a missing context
      // there must surface as null, not as an empty bitmap
      getContextMock.mockReturnValue(null);
      expect(ref.current!.getCroppedCanvas()).toBeNull();
    });
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    const { container } = renderLoaded();
    const results = await axe(container, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('image-crop-geometry', () => {
  const natural = { width: 640, height: 360 };

  it('fitAspect saturates height then re-derives width', () => {
    expect(fitAspect({ x: 0, y: 0, width: 0.8, height: 0.2 }, 1, natural)).toEqual({
      x: 0,
      y: 0,
      width: 0.5625,
      height: 1,
    });
    // wide crop on a wide image: height derives without saturating
    expect(fitAspect({ x: 0, y: 0, width: 0.5, height: 0.5 }, 640 / 360, natural)).toEqual({
      x: 0,
      y: 0,
      width: 0.5,
      height: 0.5,
    });
  });

  it('normalizeRect clamps sizes and position into the unit square', () => {
    expect(
      normalizeRect({ x: -0.2, y: 0.9, width: 1.5, height: 0.03 }, undefined, natural)
    ).toEqual({ x: 0, y: 0.9, width: 1, height: 0.05 });
  });

  it('moveRect freezes size and clamps translation', () => {
    expect(moveRect({ x: 0.95, y: 0, width: 0.2, height: 0.2 }, 0.5, -1)).toEqual({
      x: 0.8,
      y: 0,
      width: 0.2,
      height: 0.2,
    });
  });

  it('resizeFromAnchor floors at the minimum instead of inverting', () => {
    const start = { x: 0.4, y: 0.4, width: 0.2, height: 0.2 };
    // se drag collapsing onto the anchor: size floors, anchor position holds
    expect(resizeFromAnchor(start, 'se', { x: 0.41, y: 0.41 }, undefined, natural)).toEqual({
      x: 0.4,
      y: 0.4,
      width: 0.05,
      height: 0.05,
    });
  });

  it('pointerToNormalized maps client into frame space and guards zero rects', () => {
    expect(pointerToNormalized(120, 80, { left: 100, top: 50, width: 200, height: 100 } as DOMRect)).toEqual({
      x: 0.1,
      y: 0.3,
    });
    expect(pointerToNormalized(10, 10, { left: 0, top: 0, width: 0, height: 0 } as DOMRect)).toEqual({
      x: 10,
      y: 10,
    });
  });
});
