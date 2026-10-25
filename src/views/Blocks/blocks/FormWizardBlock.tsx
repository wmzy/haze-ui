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
  Option,
  SelectCore,
  Step,
  Stepper,
  trigger,
  useForm,
  zodResolver,
} from '@/lib';

/*
 * Form wizard block: a centered Card walking a three-step workspace setup.
 * One react-f0rm Form wraps every step so values survive step changes, a
 * single zod schema defines the record (each field validated by its slice
 * through zodResolver — field-level, so the per-step trigger() actually
 * runs it), and the Stepper's activeStep is a Control the host app can
 * drive or observe. Next awaits trigger() on just the current step's
 * fields (gated advancement, first error focused), and the final submit
 * lands in an Alert receipt.
 */

type WizardValues = {
  fullName: string;
  workEmail: string;
  workspaceName: string;
  teamSize: string;
  region: string;
  productNews: boolean;
  weeklyDigest: boolean;
};

const wizardSchema = z.object({
  fullName: z.string().min(2, 'Tell us your full name'),
  workEmail: z.email('Enter a valid work email'),
  workspaceName: z.string().min(3, 'At least 3 characters'),
  teamSize: z.string().min(1, 'Pick a team size'),
  region: z.string().min(1, 'Pick a data region'),
  productNews: z.boolean(),
  weeklyDigest: z.boolean(),
});

// Field-level validators sliced out of the one schema — trigger() with
// explicit names runs field validators only (form-level validate is
// skipped), so this is the channel per-step gating has to go through.
const validateFullName = zodResolver(wizardSchema.shape.fullName);
const validateWorkEmail = zodResolver(wizardSchema.shape.workEmail);
const validateWorkspaceName = zodResolver(wizardSchema.shape.workspaceName);
const validateTeamSize = zodResolver(wizardSchema.shape.teamSize);
const validateRegion = zodResolver(wizardSchema.shape.region);

const STEPS = [
  { title: 'Account', description: 'Who you are', fields: ['fullName', 'workEmail'] },
  {
    title: 'Workspace',
    description: 'Where the team lands',
    fields: ['workspaceName', 'teamSize', 'region'],
  },
  { title: 'Preferences', description: 'Stay in the loop', fields: [] },
] as const;

