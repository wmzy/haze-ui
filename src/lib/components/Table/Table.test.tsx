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
});
