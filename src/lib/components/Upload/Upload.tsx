import type { ReactNode } from 'react';

import { css } from '@linaria/core';
import { useRef, useCallback } from 'react';

type UploadProps = {
  accept?: string;
  multiple?: boolean;
  onChange?: (files: File[]) => void;
  className?: string;
  children?: ReactNode;
};

const dropzone = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--haze-space-8) var(--haze-space-4);
  border: 2px dashed var(--haze-color-border);
  border-radius: var(--haze-radius-lg);
  background: var(--haze-color-bg-subtle);
  color: var(--haze-color-text-muted);
  font-family: var(--haze-font-sans);
  font-size: var(--haze-text-sm);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  text-align: center;

  &:hover {
    border-color: var(--haze-color-primary);
    background: var(--haze-color-primary-subtle);
  }
`;

const iconStyle = css`
  margin-bottom: var(--haze-space-3);
  color: var(--haze-color-text-muted);
`;

const hiddenInput = css`
  display: none;
`;

export default function Upload({
  accept,
  multiple = false,
  onChange,
  className,
  children,
}: UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) onChange?.(files);
      e.target.value = '';
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) onChange?.(files);
    },
    [onChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div
      x-class={[dropzone, className]}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      role="button"
      tabIndex={0}
    >
      <input
        ref={inputRef}
        x-class={[hiddenInput]}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
      />
      {children || (
        <>
          <svg x-class={[iconStyle]} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <div>Drag & drop files here, or click to upload</div>
        </>
      )}
    </div>
  );
}

export type { UploadProps };
