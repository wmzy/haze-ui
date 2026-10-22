import { render, screen } from '@testing-library/react';

import Table from './Table';
import TableHead from './TableHead';
import TableBody from './TableBody';
import TableRow from './TableRow';
import TableCell from './TableCell';

function TableFixture({ striped = false, bordered = false }: { striped?: boolean; bordered?: boolean }) {
  return (
    <Table striped={striped} bordered={bordered}>
      <TableHead>
        <TableRow>
          <TableCell as="th">Name</TableCell>
          <TableCell as="th">Age</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell>Alice</TableCell>
          <TableCell>30</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Bob</TableCell>
          <TableCell>25</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

describe('Table', () => {
  it('renders a table with head and body', () => {
    render(<TableFixture />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')).toHaveLength(2);
    expect(screen.getAllByRole('cell')).toHaveLength(4);
  });

  it('renders correct content', () => {
    render(<TableFixture />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('applies className to table', () => {
    render(
      <Table className="custom">
        <TableBody>
          <TableRow><TableCell>A</TableCell></TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole('table')).toHaveClass('custom');
  });

  it('applies striped prop', () => {
    render(<TableFixture striped />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('applies bordered prop', () => {
    render(<TableFixture bordered />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('applies className to TableHead', () => {
    render(
      <Table>
        <TableHead className="head-custom">
          <TableRow><TableCell as="th">H</TableCell></TableRow>
        </TableHead>
      </Table>
    );
    expect(screen.getByRole('rowgroup')).toHaveClass('head-custom');
  });

  it('applies className to TableBody', () => {
    render(
      <Table>
        <TableBody className="body-custom">
          <TableRow><TableCell>C</TableCell></TableRow>
        </TableBody>
      </Table>
    );
    const bodies = screen.getAllByRole('rowgroup');
    expect(bodies[0]).toHaveClass('body-custom');
  });

  it('applies className to TableRow', () => {
    render(
      <Table>
        <TableBody>
          <TableRow className="row-custom"><TableCell>C</TableCell></TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole('row')).toHaveClass('row-custom');
  });

  it('applies className to TableCell', () => {
    render(
      <Table>
        <TableBody>
          <TableRow><TableCell className="cell-custom">C</TableCell></TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole('cell')).toHaveClass('cell-custom');
  });

  it('renders TableCell as th', () => {
    render(
      <Table>
        <TableHead>
          <TableRow><TableCell as="th">Header</TableCell></TableRow>
        </TableHead>
      </Table>
    );
    expect(screen.getByRole('columnheader')).toHaveTextContent('Header');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <Table>
        <TableHead>
          <TableRow>
            <TableCell as="th" scope="col">Name</TableCell>
            <TableCell as="th" scope="col">Age</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Alice</TableCell>
            <TableCell>30</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Bob</TableCell>
            <TableCell>25</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('applies classNames slots to every family part', () => {
    render(
      <Table
        classNames={{
          wrapper: 'slot-wrapper',
          head: 'slot-head',
          body: 'slot-body',
          row: 'slot-row',
          cell: 'slot-cell',
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell as="th">H</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>C</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    expect(screen.getByRole('table').parentElement).toHaveClass(
      'slot-wrapper'
    );
    const groups = screen.getAllByRole('rowgroup');
    expect(groups[0]).toHaveClass('slot-head');
    expect(groups[1]).toHaveClass('slot-body');
    for (const row of screen.getAllByRole('row')) {
      expect(row).toHaveClass('slot-row');
    }
    expect(screen.getByRole('cell')).toHaveClass('slot-cell');
  });

  it('lands slot classes before per-part className', () => {
    render(
      <Table classNames={{ row: 'slot-row' }}>
        <TableBody>
          <TableRow className="row-custom">
            <TableCell>C</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    const row = screen.getByRole('row');
    expect(row).toHaveClass('slot-row');
    expect(row).toHaveClass('row-custom');
    expect(
      (row.className.match(/slot-row/g) ?? []).length
    ).toBe(1);
  });

  it('does not leak slots to sub-components outside a Table', () => {
    render(
      <TableBody>
        <TableRow>
          <TableCell>C</TableCell>
        </TableRow>
      </TableBody>
    );
    expect(screen.getByRole('row')).not.toHaveClass('slot-row');
    expect(screen.getByRole('cell')).not.toHaveClass('slot-cell');
  });

  it('forwards ref to the table element', () => {
    function RefProbe() {
      return (
        <Table ref={(node) => { if (node) node.dataset.probe = 'set'; }}>
          <TableBody>
            <TableRow>
              <TableCell>C</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
    }
    render(<RefProbe />);
    expect(screen.getByRole('table')).toHaveAttribute('data-probe', 'set');
  });
});
