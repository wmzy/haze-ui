import type { ReactElement } from 'react';

import { expect } from 'vitest';
import { render, screen, fireEvent, act, waitFor, within } from '@testing-library/react';
import { useControl } from 'react-use-control';

import LocaleProvider from '../LocaleProvider';

import Image from './Image';
import ImagePreviewGroup from './ImagePreviewGroup';

beforeEach(() => {
  // jsdom does not implement showModal/close for HTMLDialogElement
  // (same mock shape as Dialog.test.tsx).
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement
  ) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (
    this: HTMLDialogElement
  ) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  });
});

describe('Image', () => {
  it('renders an image with src and alt', () => {
    render(<Image src="photo.jpg" alt="A photo" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'photo.jpg');
    expect(img).toHaveAttribute('alt', 'A photo');
  });

  it('applies className to wrapper', () => {
    const { container } = render(<Image src="photo.jpg" alt="test" className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('applies aspectRatio style', () => {
    const { container } = render(<Image src="photo.jpg" alt="test" aspectRatio="16/9" />);
    expect(container.firstChild).toHaveStyle({ aspectRatio: '16/9' });
  });

  it('applies objectFit style to img', () => {
    render(<Image src="photo.jpg" alt="test" objectFit="contain" />);
    expect(screen.getByRole('img')).toHaveStyle({ objectFit: 'contain' });
  });

  it('shows fallback when image errors', () => {
    render(<Image src="broken.jpg" alt="test" fallback={<span data-testid="fb">Error</span>} />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByTestId('fb')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('still shows img when error but no fallback', () => {
    render(<Image src="broken.jpg" alt="test" />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('forwards native img props', () => {
    render(
      <Image
        src="photo.jpg"
        alt="test"
        loading="lazy"
        decoding="async"
        srcSet="photo@2x.jpg 2x"
        sizes="(min-width: 600px) 600px, 100vw"
        crossOrigin="anonymous"
        data-testid="hero-img"
      />,
    );
    const img = screen.getByTestId('hero-img');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
    expect(img).toHaveAttribute('srcset', 'photo@2x.jpg 2x');
    expect(img).toHaveAttribute('sizes', '(min-width: 600px) 600px, 100vw');
    expect(img).toHaveAttribute('crossorigin', 'anonymous');
  });

  it('merges forwarded style with objectFit on the img', () => {
    render(<Image src="photo.jpg" alt="test" style={{ borderRadius: '4px' }} />);
    expect(screen.getByRole('img')).toHaveStyle({
      borderRadius: '4px',
      objectFit: 'cover',
    });
  });

  it('calls forwarded onError before showing fallback', () => {
    const onError = vi.fn();
    render(
      <Image
        src="broken.jpg"
        alt="test"
        onError={onError}
        fallback={<span data-testid="fb">Error</span>}
      />,
    );
    fireEvent.error(screen.getByRole('img'));
    expect(onError).toHaveBeenCalledOnce();
    expect(screen.getByTestId('fb')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<Image src="photo.jpg" alt="A photo" aspectRatio="16/9" />);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('renders no preview dialog by default and ignores clicks', () => {
    const { container } = render(<Image src="photo.jpg" alt="A photo" />);
    // Structure unchanged from the pre-preview component: one span root,
    // one img, no dialog anywhere in the tree.
    expect(container.firstChild?.nodeName).toBe('SPAN');
    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect(container.querySelector('dialog')).toBeNull();
    fireEvent.click(screen.getByRole('img'));
    expect(container.querySelector('dialog')).toBeNull();
  });
});

describe('Image preview', () => {
  /** The thumbnail img — the one outside the (always-mounted) dialog. */
  const getThumb = (): HTMLElement => {
    const thumb = screen
      .getAllByRole('img')
      .find((el) => el.closest('dialog') === null);
    if (!thumb) throw new Error('thumbnail img not found');
    return thumb;
  };

  const getDialog = () =>
    screen.getByRole<HTMLDialogElement>('dialog', { hidden: true });

  /** Renders, clicks the thumbnail, returns the now-open dialog. */
  const openPreview = (ui?: ReactElement) => {
    render(ui ?? <Image src="photo.jpg" alt="A photo" preview />);
    fireEvent.click(getThumb());
    const dialog = getDialog();
    expect(dialog).toHaveAttribute('open');
    return dialog;
  };

  /** The large image inside the preview dialog. */
  const getPreviewImg = (dialog: HTMLDialogElement) =>
    within(dialog).getByRole('img');

  it('keeps the span wrapper structure when preview is enabled', () => {
    const { container } = render(
      <Image src="photo.jpg" alt="A photo" preview className="custom" />
    );
    expect(container.firstChild?.nodeName).toBe('SPAN');
    expect(container.firstChild).toHaveClass('custom');
  });

  it('opens the preview on click with alt as the dialog label', () => {
    const dialog = openPreview();
    expect(dialog).toHaveAttribute('aria-label', 'A photo');
  });

  it('fires a forwarded onClick and still opens the preview', () => {
    const onClick = vi.fn();
    openPreview(
      <Image src="photo.jpg" alt="A photo" preview onClick={onClick} />
    );
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('moves initial focus to the toolbar close button', () => {
    openPreview();
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
  });

  it('closes on Escape through the animated path and returns focus to the image', async () => {
    const dialog = openPreview();
    const cancel = new Event('cancel', { cancelable: true });
    act(() => {
      dialog.dispatchEvent(cancel);
    });
    expect(cancel.defaultPrevented).toBe(true);
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
    expect(getThumb()).toHaveFocus();
  });

  it('closes via the toolbar close button', async () => {
    const dialog = openPreview();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
  });

  it('closes on backdrop click but not on image click', async () => {
    const dialog = openPreview();
    fireEvent.click(getPreviewImg(dialog));
    expect(dialog).toHaveAttribute('open');
    fireEvent.click(dialog);
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
  });

  it('zooms in and out in 25% steps with the buttons', () => {
    const dialog = openPreview();
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(getPreviewImg(dialog)).toHaveStyle({
      transform: 'translate(0px, 0px) scale(1.25) rotate(0deg)',
    });
    fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
    expect(getPreviewImg(dialog)).toHaveStyle({
      transform: 'translate(0px, 0px) scale(1) rotate(0deg)',
    });
  });

  it('clamps zoom to 25%–400% via wheel and disables buttons at the bounds', () => {
    const dialog = openPreview();
    for (let i = 0; i < 30; i += 1) {
      fireEvent.wheel(dialog, { deltaY: -100 });
    }
    expect(getPreviewImg(dialog)).toHaveStyle({
      transform: 'translate(0px, 0px) scale(4) rotate(0deg)',
    });
    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeEnabled();
    for (let i = 0; i < 40; i += 1) {
      fireEvent.wheel(dialog, { deltaY: 100 });
    }
    expect(getPreviewImg(dialog)).toHaveStyle({
      transform: 'translate(0px, 0px) scale(0.25) rotate(0deg)',
    });
    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeDisabled();
  });

  it('rotates in 90° steps and wraps back to 0° after a full turn', () => {
    const dialog = openPreview();
    const rotate = screen.getByRole('button', { name: 'Rotate' });
    fireEvent.click(rotate);
    expect(getPreviewImg(dialog)).toHaveStyle({
      transform: 'translate(0px, 0px) scale(1) rotate(90deg)',
    });
    fireEvent.click(rotate);
    fireEvent.click(rotate);
    fireEvent.click(rotate);
    expect(getPreviewImg(dialog)).toHaveStyle({
      transform: 'translate(0px, 0px) scale(1) rotate(0deg)',
    });
  });

  it('resets zoom, rotation and pan back to 1:1', () => {
    const dialog = openPreview();
    const img = getPreviewImg(dialog);
    fireEvent.wheel(dialog, { deltaY: -100 });
    fireEvent.click(screen.getByRole('button', { name: 'Rotate' }));
    fireEvent.pointerDown(img, {
      button: 0,
      pointerId: 1,
      clientX: 100,
      clientY: 100,
    });
    fireEvent.pointerMove(img, { pointerId: 1, clientX: 150, clientY: 130 });
    fireEvent.pointerUp(img, { pointerId: 1 });
    expect(img).toHaveStyle({
      transform: 'translate(50px, 30px) scale(1.25) rotate(90deg)',
    });
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(img).toHaveStyle({
      transform: 'translate(0px, 0px) scale(1) rotate(0deg)',
    });
  });

  it('pans the image by dragging', () => {
    const dialog = openPreview();
    const img = getPreviewImg(dialog);
    fireEvent.pointerDown(img, {
      button: 0,
      pointerId: 1,
      clientX: 100,
      clientY: 100,
    });
    fireEvent.pointerMove(img, { pointerId: 1, clientX: 140, clientY: 110 });
    fireEvent.pointerMove(img, { pointerId: 1, clientX: 160, clientY: 125 });
    fireEvent.pointerUp(img, { pointerId: 1 });
    expect(img).toHaveStyle({
      transform: 'translate(60px, 25px) scale(1) rotate(0deg)',
    });
  });

  it('resets the transform state when reopened', async () => {
    const dialog = openPreview();
    fireEvent.wheel(dialog, { deltaY: -100 });
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
    fireEvent.click(getThumb());
    expect(dialog).toHaveAttribute('open');
    expect(getPreviewImg(dialog)).toHaveStyle({
      transform: 'translate(0px, 0px) scale(1) rotate(0deg)',
    });
  });

  it('hides the rotate control when preview.rotate is false', () => {
    openPreview(<Image src="photo.jpg" alt="A photo" preview={{ rotate: false }} />);
    expect(screen.queryByRole('button', { name: 'Rotate' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeInTheDocument();
  });

  it('drops zoom controls, wheel zoom and pan when preview.zoom is false', () => {
    const dialog = openPreview(
      <Image src="photo.jpg" alt="A photo" preview={{ zoom: false }} />
    );
    expect(screen.queryByRole('button', { name: 'Zoom in' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Zoom out' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Reset' })).toBeNull();
    fireEvent.wheel(dialog, { deltaY: -100 });
    expect(getPreviewImg(dialog)).toHaveStyle({
      transform: 'translate(0px, 0px) scale(1) rotate(0deg)',
    });
  });

  it('sources toolbar labels from the locale pack', () => {
    render(
      <LocaleProvider locale="zh-CN">
        <Image src="photo.jpg" alt="照片" preview />
      </LocaleProvider>
    );
    fireEvent.click(getThumb());
    expect(screen.getByRole('button', { name: '放大' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '缩小' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '重置' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '旋转' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '关闭' })).toBeInTheDocument();
  });

  it('has no axe violations with the preview open', async () => {
    const { axe } = await import('jest-axe');
    openPreview();
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('Image preview group', () => {
  const GALLERY = [
    { src: 'one.jpg', alt: 'One' },
    { src: 'two.jpg', alt: 'Two' },
    { src: 'three.jpg', alt: 'Three' },
  ];

  /** The gallery thumbnails — imgs outside the (always-mounted) dialog. */
  const getThumb = (nth: number): HTMLElement => {
    const thumbs = screen
      .getAllByRole('img')
      .filter((el) => el.closest('dialog') === null);
    const thumb = thumbs[nth];
    if (!thumb) throw new Error(`gallery thumbnail ${nth} not found`);
    return thumb;
  };

  const renderGroup = (ui?: ReactElement) =>
    render(
      ui ?? (
        <ImagePreviewGroup>
          {GALLERY.map((image) => (
            <Image key={image.src} src={image.src} alt={image.alt} preview />
          ))}
        </ImagePreviewGroup>
      )
    );

  /** Renders, clicks the nth gallery thumbnail, returns the open dialog. */
  const openGalleryAt = (nth: number, ui?: ReactElement) => {
    renderGroup(ui);
    fireEvent.click(getThumb(nth));
    const dialog = getDialog();
    expect(dialog).toHaveAttribute('open');
    return dialog;
  };

  const getDialog = () =>
    screen.getByRole<HTMLDialogElement>('dialog', { hidden: true });

  /** The large image inside the preview dialog (strip thumbs carry no role). */
  const getActiveImg = (dialog: HTMLDialogElement) =>
    within(dialog).getByRole('img');

  const getNext = (dialog: HTMLDialogElement) =>
    within(dialog).getByRole('button', { name: 'Next image' });

  const getPrev = (dialog: HTMLDialogElement) =>
    within(dialog).getByRole('button', { name: 'Previous image' });

  /** The nth strip button (aria-labels read 'View image n of 3: …'). */
  const getStripButton = (dialog: HTMLDialogElement, nth: number) => {
    const buttons = within(dialog).getAllByRole<HTMLButtonElement>('button', {
      name: /View image/,
    });
    const button = buttons[nth];
    if (!button) throw new Error(`strip button ${nth} not found`);
    return button;
  };

  it('opens a single shared overlay on the clicked image', () => {
    const dialog = openGalleryAt(1);
    // One overlay for the whole group, not one per child Image.
    expect(document.querySelectorAll('dialog')).toHaveLength(1);
    expect(getActiveImg(dialog)).toHaveAttribute('src', 'two.jpg');
    expect(dialog).toHaveAttribute('aria-label', 'Two');
  });

  it('navigates with the prev/next buttons and wraps at both ends', () => {
    const dialog = openGalleryAt(0);
    const counter = within(dialog).getByText('1 / 3');
    fireEvent.click(getNext(dialog));
    expect(getActiveImg(dialog)).toHaveAttribute('src', 'two.jpg');
    expect(counter).toHaveTextContent('2 / 3');
    fireEvent.click(getPrev(dialog));
    expect(getActiveImg(dialog)).toHaveAttribute('src', 'one.jpg');
    // wrap backwards from the first to the last…
    fireEvent.click(getPrev(dialog));
    expect(getActiveImg(dialog)).toHaveAttribute('src', 'three.jpg');
    expect(counter).toHaveTextContent('3 / 3');
    // …and forwards from the last to the first
    fireEvent.click(getNext(dialog));
    expect(getActiveImg(dialog)).toHaveAttribute('src', 'one.jpg');
  });

  it('navigates with ArrowLeft/ArrowRight and wraps at the ends', () => {
    const dialog = openGalleryAt(0);
    fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    expect(getActiveImg(dialog)).toHaveAttribute('src', 'two.jpg');
    fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    expect(getActiveImg(dialog)).toHaveAttribute('src', 'one.jpg');
    fireEvent.keyDown(dialog, { key: 'ArrowLeft' });
    expect(getActiveImg(dialog)).toHaveAttribute('src', 'three.jpg');
    expect(within(dialog).getByText('3 / 3')).toBeInTheDocument();
  });

  it('resets the transform when navigation switches images', () => {
    const dialog = openGalleryAt(0);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Zoom in' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Rotate' }));
    fireEvent.click(getNext(dialog));
    expect(getActiveImg(dialog)).toHaveAttribute('src', 'two.jpg');
    expect(getActiveImg(dialog)).toHaveStyle({
      transform: 'translate(0px, 0px) scale(1) rotate(0deg)',
    });
  });

  it('syncs the thumbnail strip and jumps on thumbnail clicks', () => {
    const dialog = openGalleryAt(0);
    const first = getStripButton(dialog, 0);
    const third = getStripButton(dialog, 2);
    expect(within(dialog).getAllByRole('button', { name: /View image/ })).toHaveLength(3);
    expect(first).toHaveAttribute('aria-current', 'true');
    fireEvent.click(third);
    expect(getActiveImg(dialog)).toHaveAttribute('src', 'three.jpg');
    expect(first).not.toHaveAttribute('aria-current');
    expect(third).toHaveAttribute('aria-current', 'true');
    // navigation from the strip syncs back: next wraps to the first
    fireEvent.click(getNext(dialog));
    expect(first).toHaveAttribute('aria-current', 'true');
    expect(third).not.toHaveAttribute('aria-current');
  });

  it('drops the thumbnail strip with showThumbnails=false', () => {
    const dialog = openGalleryAt(
      0,
      <ImagePreviewGroup showThumbnails={false}>
        {GALLERY.map((image) => (
          <Image key={image.src} src={image.src} alt={image.alt} preview />
        ))}
      </ImagePreviewGroup>
    );
    expect(
      within(dialog).queryAllByRole('button', { name: /View image/ })
    ).toHaveLength(0);
    expect(getNext(dialog)).toBeInTheDocument();
    expect(within(dialog).getByText('1 / 3')).toBeInTheDocument();
  });

  it('supports a controlled index control', () => {
    function Harness() {
      const [index, setIndex, control] = useControl(undefined, 1);
      return (
        <ImagePreviewGroup index={control}>
          {GALLERY.map((image) => (
            <Image key={image.src} src={image.src} alt={image.alt} preview />
          ))}
          <output data-testid="index">{index}</output>
          <button type="button" onClick={() => setIndex(2)}>
            jump
          </button>
        </ImagePreviewGroup>
      );
    }
    const dialog = openGalleryAt(0, <Harness />);
    // opening at child 0 commits through the control
    expect(screen.getByTestId('index')).toHaveTextContent('0');
    expect(getActiveImg(dialog)).toHaveAttribute('src', 'one.jpg');
    // overlay navigation drives the control
    fireEvent.click(getNext(dialog));
    expect(screen.getByTestId('index')).toHaveTextContent('1');
    expect(getActiveImg(dialog)).toHaveAttribute('src', 'two.jpg');
    // external writes drive the overlay back
    fireEvent.click(screen.getByRole('button', { name: 'jump' }));
    expect(getActiveImg(dialog)).toHaveAttribute('src', 'three.jpg');
    expect(within(dialog).getByText('3 / 3')).toBeInTheDocument();
  });

  it('keeps the single-image shape for a one-image group', () => {
    const dialog = openGalleryAt(
      0,
      <ImagePreviewGroup>
        <Image src="solo.jpg" alt="Solo" preview />
      </ImagePreviewGroup>
    );
    expect(getActiveImg(dialog)).toHaveAttribute('src', 'solo.jpg');
    expect(within(dialog).queryByRole('button', { name: 'Next image' })).toBeNull();
    expect(within(dialog).queryByRole('button', { name: 'Previous image' })).toBeNull();
    expect(within(dialog).queryByText(/\/ 1/)).toBeNull();
    expect(
      within(dialog).queryAllByRole('button', { name: /View image/ })
    ).toHaveLength(0);
  });

  it('leaves preview={false} children out of the gallery', () => {
    renderGroup(
      <ImagePreviewGroup>
        <Image src="one.jpg" alt="One" preview />
        <Image src="skip.jpg" alt="Skip" />
      </ImagePreviewGroup>
    );
    // the inert child never opens anything…
    fireEvent.click(getThumb(1));
    expect(getDialog()).not.toHaveAttribute('open');
    // …while participating children open the shared overlay
    fireEvent.click(getThumb(0));
    expect(getDialog()).toHaveAttribute('open');
    expect(getActiveImg(getDialog())).toHaveAttribute('src', 'one.jpg');
  });

  it('applies the group preview config to the shared overlay', () => {
    const dialog = openGalleryAt(
      0,
      <ImagePreviewGroup preview={{ rotate: false }}>
        {GALLERY.map((image) => (
          <Image key={image.src} src={image.src} alt={image.alt} preview />
        ))}
      </ImagePreviewGroup>
    );
    expect(within(dialog).queryByRole('button', { name: 'Rotate' })).toBeNull();
    expect(within(dialog).getByRole('button', { name: 'Zoom in' })).toBeInTheDocument();
  });

  it('disables every child preview with preview={false} on the group', () => {
    renderGroup(
      <ImagePreviewGroup preview={false}>
        <Image src="one.jpg" alt="One" preview />
      </ImagePreviewGroup>
    );
    fireEvent.click(getThumb(0));
    // no overlay anywhere: the group renders none and the child does
    // not fall back to a standalone one
    expect(screen.queryByRole('dialog', { hidden: true })).toBeNull();
  });

  it('sources gallery labels from the locale pack', () => {
    const dialog = openGalleryAt(
      0,
      <LocaleProvider locale="zh-CN">
        <ImagePreviewGroup>
          {GALLERY.map((image) => (
            <Image key={image.src} src={image.src} alt={image.alt} preview />
          ))}
        </ImagePreviewGroup>
      </LocaleProvider>
    );
    expect(within(dialog).getByRole('button', { name: '上一张' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: '下一张' })).toBeInTheDocument();
    expect(within(dialog).getByText('1 / 3')).toBeInTheDocument();
  });

  it('returns focus to the clicked image on close', async () => {
    const dialog = openGalleryAt(2);
    const cancel = new Event('cancel', { cancelable: true });
    act(() => {
      dialog.dispatchEvent(cancel);
    });
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
    expect(getThumb(2)).toHaveFocus();
  });

  it('has no axe violations with the gallery open', async () => {
    const { axe } = await import('jest-axe');
    openGalleryAt(1);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
