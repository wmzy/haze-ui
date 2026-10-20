import { z } from 'zod';
import { useControl } from 'react-use-control';

import {
  Alert,
  Button,
  Card,
  CheckboxCore,
  Form,
  FormItem,
  InputCore,
  PasswordInputCore,
  useForm,
  standardSchemaFormValidator,
} from '@/lib';

/*
 * Login block: a brand side panel plus a centered Card holding a complete
 * form loop — useForm + Form + FormItem over InputCore / PasswordInputCore
 * / CheckboxCore, validated by one zod schema through
 * standardSchemaFormValidator (errors land per FormItem, no per-field
 * validate needed). All layout glue is inline styles over --haze-* tokens
 * so the block re-themes for free.
 */

type LoginValues = {
  email: string;
  password: string;
  remember: boolean;
};

const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  remember: z.boolean(),
});

const loginValidator = standardSchemaFormValidator<LoginValues>(loginSchema);

function LoginForm() {
  const form = useForm<LoginValues>({
    initialValues: { email: '', password: '', remember: true },
    validate: loginValidator,
    validateDeps: ['email', 'password'],
  });
  // Signed-in confirmation banner — demo-local display state.
  const [signedIn, setSignedIn] = useControl(undefined, false);

  return (
    <Form form={form} onValidSubmit={() => setSignedIn(true)}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--haze-space-4)',
        }}
      >
        {signedIn && (
          <Alert variant='success'>Signed in — the schema passed for this workspace.</Alert>
        )}
        <FormItem
          form={form}
          name='email'
          label='Work email'
          rules={{ required: true }}
          input={InputCore}
          type='email'
          placeholder='you@company.com'
        />
        <FormItem
          form={form}
          name='password'
          label='Password'
          rules={{ required: true }}
          input={PasswordInputCore}
          placeholder='At least 8 characters'
        />
        <FormItem
          form={form}
          name='remember'
          label='Keep me signed in on this device'
          input={CheckboxCore}
          valueToProps={(checked) => ({ checked: !!checked })}
        />
        {/* Button's native `type` is pinned to 'button' — submit through the
            owning form so react-f0rm's validation chain runs first. */}
        <Button
          style={{ width: '100%' }}
          onClick={(e) => {
            e.currentTarget.form?.requestSubmit();
          }}
        >
          Sign in
        </Button>
      </div>
    </Form>
  );
}

export default function LoginBlock() {
  return (
    <div
      data-slot='login-block'
      style={{
        display: 'flex',
        height: '100%',
        minHeight: '420px',
        fontFamily: 'var(--haze-font-sans)',
        color: 'var(--haze-color-text)',
      }}
    >
      {/* Brand panel — token-only surface so it flips with the theme. */}
      <div
        data-slot='login-brand'
        style={{
          flex: '1 1 55%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'var(--haze-space-8)',
          background: 'var(--haze-color-bg-subtle)',
          borderInlineEnd: '1px solid var(--haze-color-border)',
        }}
      >
        <strong style={{ color: 'var(--haze-color-primary)', fontSize: 'var(--haze-text-xl)' }}>
          Nimbus
        </strong>
        <div>
          <h2
            style={{
              margin: '0 0 var(--haze-space-2)',
              fontSize: 'var(--haze-text-2xl)',
              lineHeight: 'var(--haze-leading-tight)',
              color: 'var(--haze-color-text)',
            }}
          >
            Analytics your whole team actually reads.
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 'var(--haze-text-sm)',
              color: 'var(--haze-color-text-secondary)',
            }}
          >
            1,284 workspaces ship with Nimbus — from first event to board deck.
          </p>
        </div>
        <span style={{ fontSize: 'var(--haze-text-xs)', color: 'var(--haze-color-text-muted)' }}>
          SOC 2 Type II · GDPR · 99.98% uptime
        </span>
      </div>

      {/* Form panel — the Card centers the fields in the remaining width. */}
      <div
        data-slot='login-panel'
        style={{
          flex: '1 1 45%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--haze-space-6)',
          background: 'var(--haze-color-bg)',
        }}
      >
        <div style={{ width: 'min(360px, 100%)' }}>
          <Card variant='outlined'>
            <h2 style={{ margin: '0 0 var(--haze-space-1)', fontSize: 'var(--haze-text-lg)' }}>
              Welcome back
            </h2>
            <p
              style={{
                margin: '0 0 var(--haze-space-4)',
                fontSize: 'var(--haze-text-sm)',
                color: 'var(--haze-color-text-secondary)',
              }}
            >
              Sign in to your Nimbus workspace.
            </p>
            <LoginForm />
            <p
              style={{
                margin: 'var(--haze-space-3) 0 0',
                fontSize: 'var(--haze-text-xs)',
                color: 'var(--haze-color-text-muted)',
              }}
            >
              New to Nimbus? <a href='#login'>Create a workspace</a>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
