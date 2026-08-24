import type {Control} from 'react-use-control';

import type {FormInstance} from './index';

import {useState} from 'react';
import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {Form, createForm, getValue, reset, setValue} from 'react-f0rm';
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
});
