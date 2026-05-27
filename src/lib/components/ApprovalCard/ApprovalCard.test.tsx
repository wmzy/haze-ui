import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ApprovalCard from './ApprovalCard';

describe('ApprovalCard', () => {
  it('renders default title', () => {
    render(<ApprovalCard />);
    expect(screen.getByText('Approval Required')).toBeInTheDocument();
  });

  it('renders custom title', () => {
    render(<ApprovalCard title="Confirm Action" />);
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<ApprovalCard className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('renders description', () => {
    render(<ApprovalCard description="This will delete files" />);
    expect(screen.getByText('This will delete files')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<ApprovalCard><div>Extra info</div></ApprovalCard>);
    expect(screen.getByText('Extra info')).toBeInTheDocument();
  });

  it('renders default button text', () => {
    render(<ApprovalCard />);
    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('Deny')).toBeInTheDocument();
  });

  it('renders custom button text', () => {
    render(<ApprovalCard approveText="Allow" denyText="Block" />);
    expect(screen.getByText('Allow')).toBeInTheDocument();
    expect(screen.getByText('Block')).toBeInTheDocument();
  });

  it('calls onApprove', async () => {
    const user = userEvent.setup();
    const onApprove = vi.fn();
    render(<ApprovalCard onApprove={onApprove} />);
    await user.click(screen.getByText('Approve'));
    expect(onApprove).toHaveBeenCalled();
  });

  it('calls onDeny', async () => {
    const user = userEvent.setup();
    const onDeny = vi.fn();
    render(<ApprovalCard onDeny={onDeny} />);
    await user.click(screen.getByText('Deny'));
    expect(onDeny).toHaveBeenCalled();
  });
});
