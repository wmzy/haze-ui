import type {FormInstance} from '@/lib';

import {useState} from 'react';
import {css} from '@linaria/core';
import {Form, getValues, reset, setValue, useForm, useValue} from 'react-f0rm';

import {
  Alert,
  Button,
  CodeBlock,
  FormItem,
  InputCore,
  NumberInputCore,
  Option,
  SelectCore,
  SwitchCore,
} from '@/lib';
import A11yNote from '@/views/ComponentDetail/A11yNote';
import PropsTable from '@/views/ComponentDetail/PropsTable';
import {
  fieldRow,
  intro,
  page,
  row,
  section,
} from '@/views/ComponentDetail/styles';

type ProfileValues = {
  name: string;
  email: string;
  role: string;
  newsletter: boolean;
  seats: number;
};

const INITIAL_VALUES: ProfileValues = {
  name: '',
  email: '',
  role: 'viewer',
  newsletter: true,
  seats: 5,
};

const RANDOM_NAMES = [
  'Ada Lovelace',
  'Grace Hopper',
  'Alan Turing',
  'Barbara Liskov',
];

const RANDOM_ROLES = ['admin', 'maintainer', 'viewer'];

function pick(list: readonly string[]): string {
  return list[Math.floor(Math.random() * list.length)]!;
}

function emailOf(name: string): string {
  return `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`;
}

const validateName = (value: string) =>
  value.trim() ? undefined : 'Name is required';

const validateEmail = (value: string) => {
  if (!value.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Enter a valid email address';
  }
  return undefined;
};

const validateSeats = (value: number) =>
  Number.isFinite(value) && value >= 1 && value <= 100
    ? undefined
    : 'Seats must be between 1 and 100';

const hint = css`
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-secondary);
  margin: 0;
`;

/**
 * Field-level subscription demo: reads the live `name`/`seats` values
 * through react-f0rm's own useValue hook — haze no longer ships a form
 * binding hook, react-f0rm's Field/useValue is the single source.
 */
function LiveValues({form}: {form: FormInstance<ProfileValues>}) {
  const name = useValue(form, 'name');
  const seats = useValue(form, 'seats');

  return (
    <span className={hint}>
      Live subscription · name = {JSON.stringify(name)} · seats = {String(
        seats
      )}
    </span>
  );
}