function WizardForm() {
  const form = useForm<WizardValues>({
    initialValues: {
      fullName: '',
      workEmail: '',
      workspaceName: '',
      teamSize: '',
      region: '',
      productNews: true,
      weeklyDigest: false,
    },
    // Step fields unmount on every step change; the library default
    // (tombstone) would drop their values, but a wizard's whole point is
    // one record accumulating across steps.
    shouldUnregister: false,
  });
  // Step cursor is user-facing state — a Control, so a host app can deep
  // link or observe progress. `created` is demo-local display state.
  const [step, setStep, stepCtrl] = useControl(undefined, 0);
  const [created, setCreated] = useControl(undefined, false);
  const lastStep = STEPS.length - 1;

  async function goNext() {
    const fields = STEPS[step]?.fields ?? [];
    // Validate just this step's slice of the schema; only a clean step
    // advances (the first errored field takes focus via shouldFocus).
    const ok =
      fields.length === 0
        ? true
        : await trigger(form, [...fields] as string[], { shouldFocus: true });
    if (ok) setStep(Math.min(step + 1, lastStep));
  }

  return (
    <Form form={form} onValidSubmit={() => setCreated(true)}>
      <div
        data-slot='wizard-body'
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--haze-space-5)',
        }}
      >
        <Stepper activeStep={stepCtrl}>
          {STEPS.map((s) => (
            <Step key={s.title} title={s.title} description={s.description} />
          ))}
        </Stepper>

        {created ? (
          <Alert color='success'>
            Workspace created — the whole schema passed. Close and reopen the
            preview to run the wizard again.
          </Alert>
        ) : step === 0 ? (
          <div
            data-slot='wizard-step-account'
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--haze-space-4)',
            }}
          >
            <FormItem
              form={form}
              name='fullName'
              label='Full name'
              validate={validateFullName}
              mode='onBlur'
              input={InputCore}
              placeholder='Ada Lovelace'
            />
            <FormItem
              form={form}
              name='workEmail'
              label='Work email'
              validate={validateWorkEmail}
              mode='onBlur'
              input={InputCore}
              type='email'
              placeholder='you@company.com'
            />
          </div>
        ) : step === 1 ? (
          <div
            data-slot='wizard-step-workspace'
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--haze-space-4)',
            }}
          >
            <FormItem
              form={form}
              name='workspaceName'
              label='Workspace name'
              validate={validateWorkspaceName}
              mode='onBlur'
              input={InputCore}
              placeholder='Platform team'
            />
            <FormItem
              form={form}
              name='teamSize'
              label='Team size'
              validate={validateTeamSize}
              mode='onBlur'
              input={SelectCore}
            >
              <Option value=''>Pick a size…</Option>
              <Option value='2-9'>2–9 people</Option>
              <Option value='10-49'>10–49 people</Option>
              <Option value='50-199'>50–199 people</Option>
              <Option value='200+'>200+ people</Option>
            </FormItem>
            <FormItem
              form={form}
              name='region'
              label='Data region'
              validate={validateRegion}
              mode='onBlur'
              input={SelectCore}
            >
              <Option value=''>Pick a region…</Option>
              <Option value='eu-central'>Frankfurt (eu-central)</Option>
              <Option value='us-east'>N. Virginia (us-east)</Option>
              <Option value='ap-northeast'>Tokyo (ap-northeast)</Option>
            </FormItem>
          </div>
        ) : (
          <div
            data-slot='wizard-step-preferences'
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--haze-space-4)',
            }}
          >
            <FormItem
              form={form}
              name='productNews'
              label='Product news'
              input={CheckboxCore}
              valueToProps={(checked) => ({ checked: !!checked })}
            />
            <FormItem
              form={form}
              name='weeklyDigest'
              label='Weekly workspace digest'
              input={CheckboxCore}
              valueToProps={(checked) => ({ checked: !!checked })}
            />
            <p
              style={{
                margin: 0,
                fontSize: 'var(--haze-text-xs)',
                color: 'var(--haze-color-text-muted)',
              }}
            >
              Both toggles are plain form values — they submit with everything
              else and can be preset from the host app.
            </p>
          </div>
        )}

        <div
          data-slot='wizard-footer'
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 'var(--haze-space-2)',
            borderTop: '1px solid var(--haze-color-border)',
            paddingTop: 'var(--haze-space-4)',
          }}
        >
          <Button
            variant='outline'
            disabled={step === 0 || created}
            onClick={() => setStep(Math.max(step - 1, 0))}
          >
            Back
          </Button>
          {step < lastStep ? (
            <Button onClick={() => void goNext()}>Next step</Button>
          ) : (
            /* Button's native `type` is pinned to 'button' — submit through
                the owning form so the zod chain runs first. */
            <Button disabled={created} onClick={(e) => e.currentTarget.form?.requestSubmit()}>
              Create workspace
            </Button>
          )}
        </div>
      </div>
    </Form>
  );
}

export default function FormWizardBlock() {
  return (
    <div
      data-slot='form-wizard-block'
      style={{
        minHeight: '520px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: 'var(--haze-space-6)',
        background: 'var(--haze-color-bg)',
        fontFamily: 'var(--haze-font-sans)',
        color: 'var(--haze-color-text)',
      }}
    >
      <Card style={{ width: '100%', maxWidth: '680px' }}>
        <div
          data-slot='wizard-header'
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--haze-space-1)',
            marginBottom: 'var(--haze-space-5)',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 'var(--haze-text-xl)',
              fontWeight: 'var(--haze-weight-semibold)',
            }}
          >
            Create your workspace
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 'var(--haze-text-sm)',
              color: 'var(--haze-color-text-secondary)',
            }}
          >
            Three steps, one zod schema — values persist across steps and only
            a valid step advances.
          </p>
        </div>
        <WizardForm />
      </Card>
    </div>
  );
}
