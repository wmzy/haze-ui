import { render, screen, renderHook, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Toast from './Toast';
import ToastContainer from './ToastContainer';
import useToast from './useToast';

describe('Toast', () => {
  it('renders children with alert role', () => {
    render(<Toast onClose={vi.fn()} duration={0}>Message</Toast>);
    expect(screen.getByRole('alert')).toHaveTextContent('Message');
  });

  it('renders close button', () => {
    render(<Toast onClose={vi.fn()} duration={0}>Message</Toast>);
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Toast onClose={onClose} duration={0}>Message</Toast>);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('auto-closes after duration', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast onClose={onClose} duration={3000}>Message</Toast>);
    expect(onClose).not.toHaveBeenCalled();
    vi.advanceTimersByTime(3000);
    expect(onClose).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it('does not auto-close when duration is 0', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<Toast onClose={onClose} duration={0}>Message</Toast>);
    vi.advanceTimersByTime(10000);
    expect(onClose).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});

describe('ToastContainer + useToast', () => {
  it('shows toast when useToast is called', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ToastContainer>{children}</ToastContainer>
    );
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current('Hello toast');
    });

    expect(screen.getByText('Hello toast')).toBeInTheDocument();
  });

  it('shows toast with custom variant', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ToastContainer>{children}</ToastContainer>
    );
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current('Success!', { variant: 'success' });
    });

    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('removes toast when close is clicked', async () => {
    const user = userEvent.setup();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ToastContainer>{children}</ToastContainer>
    );
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current('Temp', { duration: 0 });
    });

    expect(screen.getByText('Temp')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('Temp')).not.toBeInTheDocument();
  });
});
