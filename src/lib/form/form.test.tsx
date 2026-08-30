import type {Control} from 'react-use-control';

import type {FormInstance} from './index';

import {useState} from 'react';
import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {Form, createForm, getError, getValue, reset, setValue} from 'react-f0rm';
import {useControl} from 'react-use-control';

import {Input} from '../components/Input';
import {Select, Option} from '../components/Select';
import {Checkbox} from '../components/Checkbox';
import {Switch} from '../components/Switch';
import {NumberInput} from '../components/NumberInput';

import {FormItem, useFormControl} from '.';


type Profile = {name: string; email: string};

function NameField({form}: {form: FormInstance<Profile>}) {
  const name = useFormControl(form, 'name');
  return <Input data-testid='name' value={name} />;
}

describe('useFormControl', () => {
  it('binds Input two-way: typing updates the form, setValue flows back', async () => {
    const user = userEvent.setup();
    const form = createForm({initialValues: {name: '', email: ''}});

    render(<NameField form={form} />);
    const input = screen.getByTestId('name');

    await user.type(input, 'ada');
    expect(getValue(form, 'name')).toBe('ada');

    act(() => setValue(form, 'name', 'grace'));
    expect(input).toHaveValue('grace');
    expect(getValue(form, 'name')).toBe('grace');
  });

  it('binds Select two-way', async () => {
    const user = userEvent.setup();
    const form = createForm({initialValues: {name: '', role: 'viewer'}});

    function RoleField({
      form
    }: {
      form: FormInstance<{name: string; role: string}>;
    }) {
      const role = useFormControl(form, 'role');
      return (
        <Select data-testid='role' value={role}>
          <Option value='viewer'>Viewer</Option>
          <Option value='admin'>Admin</Option>
        </Select>
      );
    }

    render(<RoleField form={form} />);
    const select = screen.getByTestId('role');

    await user.selectOptions(select, 'admin');
    expect(getValue(form, 'role')).toBe('admin');

    act(() => setValue(form, 'role', 'viewer'));
    expect(select).toHaveValue('viewer');
  });

  it('binds Checkbox (Control<boolean>) two-way', async () => {
    const user = userEvent.setup();
    const form = createForm({initialValues: {agree: false}});

    function AgreeField({form}: {form: FormInstance<{agree: boolean}>}) {
      const agree = useFormControl(form, 'agree');
      return <Checkbox data-testid='agree' checked={agree} />;
    }

    render(<AgreeField form={form} />);
    const box = screen.getByTestId('agree');

    await user.click(box);
    expect(getValue(form, 'agree')).toBe(true);

    act(() => setValue(form, 'agree', false));
    expect(box).not.toBeChecked();
  });

  it('binds Switch and its functional dispatch toggles the live form value', async () => {
    const user = userEvent.setup();
    const form = createForm({initialValues: {dark: false}});

    function DarkField({form}: {form: FormInstance<{dark: boolean}>}) {
      const dark = useFormControl(form, 'dark');
      return <Switch data-testid='dark' checked={dark} />;
    }

    render(<DarkField form={form} />);
    const btn = screen.getByTestId('dark');

    await user.click(btn);
    expect(getValue(form, 'dark')).toBe(true);

    await user.click(btn);
    expect(getValue(form, 'dark')).toBe(false);

    act(() => setValue(form, 'dark', true));
    expect(btn).toHaveAttribute('aria-checked', 'true');
  });

  it('binds NumberInput and rapid stepping accumulates on the live form value', async () => {
    const user = userEvent.setup();
    const form = createForm({initialValues: {seats: 0}});

    function SeatsField({form}: {form: FormInstance<{seats: number}>}) {
      const seats = useFormControl(form, 'seats');
      return <NumberInput data-testid='seats' value={seats} />;
    }

    render(<SeatsField form={form} />);

    await user.dblClick(screen.getByRole('button', {name: 'Increase'}));
    expect(getValue(form, 'seats')).toBe(2);
    expect(screen.getByTestId('seats')).toHaveValue(2);
  });

  it('evaluates functional updates against the live form value within one event', async () => {
    const user = userEvent.setup();
    const form = createForm({initialValues: {count: 0}});

    function Bump({count}: {count: Control<number>}) {
      const [, setValue] = useControl(count);
      return (
        <button
          type='button'
          onClick={() => {
            setValue((prev) => prev + 1);
            setValue((prev) => prev + 1);
          }}
        >
          bump
        </button>
      );
    }

    function Counter({form}: {form: FormInstance<{count: number}>}) {
      const count = useFormControl(form, 'count');
      return <Bump count={count} />;
    }

    render(<Counter form={form} />);
    await user.click(screen.getByRole('button', {name: 'bump'}));
    expect(getValue(form, 'count')).toBe(2);
  });

  it('supports segment-array names that key-match the bracketed form', () => {
    const form = createForm({initialValues: {user: [{name: 'ada'}]}});

    function NestedField({
      form
    }: {
      form: FormInstance<{user: {name: string}[]}>;
    }) {
      const name = useFormControl(form, ['user', 0, 'name']);
      return <Input data-testid='nested' value={name} />;
    }

    render(<NestedField form={form} />);
    expect(screen.getByTestId('nested')).toHaveValue('ada');

    // numeric segments only come from bracket notation in string form
    act(() => setValue(form, 'user[0].name', 'grace'));
    expect(screen.getByTestId('nested')).toHaveValue('grace');
    expect(getValue(form, ['user', 0, 'name'])).toBe('grace');
  });

  it('re-renders only the field that changed (sibling isolation, own-field exactly once)', () => {
    const form = createForm({initialValues: {name: '', email: ''}});
    const renders = {name: 0, email: 0};

    function CountedName({form}: {form: FormInstance<Profile>}) {
      renders.name++;
      const name = useFormControl(form, 'name');
      return <Input data-testid='name' value={name} />;
    }

    function CountedEmail({form}: {form: FormInstance<Profile>}) {
      renders.email++;
      const email = useFormControl(form, 'email');
      return <Input data-testid='email' value={email} />;
    }

    render(
      <>
        <CountedName form={form} />
        <CountedEmail form={form} />
      </>
    );
    const baseline = {...renders};

    act(() => setValue(form, 'email', 'a@b.c'));
    expect(renders.email).toBe(baseline.email + 1);
    expect(renders.name).toBe(baseline.name);

    act(() => setValue(form, 'name', 'ada'));
    expect(renders.name).toBe(baseline.name + 1);
    expect(renders.email).toBe(baseline.email + 1);
  });

  it('keeps the control handle referentially stable across value changes', async () => {
    const user = userEvent.setup();
    const form = createForm({initialValues: {name: '', email: ''}});
    const handles: unknown[] = [];

    function Capture({form}: {form: FormInstance<Profile>}) {
      const name = useFormControl(form, 'name');
      handles.push(name);
      return <NameField form={form} />;
    }

    function Host({form}: {form: FormInstance<Profile>}) {
      const [, setTick] = useState(0);
      return (
        <>
          <button type='button' onClick={() => setTick((t) => t + 1)}>
            rerender
          </button>
          <Capture form={form} />
        </>
      );
    }

    render(<Host form={form} />);
    expect(handles.length).toBe(1);
    const first = handles[0];

    // unrelated re-render (parent state): handle stays identical
    await user.click(screen.getByRole('button', {name: 'rerender'}));
    expect(handles.length).toBe(2);
    expect(handles[1]).toBe(first);

    // own-field change re-renders the host: handle still identical
    await user.type(screen.getByTestId('name'), 'ada');
    expect(getValue(form, 'name')).toBe('ada');
    expect(handles[handles.length - 1]).toBe(first);
  });

  it('binds quoted-bracket and numeric-bracket path names', () => {
    const form = createForm({
      initialValues: {tags: ['x'], meta: {'b.c': 'dotted'}}
    });

    function TagField({form}: {form: FormInstance<{tags: string[]}>}) {
      const tag = useFormControl(form, 'tags[0]');
      return <Input data-testid='tag' value={tag} />;
    }

    function QuotedField({
      form
    }: {
      form: FormInstance<{meta: Record<string, string>}>;
    }) {
      const dotted = useFormControl(form, 'meta["b.c"]');
      return <Input data-testid='dotted' value={dotted} />;
    }

    render(
      <>
        <TagField form={form} />
        <QuotedField form={form} />
      </>
    );
    expect(screen.getByTestId('tag')).toHaveValue('x');
    expect(screen.getByTestId('dotted')).toHaveValue('dotted');

    act(() => setValue(form, 'tags[1]', 'y'));
    expect(getValue(form, ['tags', 1])).toBe('y');
    act(() => setValue(form, 'meta["b.c"]', 'quoted'));
    expect(screen.getByTestId('dotted')).toHaveValue('quoted');
  });

  it('rejects malformed paths with a helpful TypeError', () => {
    const form = createForm({initialValues: {a: 1}});

    function BadQuote({form}: {form: FormInstance<Record<string, unknown>>}) {
      useFormControl(form, 'a["unterminated');
      return null;
    }

    function BadBracket({form}: {form: FormInstance<Record<string, unknown>>}) {
      useFormControl(form, 'a[0');
      return null;
    }

    function BadClose({form}: {form: FormInstance<Record<string, unknown>>}) {
      useFormControl(form, 'a["x"y]');
      return null;
    }

    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<BadQuote form={form} />)).toThrow(TypeError);
    expect(() => render(<BadBracket form={form} />)).toThrow(TypeError);
    expect(() => render(<BadClose form={form} />)).toThrow(TypeError);
    spy.mockRestore();
  });

  it('parses empty-string name as a single empty segment', () => {
    const form = createForm({initialValues: {'': 'root'}});

    function EmptyField({form}: {form: FormInstance<Record<string, string>>}) {
      const value = useFormControl(form, '');
      return <Input data-testid='empty' value={value} />;
    }

    render(<EmptyField form={form} />);
    expect(screen.getByTestId('empty')).toHaveValue('root');
  });
});

