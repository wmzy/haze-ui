import { css } from '@linaria/core';

export const page = css`
  padding: var(--haze-space-8);
  max-width: 960px;

  h1 {
    font-size: var(--haze-text-3xl);
    font-weight: var(--haze-weight-bold);
    margin: 0 0 var(--haze-space-2);
  }
`;

export const intro = css`
  font-size: var(--haze-text-base);
  color: var(--haze-color-text-secondary);
  margin: 0 0 var(--haze-space-8);
  line-height: var(--haze-leading-normal);
`;

export const section = css`
  margin-bottom: var(--haze-space-8);

  h2 {
    font-size: var(--haze-text-lg);
    font-weight: var(--haze-weight-semibold);
    margin: 0 0 var(--haze-space-3);
    padding-bottom: var(--haze-space-2);
    border-bottom: 1px solid var(--haze-color-border);
  }

  h3 {
    font-size: var(--haze-text-base);
    font-weight: var(--haze-weight-medium);
    color: var(--haze-color-text-secondary);
    margin: var(--haze-space-4) 0 var(--haze-space-2);
  }
`;

export const row = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-3);
  flex-wrap: wrap;
  margin-bottom: var(--haze-space-4);
`;

export const fieldRow = css`
  max-width: 320px;
  margin-bottom: var(--haze-space-4);
`;

export const labelStyle = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-2);
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text);
  cursor: pointer;
`;

export const codeBlock = css`
  display: block;
  background: var(--haze-color-bg-subtle);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  padding: var(--haze-space-3) var(--haze-space-4);
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre;
  color: var(--haze-color-text);
  margin: var(--haze-space-2) 0;
`;
