import type { ImageCropHandle } from '@/lib/components/ImageCrop';

import { useRef, useState } from 'react';
import { css } from '@linaria/core';
import { useControl } from 'react-use-control';

import { Button } from '@/lib/components/Button';
import { ImageCrop } from '@/lib/components/ImageCrop';

import A11yNote from '../A11yNote';
import PropsTable from '../PropsTable';

import { intro, section, row } from '../styles';

const readout = css`
  margin: 0 0 var(--haze-space-2);
  color: var(--haze-color-text-secondary);
  font-size: var(--haze-text-sm);
  font-family: var(--haze-font-mono);
`;

const cropFrame = css`
  max-width: 360px;
`;

const previewFrame = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-full);
  background: var(--haze-color-bg-subtle);
  overflow: hidden;
`;

const previewImg = css`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const cropActions = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-2);
  margin-top: var(--haze-space-2);
`;

const PHOTO = 'https://picsum.photos/640/360';

const format = (n: number) => `${Math.round(n * 100)}%`;

// ─── ImageCrop ─────────────────────────────────────────────────
export default function ImageCropDemo() {
  const [value, setValue, control] = useControl(undefined, {
    x: 0.1,
    y: 0.1,
    width: 0.8,
    height: 0.8,
  });
  const [avatar, setAvatar] = useState<string | null>(null);
  const avatarRef = useRef<ImageCropHandle>(null);

  return (
    <>
      <h1>ImageCrop</h1>
      <p className={intro}>
        Interactive image cropper — the avatar/photo companion to{' '}
        <code>Upload</code>. The crop rectangle lives in the controllable{' '}
        <code>value</code> as normalized coordinates (0–1 of the image), and{' '}
        <code>ref.getCroppedCanvas()</code> rasterizes it at native resolution.
      </p>

      <div className={section}>
        <h2>Free crop</h2>
        <p className={readout}>
          {`x ${format(value.x)} · y ${format(value.y)} · w ${format(value.width)} · h ${format(value.height)}`}
        </p>
        <div className={cropFrame}>
          <ImageCrop
            src={PHOTO}
            alt='Sample landscape photo'
            value={control}
            onChange={setValue}
            crossOrigin="anonymous"
          />
        </div>
      </div>

      <div className={section}>
        <h2>Avatar crop (aspect + circle)</h2>
        <p className={readout}>
          <code>aspect=&#123;1&#125;</code> locks a square output;{' '}
          <code>shape="circle"</code> masks the preview.
        </p>
        <div className={row}>
          <div className={cropFrame}>
            <ImageCrop
              ref={avatarRef}
              src={PHOTO}
              alt='Sample avatar photo'
              aspect={1}
              shape="circle"
              crossOrigin="anonymous"
            />
            <div className={cropActions}>
              <Button
                size='sm'
                onClick={() => {
                  const canvas = avatarRef.current?.getCroppedCanvas();
                  setAvatar(canvas ? canvas.toDataURL('image/png') : null);
                }}
              >
                Crop &amp; preview
              </Button>
              {avatar ? (
                <span className={previewFrame}>
                  <img className={previewImg} src={avatar} alt="Cropped avatar preview" />
                </span>
              ) : null}
            </div>
          </div>
          <div className={cropFrame}>
            <ImageCrop src={PHOTO} alt="Disabled cropper" disabled />
          </div>
        </div>
      </div>

      <div className={section}>
        <h2>Props</h2>
        <PropsTable of='ImageCropProps' />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              The crop region is a labeled, focusable <code>role="group"</code>:{' '}
              <strong>arrow keys</strong> move it in 1% steps,{' '}
              <strong>Shift + arrow keys</strong> resize — the cropper is fully
              operable without a pointer (WCAG 2.5.7).
            </li>
            <li>
              A visually-hidden description announces the live crop geometry,
              so drags and key steps reach screen readers.
            </li>
            <li>
              The image itself is exposed as <code>role="img"</code> with the{' '}
              <code>alt</code> prop as its accessible name.
            </li>
          </ul>
        </A11yNote>
      </div>
    </>
  );
}
