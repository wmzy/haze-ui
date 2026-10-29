import { render, screen } from '@testing-library/react';

import LocaleProvider from '../LocaleProvider';

import DiffViewer from './DiffViewer';

describe('DiffViewer', () => {
  it('renders unchanged lines', () => {
    render(<DiffViewer oldValue="hello" newValue="hello" />);
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<DiffViewer oldValue="a" newValue="b" className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('shows added lines', () => {
    const { container } = render(<DiffViewer oldValue="" newValue="new line" />);
    expect(container.querySelector('[class*="added"]')).toBeInTheDocument();
  });

  it('shows removed lines', () => {
    const { container } = render(<DiffViewer oldValue="old line" newValue="" />);
    expect(container.querySelector('[class*="removed"]')).toBeInTheDocument();
  });

  it('shows diff header', () => {
    render(<DiffViewer oldValue="a" newValue="b" />);
    expect(screen.getByText('Diff')).toBeInTheDocument();
  });

  it('renders the header from the active locale pack', () => {
    render(
      <LocaleProvider locale="ja-JP">
        <DiffViewer oldValue="a" newValue="b" />
      </LocaleProvider>
    );
    expect(screen.getByText('差分')).toBeInTheDocument();
    expect(screen.queryByText('Diff')).not.toBeInTheDocument();
  });

  it('lets a strings override reword the header', () => {
    render(
      <LocaleProvider strings={{ diffViewer: { header: 'Changes' } }}>
        <DiffViewer oldValue="a" newValue="b" />
      </LocaleProvider>
    );
    expect(screen.getByText('Changes')).toBeInTheDocument();
  });

  it('handles multiline diff', () => {
    render(<DiffViewer oldValue={'line1\nline2'} newValue={'line1\nline3'} />);
    expect(screen.getByText('line1')).toBeInTheDocument();
  });

  it('marks appended tail line as added', () => {
    render(<DiffViewer oldValue={'a\nb'} newValue={'a\nb\nc'} />);
    const addedLine = screen.getByText('c').closest('div');
    expect(addedLine?.className).toContain('added');
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  it('marks removed tail line as removed', () => {
    render(<DiffViewer oldValue={'a\nb\nc'} newValue={'a\nb'} />);
    const removedLine = screen.getByText('c').closest('div');
    expect(removedLine?.className).toContain('removed');
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('marks a mid-document insertion as a single added line', () => {
    const { container } = render(
      <DiffViewer oldValue={'a\nb\nc\nd'} newValue={'a\nb\nX\nc\nd'} />
    );
    const rows = [...container.querySelectorAll('[data-slot="line"]')];
    expect(rows).toHaveLength(5);
    const changed = rows.filter((row) => /added|removed/.test(row.className));
    // The inserted line is the only edit; the surrounding lines must
    // not cascade into spurious paired modifications.
    expect(changed).toHaveLength(1);
    expect(changed[0]?.className).toContain('added');
    expect(changed[0]?.textContent).toContain('X');
    expect(screen.getByText('c').closest('div')?.className).not.toContain('removed');
    expect(screen.getByText('d').closest('div')?.className).not.toContain('added');
  });

  it('marks a mid-document deletion as a single removed line', () => {
    const { container } = render(
      <DiffViewer oldValue={'a\nb\nc\nd\ne'} newValue={'a\nb\nd\ne'} />
    );
    const rows = [...container.querySelectorAll('[data-slot="line"]')];
    expect(rows).toHaveLength(5);
    const changed = rows.filter((row) => /added|removed/.test(row.className));
    expect(changed).toHaveLength(1);
    expect(changed[0]?.className).toContain('removed');
    expect(changed[0]?.textContent).toContain('c');
    expect(screen.getByText('d').closest('div')?.className).not.toContain('removed');
    expect(screen.getByText('e').closest('div')?.className).not.toContain('added');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<DiffViewer oldValue={'a\nb'} newValue={'a\nc'} />);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