export default function FormDemo() {
  const form = useForm<ProfileValues>({
    initialValues: INITIAL_VALUES,
  });
  const [submitted, setSubmitted] = useState<ProfileValues | null>(null);

  const randomFill = () => {
    const name = pick(RANDOM_NAMES);
    setValue(form, 'name', name);
    setValue(form, 'email', emailOf(name));
    setValue(form, 'role', pick(RANDOM_ROLES));
    setValue(form, 'seats', 1 + Math.floor(Math.random() * 100));
    setSubmitted(null);
  };

  const resetForm = () => {
    reset(form, INITIAL_VALUES);
    setSubmitted(null);
  };

  return (
    <div className={page}>
      <h1>Form</h1>
      <p className={intro}>
        Bind react-f0rm form state to haze-ui controlled cores through{' '}
        react-f0rm&apos;s own headless <code>useField</code> hook — the same
        binding layer its built-in <code>Field</code>/<code>Checkbox</code>/
        <code>Select</code> use — with haze-ui&apos;s <code>FormItem</code>{' '}
        as the view: <code>FormItem</code> wraps the hook&apos;s state in
        label, error and aria wiring, and any <code>XxxCore</code> receives
        the plain <code>{'{value, onChange}'}</code> pair.
      </p>

      <div className={section}>
        <h2>Controlled form</h2>
        <div className={row}>
          <Button variant='outline' onClick={randomFill}>
            Random fill (setValue)
          </Button>
          <Button variant='ghost' onClick={resetForm}>
            Reset
          </Button>
          <LiveValues form={form} />
        </div>
        <Form
          form={form}
          onValidSubmit={(values: ProfileValues) => setSubmitted(values)}
          onInvalidSubmit={() => setSubmitted(null)}
        >
          <div className={fieldRow}>
            <FormItem
              form={form}
              name='name'
              label='Name'
              validate={validateName}
            >
              {({id, errorId, invalid, value, onChange}) => (
                <InputCore
                  id={id}
                  value={value}
                  onChange={onChange}
                  placeholder='Ada Lovelace'
                  aria-invalid={invalid}
                  aria-describedby={invalid ? errorId : undefined}
                />
              )}
            </FormItem>
          </div>
          <div className={fieldRow}>
            <FormItem
              form={form}
              name='email'
              label='Email'
              validate={validateEmail}
            >
              {({id, errorId, invalid, value, onChange}) => (
                <InputCore
                  id={id}
                  value={value}
                  onChange={onChange}
                  placeholder='ada@example.com'
                  aria-invalid={invalid}
                  aria-describedby={invalid ? errorId : undefined}
                />
              )}
            </FormItem>
          </div>
          <div className={fieldRow}>
            <FormItem form={form} name='role' label='Role'>
              {({id, value, onChange}) => (
                <SelectCore id={id} value={value} onChange={onChange}>
                  <Option value='admin'>Admin</Option>
                  <Option value='maintainer'>Maintainer</Option>
                  <Option value='viewer'>Viewer</Option>
                </SelectCore>
              )}
            </FormItem>
          </div>
          <div className={fieldRow}>
            <FormItem form={form} name='seats' label='Seats' validate={validateSeats}>
              {({id, errorId, invalid, value, onChange}) => (
                <NumberInputCore
                  id={id}
                  value={value}
                  onChange={onChange}
                  min={1}
                  max={100}
                  step={1}
                  aria-invalid={invalid}
                  aria-describedby={invalid ? errorId : undefined}
                />
              )}
            </FormItem>
          </div>
          <div className={fieldRow}>
            <FormItem form={form} name='newsletter' label='Subscribe to newsletter'>
              {({id, value, onChange}) => (
                <SwitchCore id={id} checked={value} onChange={onChange} />
              )}
            </FormItem>
          </div>
          <div className={row}>
            {/* haze-ui Button renders type="button", so trigger the form
                element's submit flow explicitly. */}
            <Button
              onClick={(e) => {
                e.currentTarget.form?.requestSubmit();
              }}
            >
              Submit
            </Button>
            <Button variant='ghost' onClick={() => setSubmitted(getValues(form))}>
              Read values (getValues)
            </Button>
          </div>
        </Form>
        {submitted ? (
          <>
            <Alert variant='success'>
              Submitted — getValues() returned the values below.
            </Alert>
            <CodeBlock language='json'>
              {JSON.stringify(submitted, null, 2)}
            </CodeBlock>
          </>
        ) : (
          <p className={hint}>
            Fill the form and submit (or press &quot;Read values&quot;) to see
            the current form values.
          </p>
        )}
      </div>

      <div className={section}>
        <h2>API</h2>
        <h3>useField (react-f0rm) — the binding layer</h3>
        <PropsTable
          props={[
            {
              name: 'form',
              type: 'Form<TValues>',
              description: 'Form instance from useForm()/createForm()',
            },
            {
              name: 'name',
              type: 'FieldPath<TValues> | (string | number)[]',
              description: 'Field path; value type is inferred from it',
            },
            {
              name: 'returns',
              type: '{value, onChange, onBlur, error, errors, invalid, ...}',
              description:
                'Headless binding — the same channel react-f0rm\'s Field/Checkbox/Select use; pass value/onChange to any haze-ui core',
            },
          ]}
        />
        <h3>FormItem props</h3>
        <PropsTable
          props={[
            { name: 'form', type: 'Form<TValues>', description: 'Form instance' },
            {
              name: 'name',
              type: 'FieldPath<TValues> | (string | number)[]',
              description: 'Field path to bind',
            },
            {
              name: 'label',
              type: 'ReactNode',
              description: 'Label rendered with htmlFor pointing at the field id',
            },
            {
              name: 'validate',
              type: '(value, meta) => string | FieldError | (string | FieldError)[] | undefined | Promise<...>',
              description:
                'Field-level validator (sync or async); runs per mode/on submit, meta carries {form, path, signal}',
            },
            {
              name: 'children',
              type: '(binding: {id, errorId, invalid, errors, value, onChange}) => ReactNode',
              description:
                'Render any haze-ui core; spread id/aria attributes and pass value/onChange to the core',
            },
          ]}
        />
      </div>

      <div className={section}>
        <h2>Accessibility</h2>
        <A11yNote>
          <ul>
            <li>
              FormItem renders a <strong>&lt;label htmlFor&gt;</strong> bound
              to the field id
            </li>
            <li>
              <strong>aria-invalid</strong> is set while the field has errors;
              <strong> aria-describedby</strong> points at the error message
            </li>
            <li>
              Errors render in a <strong>role=&quot;alert&quot;</strong>{' '}
              element announced by screen readers
            </li>
            <li>
              Validation is submit-driven in this integration — field
              validators run on submit (react-f0rm <strong>mode</strong>)
            </li>
          </ul>
        </A11yNote>
      </div>
    </div>
  );
}
