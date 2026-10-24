import type { GuideBlock } from '@/views/Guides/guide-content';

import { render, screen } from '@testing-library/react';
import { expect } from 'vitest';

import { LOCALE_STORAGE_KEY, SiteLocaleProvider } from '@/views/i18n';
import { GUIDE_CONTENT } from '@/views/Guides/guide-content';

import A11yStatementGuide from './index';

/*
 * /guides/a11y-statement 冒烟：四个报告章节都在，判定词汇与两条读屏
 * CI job 渲染出来；zh 下中文标题/章节名与实测数字照常出现；并且
 * WCAG 2.2 的 55 条 A/AA 条款每条都带三档判定之一（行数守恒）。
 */

function renderAt(element: React.ReactElement, locale: 'en' | 'zh') {
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  return render(<SiteLocaleProvider>{element}</SiteLocaleProvider>);
}

describe('A11yStatement guide page', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('renders the report sections, judgment vocabulary and both SR CI jobs', () => {
    renderAt(<A11yStatementGuide />, 'en');

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Accessibility conformance (WCAG 2.2)',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Scope and method' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'WCAG 2.2 Level A and AA' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Assistive technology support' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Known limitations' })
    ).toBeInTheDocument();

    // Judgment vocabulary renders in the criterion tables.
    expect(screen.getAllByText('Supported').length).toBeGreaterThan(30);
    expect(screen.getAllByText('Partially supported').length).toBeGreaterThan(
      5
    );
    expect(screen.getAllByText('Not applicable').length).toBeGreaterThan(5);

    // The assistive-technology matrix names both CI jobs.
    expect(screen.getByText('screen-reader')).toBeInTheDocument();
    expect(screen.getByText('screen-reader-nvda')).toBeInTheDocument();
  });

  it('renders the Chinese translation with measured numbers under zh', () => {
    renderAt(<A11yStatementGuide />, 'zh');

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: '无障碍一致性报告（WCAG 2.2）',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '范围与方法' })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '已知限制' })).toBeInTheDocument();
    // Measured numbers survive translation.
    expect(screen.getAllByText(/166/).length).toBeGreaterThan(0);
  });

  it('covers all 55 WCAG 2.2 A/AA criteria, each with a judgment', () => {
    const { a11yStatement } = GUIDE_CONTENT;
    const wcagSection = a11yStatement.en.sections.find(
      (section) => section.id === 'wcag-2-2'
    );
    expect(wcagSection).toBeDefined();
    const criterionTables = (wcagSection?.blocks ?? []).filter(
      (block): block is Extract<GuideBlock, { type: 'table' }> =>
        block.type === 'table'
    );

    const rows = criterionTables.reduce((n, table) => n + table.rows.length, 0);
    expect(rows).toBe(55);

    const cellText = (cell: unknown): string =>
      Array.isArray(cell) ? String(cell[0]) : String(cell);
    for (const table of criterionTables) {
      for (const row of table.rows) {
        const judgment = cellText(row[2]);
        expect(
          ['Supported', 'Partially supported', 'Not applicable']
        ).toContain(judgment);
      }
    }
  });
});
