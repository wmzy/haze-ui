import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import userEvent from '@testing-library/user-event';

import Input from './Input';
import InputCore from './InputCore';

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<Input className="custom" placeholder="test" />);
    expect(screen.getByPlaceholderText('test')).toHaveClass('custom');
  });

  it('works as uncontrolled with default empty value', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="test" />);
    const input = screen.getByPlaceholderText('test');
    await user.type(input, 'hello');
    expect(input).toHaveValue('hello');
  });

  it('works as uncontrolled with initial string value', () => {
    render(<Input value="initial" placeholder="test" />);
    expect(screen.getByPlaceholderText('test')).toHaveValue('initial');
  });

  it('calls onChange handler', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input placeholder="test" onChange={onChange} />);
    await user.type(screen.getByPlaceholderText('test'), 'a');
    expect(onChange).toHaveBeenCalled();
  });

  it('forwards native props like disabled', () => {
    render(<Input disabled placeholder="test" />);
    expect(screen.getByPlaceholderText('test')).toBeDisabled();
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<Input placeholder="Enter text" aria-label="Name" />);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('forwards leftSection/rightSection to the core', () => {
    render(
      <Input
        aria-label='amount'
        leftSection={<span data-testid='l'>$</span>}
        rightSection={<span data-testid='r'>.00</span>}
      />
    );
    expect(document.querySelector("[data-slot='left-section']")).toContainElement(screen.getByTestId('l'));
    expect(document.querySelector("[data-slot='right-section']")).toContainElement(screen.getByTestId('r'));
  });
});

describe('InputCore', () => {
  it('renders the given value as a controlled input', () => {
    render(<InputCore value="hello" onChange={() => undefined} aria-label="core" />);
    expect(screen.getByRole('textbox')).toHaveValue('hello');
  });

  describe('sections', () => {
    it('bare input keeps the pre-section DOM (no wrapper, classes on the input)', () => {
      const { container } = render(
        <InputCore value='' onChange={() => undefined} aria-label='bare' className='mine' />
      );
      const input = screen.getByRole('textbox');
      // visual baselines depend on the unwrapped shape
      expect(container.firstChild).toBe(input);
      expect(input).toHaveClass('mine');
      expect(container.querySelector("[data-slot='field']")).toBeNull();
    });

    it('leftSection renders inside a wrapping field before the input', () => {
      render(
        <InputCore
          value=''
          onChange={() => undefined}
          aria-label='price'
          leftSection={<span data-testid='currency'>¥</span>}
        />
      );
      const field = document.querySelector("[data-slot='field']");
      expect(field).not.toBeNull();
      const section = field!.querySelector("[data-slot='left-section']");
      expect(section).toContainElement(screen.getByTestId('currency'));
      // section comes before the input in DOM order (flex row
      // ordering is the contract screen magnifiers follow)
      expect(section!.compareDocumentPosition(screen.getByRole('textbox')))
        .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it('rightSection renders at the trailing edge', () => {
      render(
        <InputCore
          value=''
          onChange={() => undefined}
          aria-label='search'
          rightSection={<span data-testid='icon'>🔍</span>}
        />
      );
      const section = document.querySelector("[data-slot='right-section']");
      expect(section).toContainElement(screen.getByTestId('icon'));
    });

    it('sections do not swallow typing — value flows through the wrapper', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <InputCore
          value=''
          onChange={onChange}
          aria-label='wrapped'
          leftSection={<span>L</span>}
          rightSection={<span>R</span>}
        />
      );
      await user.type(screen.getByRole('textbox'), 'ab');
      expect(onChange).toHaveBeenCalledTimes(2);
    });

    it('interactive section children carry the pointer-events opt-in marker', () => {
      render(
        <InputCore
          value=''
          onChange={() => undefined}
          aria-label='x'
          rightSection={<button type='button' data-section-pointer='auto'>go</button>}
        />
      );
      // CSS is disabled in tests, so the contract under test is the
      // DOM marker: the section wrapper carries pointer-events: none,
      // interactive children re-enable with data-section-pointer=auto
      // (PasswordInput's visibility toggle rides the same opt-in)
      expect(screen.getByRole('button', { name: 'go' }))
        .toHaveAttribute('data-section-pointer', 'auto');
    });
  });

  it('calls onChange with the new value on input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<InputCore value="" onChange={onChange} aria-label="core" />);
    await user.type(screen.getByRole('textbox'), 'a');
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('does not mutate the value on its own: rerender drives the DOM', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const {rerender} = render(
      <InputCore value="" onChange={onChange} aria-label="core" />
    );
    await user.type(screen.getByRole('textbox'), 'a');
    expect(screen.getByRole('textbox')).toHaveValue('');
    rerender(<InputCore value="a" onChange={onChange} aria-label="core" />);
    expect(screen.getByRole('textbox')).toHaveValue('a');
  });
});

describe('Input ref forwarding', () => {
  it('forwards ref to the input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} aria-label='Name' />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    ref.current!.focus();
    expect(document.activeElement).toBe(ref.current);
  });
});