describe('FormItem', () => {
  function renderEmailItem(form: FormInstance<Profile>, extra?: object) {
    render(
      <FormItem form={form} name='email' label='Email' {...extra}>
        {({id, errorId, invalid, control}) => (
          <Input
            id={id}
            data-testid='email-input'
            value={control}
            aria-describedby={errorId}
            aria-invalid={invalid}
          />
        )}
      </FormItem>
    );
    return screen.getByTestId('email-input');
  }

  it('wires label, ids and control binding; renders no error element when clean', () => {
    const form = createForm({initialValues: {name: '', email: 'a@b.c'}});
    const input = renderEmailItem(form);

    expect(screen.getByText('Email')).toHaveAttribute(
      'for',
      input.getAttribute('id')!
    );
    expect(input).toHaveValue('a@b.c');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('keeps the input two-way bound through the binding control', async () => {
    const user = userEvent.setup();
    const form = createForm({initialValues: {name: '', email: ''}});
    const input = renderEmailItem(form);

    await user.type(input, 'x@y.z');
    expect(getValue(form, 'email')).toBe('x@y.z');

    act(() => setValue(form, 'email', 'back@flow.dev'));
    expect(input).toHaveValue('back@flow.dev');
  });

  it('re-validates on typing through the control bridge after a failed submit (default reValidateMode)', async () => {
    const user = userEvent.setup();
    const form = createForm({initialValues: {name: '', email: ''}});

    render(
      <Form form={form} onSubmit={() => undefined}>
        <FormItem
          form={form}
          name='email'
          label='Email'
          validate={(v: string) =>
            v.includes('@') ? undefined : 'must be an email'
          }
        >
          {({id, errorId, invalid, control}) => (
            <Input
              id={id}
              data-testid='email-input'
              value={control}
              aria-describedby={errorId}
              aria-invalid={invalid}
            />
          )}
        </FormItem>
        <button type='submit'>Submit</button>
      </Form>
    );

    // Failed submit surfaces the error (mode onSubmit).
    await user.click(screen.getByRole('button', {name: 'Submit'}));
    expect(screen.getByRole('alert')).toHaveTextContent('must be an email');

    // Typing a valid value through the bridge must re-validate
    // immediately — reValidateMode 'onChange' (the default) is reachable
    // from control writes, exactly as it is from useField.onChange. No
    // second submit, no blur needed.
    await user.type(screen.getByTestId('email-input'), 'a@b.c');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(getError(form, 'email')).toBeUndefined();
    expect(getValue(form, 'email')).toBe('a@b.c');
  });

  it('fires mode-gated validation on typing through the control bridge', async () => {
    const user = userEvent.setup();
    const form = createForm({initialValues: {name: '', email: ''}});

    render(
      <FormItem
        form={form}
        name='email'
        label='Email'
        mode='onChange'
        validate={(v: string) => (v.includes('@') ? undefined : 'must be an email')}
      >
        {({id, errorId, invalid, control}) => (
          <Input
            id={id}
            data-testid='email-input'
            value={control}
            aria-describedby={errorId}
            aria-invalid={invalid}
          />
        )}
      </FormItem>
    );

    // Per-field mode 'onChange': the very first invalid keystroke through
    // the bridge validates — no submit, no blur.
    await user.type(screen.getByTestId('email-input'), 'nope');
    expect(screen.getByRole('alert')).toHaveTextContent('must be an email');

    // …and typing the rest of a valid value clears it, same channel.
    await user.type(screen.getByTestId('email-input'), '@x.y');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders role=alert, aria-invalid and aria-describedby once the field errors', async () => {
    const user = userEvent.setup();
    const form = createForm({initialValues: {name: '', email: ''}});

    render(
      <Form form={form} onSubmit={() => undefined}>
        <FormItem
          form={form}
          name='email'
          label='Email'
          validate={(v: string) =>
            v.includes('@') ? undefined : 'must be an email'
          }
        >
          {({id, errorId, invalid, control}) => (
            <Input
              id={id}
              data-testid='email-input'
              value={control}
              aria-describedby={errorId}
              aria-invalid={invalid}
            />
          )}
        </FormItem>
        <button type='submit'>Submit</button>
      </Form>
    );

    await user.click(screen.getByRole('button', {name: 'Submit'}));

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('must be an email');
    expect(alert.getAttribute('id')).toBeTruthy();

    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', alert.id);
  });

  it('blocks invalid submits and passes once fixed', async () => {
    const user = userEvent.setup();
    const form = createForm({initialValues: {name: '', email: ''}});
    const onSubmit = vi.fn();

    render(
      <Form form={form} onSubmit={onSubmit}>
        <FormItem
          form={form}
          name='email'
          label='Email'
          validate={(v) => (v ? undefined : 'required')}
        >
          {({id, errorId, invalid, control}) => (
            <Input
              id={id}
              data-testid='email-input'
              value={control}
              aria-invalid={invalid}
              aria-describedby={errorId}
            />
          )}
        </FormItem>
        <button type='submit'>Submit</button>
      </Form>
    );

    // invalid: submit blocked, error surfaced
    await user.click(screen.getByRole('button', {name: 'Submit'}));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('required');

    // fix the field and submit again
    await user.type(screen.getByTestId('email-input'), 'a@b.c');
    await user.click(screen.getByRole('button', {name: 'Submit'}));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      {name: '', email: 'a@b.c'},
      expect.anything()
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toHaveAttribute(
      'aria-invalid',
      'false'
    );
  });

  it('re-seeds controls through the bridge on reset(form, newValues)', async () => {
    const user = userEvent.setup();
    const form = createForm({initialValues: {name: '', email: ''}});

    function ControlProbe({control}: {control: Control<string>}) {
      const [value] = useControl(control);
      // render the value through a DOM-safe channel: <input
      // value={undefined}> falls back to uncontrolled and keeps its old
      // DOM text, which would mask what the bridge actually forwards.
      // typeof prefix keeps the undefined case representable in text.
      return (
        <output data-testid='probe'>{`${typeof value}:${value}`}</output>
      );
    }

    render(
      <FormItem form={form} name='name' label='Name'>
        {({id, control}) => (
          <>
            <Input id={id} data-testid='name' value={control} />
            <ControlProbe control={control} />
          </>
        )}
      </FormItem>
    );
    const input = screen.getByTestId('name');
    const probe = screen.getByTestId('probe');

    await user.type(input, 'typed');
    expect(input).toHaveValue('typed');

    // reset() with new values clears the store and re-emits a global
    // change: the bridged Control picks up the fresh seed without any
    // remounting.
    act(() => reset(form, {name: 'seeded', email: ''}));
    expect(input).toHaveValue('seeded');
    expect(getValue(form, 'name')).toBe('seeded');

    // reset() without values is react-f0rm's "clear to nothing"
    // (form.initialValues becomes undefined → field value undefined);
    // the bridge forwards that as-is.
    act(() => reset(form));
    expect(probe).toHaveTextContent('undefined:undefined');
    expect(getValue(form, 'name')).toBeUndefined();
  });

  it('mode="onBlur" validates on blur; without mode validation waits for submit', async () => {
    const user = userEvent.setup();
    const form = createForm({initialValues: {name: '', email: ''}});

    render(
      <Form form={form} onSubmit={() => undefined}>
        <FormItem
          form={form}
          name='name'
          label='Name'
          validate={(v: string) => (v ? undefined : 'name required')}
        >
          {({id, invalid, control}) => (
            <Input
              id={id}
              data-testid='name-input'
              value={control}
              aria-invalid={invalid}
            />
          )}
        </FormItem>
        <FormItem
          form={form}
          name='email'
          label='Email'
          mode='onBlur'
          validate={(v: string) => (v ? undefined : 'email required')}
        >
          {({id, invalid, onBlur, control}) => (
            <Input
              id={id}
              data-testid='email-input'
              value={control}
              aria-invalid={invalid}
              onBlur={onBlur}
            />
          )}
        </FormItem>
        <button type='submit'>Submit</button>
      </Form>
    );

    // mode='onBlur': focus and leave the field empty → blur alone errors it
    await user.click(screen.getByTestId('email-input'));
    await user.tab();
    expect(await screen.findByText('email required')).toBeInTheDocument();
    expect(screen.queryByText('name required')).not.toBeInTheDocument();

    // no mode: blurring the field does NOT validate it…
    await user.click(screen.getByTestId('name-input'));
    await user.tab();
    expect(screen.queryByText('name required')).not.toBeInTheDocument();

    // …only submitting does
    await user.click(screen.getByRole('button', {name: 'Submit'}));
    expect(screen.getByText('name required')).toBeInTheDocument();
  });

  it('rejects a misspelled mode at compile time', () => {
    const form = createForm({initialValues: {email: ''}});
    const element = (
      <FormItem
        form={form}
        name='email'
        // @ts-expect-error 'onFocuse' is not a ValidationMode literal
        mode='onFocuse'
      >
        {() => null}
      </FormItem>
    );
    expect(element).toBeTruthy();
  });

  it('validateDebounce: kicks inside the window collapse into one validator run', async () => {
    vi.useFakeTimers();
    try {
      const form = createForm({initialValues: {name: '', email: ''}});
      const validate = vi.fn((v: string) =>
        v.includes('@') ? undefined : 'must be an email'
      );

      renderEmailItem(form, {validate, validateDebounce: 300});

      // three kicks inside the window — none may run the validator yet
      act(() => setValue(form, 'email', 'a', {shouldValidate: true}));
      act(() => setValue(form, 'email', 'ab', {shouldValidate: true}));
      act(() => setValue(form, 'email', 'abc@x.dev', {shouldValidate: true}));
      expect(validate).not.toHaveBeenCalled();

      act(() => vi.advanceTimersByTime(300));
      expect(validate).toHaveBeenCalledTimes(1);
      // the surviving run sees the last value and gets react-f0rm's meta
      expect(validate).toHaveBeenLastCalledWith(
        'abc@x.dev',
        expect.objectContaining({form, signal: expect.any(AbortSignal)})
      );
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('delayError: a newly appearing error waits out the window before rendering', async () => {
    vi.useFakeTimers();
    try {
      const form = createForm({initialValues: {name: '', email: ''}});

      renderEmailItem(form, {
        validate: (v: string) =>
          v.includes('@') ? undefined : 'must be an email',
        delayError: 500
      });

      // invalid value: the form's error store is immediate…
      act(() => setValue(form, 'email', 'nope', {shouldValidate: true}));
      expect(getError(form, 'email')!.message).toBe('must be an email');
      // …but the rendered error span waits out the delay window
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      // once the window passes, the error span shows up
      act(() => vi.advanceTimersByTime(500));
      expect(screen.getByRole('alert')).toHaveTextContent(
        'must be an email'
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('rules: declarative constraints validate and merge ahead of validate', async () => {
    const form = createForm({initialValues: {name: '', email: ''}});
    const validate = vi.fn(() => 'also invalid');

    renderEmailItem(form, {
      validate,
      rules: {required: 'email is required', minLength: 4}
    });

    // empty value: required fails and lands first in the merged errors —
    // rules errors precede the field validator's own error
    act(() => setValue(form, 'email', '', {shouldValidate: true}));
    const first = getError(form, 'email')!;
    expect(first.type).toBe('required');
    expect(first.message).toBe('email is required');
    expect(screen.getByRole('alert')).toHaveTextContent('email is required');
    // the field validator still ran — react-f0rm merges both sources
    expect(validate).toHaveBeenCalledTimes(1);

    // at 4 chars the rules pass; only the validator's error remains
    act(() => setValue(form, 'email', 'abcd', {shouldValidate: true}));
    expect(getError(form, 'email')!.message).toBe('also invalid');
    expect(screen.getByRole('alert')).toHaveTextContent('also invalid');
    expect(validate).toHaveBeenCalledTimes(2);
  });
});
