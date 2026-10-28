import type { AgenticStatusLabels } from './agentic-status';

import { agenticStatusLabel, agenticStatusTone } from './agentic-status';

describe('agentic-status', () => {
  it('maps every status onto a distinct semantic tone', () => {
    expect(agenticStatusTone).toEqual({
      pending: 'muted',
      running: 'primary',
      done: 'success',
      error: 'danger',
    });
    expect(new Set(Object.values(agenticStatusTone)).size).toBe(4);
  });

  it('reads the localized word for each status from the locale section', () => {
    const labels: AgenticStatusLabels = {
      pending: 'Pending',
      running: 'Running...',
      done: 'Done',
      error: 'Error',
    };
    expect(agenticStatusLabel('pending', labels)).toBe('Pending');
    expect(agenticStatusLabel('running', labels)).toBe('Running...');
    expect(agenticStatusLabel('done', labels)).toBe('Done');
    expect(agenticStatusLabel('error', labels)).toBe('Error');
  });

  it('covers every status of the union', () => {
    const labels: AgenticStatusLabels = {
      pending: 'p',
      running: 'r',
      done: 'd',
      error: 'e',
    };
    const statuses = ['pending', 'running', 'done', 'error'] as const;
    for (const status of statuses) {
      expect(agenticStatusLabel(status, labels)).toBeTruthy();
      expect(agenticStatusTone[status]).toBeTruthy();
    }
  });
});
