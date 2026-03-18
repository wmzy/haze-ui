import {css} from '@linaria/core';

export const page = css`
  padding: var(--pbl-space-8);
  max-width: 960px;

  h1 {
    font-size: var(--pbl-text-3xl);
    font-weight: var(--pbl-weight-bold);
    margin: 0 0 var(--pbl-space-2);
  }
`;

export const intro = css`
  font-size: var(--pbl-text-base);
  color: var(--pbl-color-text-secondary);
  margin: 0 0 var(--pbl-space-8);
  line-height: var(--pbl-leading-normal);
`;

export const section = css`
  margin-bottom: var(--pbl-space-8);

  h2 {
    font-size: var(--pbl-text-lg);
    font-weight: var(--pbl-weight-semibold);
    margin: 0 0 var(--pbl-space-3);
    padding-bottom: var(--pbl-space-2);
    border-bottom: 1px solid var(--pbl-color-border);
  }

  h3 {
    font-size: var(--pbl-text-base);
    font-weight: var(--pbl-weight-medium);
    color: var(--pbl-color-text-secondary);
    margin: var(--pbl-space-4) 0 var(--pbl-space-2);
  }
`;

export const row = css`
  display: flex;
  align-items: center;
  gap: var(--pbl-space-3);
  flex-wrap: wrap;
  margin-bottom: var(--pbl-space-4);
`;

export const fieldRow = css`
  max-width: 320px;
  margin-bottom: var(--pbl-space-4);
`;

export const labelStyle = css`
  display: flex;
  align-items: center;
  gap: var(--pbl-space-2);
  font-size: var(--pbl-text-sm);
  color: var(--pbl-color-text);
  cursor: pointer;
`;
