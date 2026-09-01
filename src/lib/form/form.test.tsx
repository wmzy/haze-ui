import type {ChangeEvent} from 'react';

import type {FieldValidator, FormInstance} from './index';

import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {Form, createForm, getError, getValue, reset, setValue} from 'react-f0rm';

import {CheckboxCore} from '../components/Checkbox';
import {InputCore} from '../components/Input';

import {FormItem} from '.';


type Profile = {name: string; email: string};

describe('FormItem', () => {
  function renderEmailItem(form: FormInstance<Profile>, extra?: object) {
    render(
      <FormItem form={form} name='email' label='Email' {...extra}>
        {({id, errorId, invalid, value, onChange}) => (
          <InputCore
            id={id}
            data-testid='email-input'
            value={value}
            onChange={onChange}
            aria-describedby={errorId}
            aria-invalid={invalid}
          />
        )}
      </FormItem>
    );
    return screen.getByTestId('email-input');
  }

  it('wires label, ids and value/onChange binding; renders no error element when clean', () => {
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

  it('keeps the input two-way bound through the binding', async () => {
    const user = userEvent.setup();
    const form = createForm({initialValues: {name: '', email: ''}});
    const input = renderEmailItem(form);

    await user.type(input, 'x@y.z');
    expect(getValue(form, 'email')).toBe('x@y.z');

    act(() => setValue(form, 'email', 'back@flow.dev'));
    expect(input).toHaveValue('back@flow.dev');
  });

  it('re-validates on typing through the binding after a failed submit (default reValidateMode)', async () => {
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
          {({id, errorId, invalid, value, onChange}) => (
            <InputCore
              id={id}
              data-testid='email-input'
              value={value}
              onChange={onChange}
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

    // Typing a valid value through the binding must re-validate
    // immediately — reValidateMode 'onChange' (the default) is reachable
    // from changeValueByPath writes, exactly as it is from
    // useField.onChange. No second submit, no blur needed.
    await user.type(screen.getByTestId('email-input'), 'a@b.c');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(getError(form, 'email')).toBeUndefined();
    expect(getValue(form, 'email')).toBe('a@b.c');
  });

  it('fires mode-gated validation on typing through the binding', async () => {
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
        {({id, errorId, invalid, value, onChange}) => (
          <InputCore
            id={id}
            data-testid='email-input'
            value={value}
            onChange={onChange}
            aria-describedby={errorId}
            aria-invalid={invalid}
          />
        )}
      </FormItem>
    );

    // Per-field mode 'onChange': the very first invalid keystroke through
    // the binding validates — no submit, no blur.
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
          {({id, errorId, invalid, value, onChange}) => (
            <InputCore
              id={id}
              data-testid='email-input'
              value={value}
              onChange={onChange}
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
          {({id, errorId, invalid, value, onChange}) => (
            <InputCore
              id={id}
              data-testid='email-input'
              value={value}
              onChange={onChange}
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

  it('re-seeds bindings on reset(form, newValues)', async () => {
    const user = userEvent.setup();
    const form = createForm({initialValues: {name: '', email: ''}});

    render(
      <FormItem form={form} name='name' label='Name'>
        {({id, value, onChange}) => (
          <>
            <InputCore
              id={id}
              data-testid='name'
              // render the value through a DOM-safe channel for the
              // reset()-to-undefined case: <input value={undefined}>
              // falls back to uncontrolled and keeps its old DOM text,
              // which would mask what the binding actually forwards.
              value={(value as string | undefined) ?? ''}
              onChange={onChange}
            />
            <output data-testid='probe'>{`${typeof value}:${value}`}</output>
          </>
        )}
      </FormItem>
    );
    const input = screen.getByTestId('name');
    const probe = screen.getByTestId('probe');

    await user.type(input, 'typed');
    expect(input).toHaveValue('typed');

    // reset() with new values clears the store and re-emits a global
    // change: the binding picks up the fresh seed without any remounting.
    act(() => reset(form, {name: 'seeded', email: ''}));
    expect(input).toHaveValue('seeded');
    expect(getValue(form, 'name')).toBe('seeded');

    // reset() without values is react-f0rm's "clear to nothing"
    // (form.initialValues becomes undefined → field value undefined);
    // the binding forwards that as-is.
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
          {({id, invalid, value, onChange}) => (
            <InputCore
              id={id}
              data-testid='name-input'
              value={value}
              onChange={onChange}
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
          {({id, invalid, onBlur, value, onChange}) => (
            <InputCore
              id={id}
              data-testid='email-input'
              value={value}
              onChange={onChange}
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

  it('validateDebounce: kicks inside the window collapse into one validator run', () => {
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

      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(validate).toHaveBeenCalledTimes(1);
      // the surviving run sees the last value and gets react-f0rm's meta
      expect(validate).toHaveBeenLastCalledWith(
        'abc@x.dev',
        expect.objectContaining({
          form,
          signal: expect.any(AbortSignal) as AbortSignal
        })
      );
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('delayError: a newly appearing error waits out the window before rendering', () => {
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
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(screen.getByRole('alert')).toHaveTextContent(
        'must be an email'
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('rules: declarative constraints validate and merge ahead of validate', () => {
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

  it('as={InputCore}: declarative binding wires label, aria and two-way value', async () => {
    const user = userEvent.setup();
    const form = createForm({initialValues: {name: '', email: ''}});

    render(
      <Form form={form} onSubmit={() => undefined}>
        <FormItem
          form={form}
          name='email'
          label='Email'
          as={InputCore}
          asProps={{'data-testid': 'email-input'}}
          validate={(v) => (v.includes('@') ? undefined : 'must be an email')}
        />
        <button type='submit'>Submit</button>
      </Form>
    );

    const input = screen.getByTestId('email-input');
    // the label points at the control `as` rendered
    expect(screen.getByText('Email')).toHaveAttribute('for', input.id);
    expect(input).toHaveValue('');

    // failed submit errors the field: the as-mode aria wiring lights up
    await user.click(screen.getByRole('button', {name: 'Submit'}));
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('must be an email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', alert.id);

    // typing through the as control writes back through the binding and
    // (default reValidateMode) clears the error as soon as the value is valid
    await user.type(input, 'a@b.c');
    expect(getValue(form, 'email')).toBe('a@b.c');
    expect(input).toHaveValue('a@b.c');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    // invalid is false → the as-mode attributes are omitted (undefined),
    // not rendered as "false"
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('as + valueToProps/eventToValue adapt checkbox-style controls both ways', async () => {
    const user = userEvent.setup();
    const form = createForm({
      initialValues: {email: '', subscribed: false, newsletter: false}
    });

    // A DOM-element-shaped control: its onChange receives the raw event and
    // its value lives in `checked` — exactly the shape eventToValue and
    // valueToProps each adapt in one line.
    function NativeCheckbox(props: Record<string, any>) {
      return <input type='checkbox' data-testid='native-cb' {...props} />;
    }

    render(
      <>
        <FormItem
          form={form}
          name='subscribed'
          label='Subscribe'
          as={NativeCheckbox}
          valueToProps={(checked) => ({checked: !!checked})}
          eventToValue={(e: ChangeEvent<HTMLInputElement>) =>
            e.target.checked
          }
        />
        <FormItem
          form={form}
          name='newsletter'
          label='Newsletter'
          as={CheckboxCore}
          asProps={{'data-testid': 'core-cb'}}
          valueToProps={(checked) => ({checked: !!checked})}
        />
      </>
    );

    const native = screen.getByTestId('native-cb');
    const core = screen.getByTestId('core-cb');
    expect(screen.getByLabelText('Subscribe')).toBe(native);
    expect(native).not.toBeChecked();
    expect(core).not.toBeChecked();

    // DOM event → field value through eventToValue; field value → checked
    // prop through valueToProps
    await user.click(native);
    expect(getValue(form, 'subscribed')).toBe(true);
    expect(native).toBeChecked();

    // …and the other direction: a store write re-renders the adapted control
    act(() => setValue(form, 'subscribed', false));
    expect(native).not.toBeChecked();

    // CheckboxCore: same valueToProps, identity eventToValue (haze cores
    // emit the next plain value — no adapter needed)
    await user.click(core);
    expect(getValue(form, 'newsletter')).toBe(true);
    act(() => setValue(form, 'newsletter', false));
    expect(core).not.toBeChecked();
  });

  it('renderError customizes the error span while keeping the alert wiring', async () => {
    const user = userEvent.setup();
    const form = createForm({initialValues: {name: '', email: ''}});

    render(
      <Form form={form} onSubmit={() => undefined}>
        <FormItem
          form={form}
          name='email'
          label='Email'
          as={InputCore}
          asProps={{'data-testid': 'email-input'}}
          validate={(v) => (v.includes('@') ? undefined : 'must be an email')}
          renderError={(error, id) => (
            <em data-testid='custom-error' data-error-id={id}>
              {`custom: ${error}`}
            </em>
          )}
        />
        <button type='submit'>Submit</button>
      </Form>
    );

    await user.click(screen.getByRole('button', {name: 'Submit'}));

    const alert = screen.getByRole('alert');
    const custom = screen.getByTestId('custom-error');
    // the custom renderer's content lives inside the same alert span…
    expect(alert).toContainElement(custom);
    expect(custom).toHaveTextContent('custom: must be an email');
    // …its second argument is that span's id…
    expect(custom).toHaveAttribute('data-error-id', alert.id);
    // …and the control still describes the span
    expect(screen.getByTestId('email-input')).toHaveAttribute(
      'aria-describedby',
      alert.id
    );
  });

  it('generic validate: a typed form flows PathValueOf<TValues, P> into the validator', () => {
    const form = createForm({initialValues: {name: '', email: ''}});
    const seen: string[] = [];

    // Compile-time contract: with a typed form, the value argument is the
    // field's actual type — Profile['email'] is string, so `v.includes`
    // typechecks — and a mismatched parameterization is rejected.
    const typed: FieldValidator<Profile, 'email'> = (v) => {
      seen.push(v);
      return v.includes('@') ? undefined : 'must be an email';
    };
    // @ts-expect-error Profile['name'] is string — number parameters don't fit
    const mismatch: FieldValidator<Profile, 'name'> = (v: number) => `${v}`;
    expect([typed, mismatch].every((fn) => typeof fn === 'function')).toBe(
      true
    );

    renderEmailItem(form, {validate: typed});

    act(() => setValue(form, 'email', 'nope', {shouldValidate: true}));
    expect(seen).toEqual(['nope']);
    expect(screen.getByRole('alert')).toHaveTextContent('must be an email');

    act(() => setValue(form, 'email', 'ok@x.dev', {shouldValidate: true}));
    expect(seen).toEqual(['nope', 'ok@x.dev']);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
