// Direct component import until the barrel wiring lands with the Wave 3
// shared-file patches (DescriptionsDemo/JsonViewDemo precedent).
import { Result } from '@/lib/components/Result';
import { Button } from '@/lib';


import {
  AccessibilitySection,
  CssVarsSection,
  DemoPage,
  DemoSection,
  PropsSection,
} from './shared';

// ─── Result ─────────────────────────────────────────────────────
export default function ResultDemo() {
  return (
    <DemoPage
      title='Result'
      description='Feedback page for success, failure and not-found outcomes.'
    >
      <DemoSection title='Success / Error / Info / Warning'>
        <Result
          status='success'
          title='Purchase completed'
          subTitle='A receipt has been sent to your email address.'
          extra={<Button size='sm'>View receipt</Button>}
        />
        <Result
          status='error'
          title='Submission failed'
          subTitle='Please correct the two fields below and try again.'
          extra={
            <>
              <Button size='sm'>Retry</Button>
              <Button size='sm' variant='outline'>
                Go back
              </Button>
            </>
          }
        />
        <Result status='info' title='Maintenance window' subTitle='The dashboard will be read-only until 03:00 UTC.' />
        <Result status='warning' title='Storage almost full' subTitle='4.7 GB of 5 GB used. Old uploads will be purged in 7 days.' />
      </DemoSection>

      <DemoSection title='404 Page'>
        <Result
          status='404'
          title='404'
          subTitle='Sorry, the page you visited does not exist.'
          extra={<Button size='sm'>Back to home</Button>}
        />
      </DemoSection>

      <DemoSection title='Custom Icon'>
        <Result
          icon={<span style={{ fontSize: 48 }}>🎉</span>}
          title='Deployment created'
          subTitle='haze-ui v1.14.0 is rolling out to production.'
        />
      </DemoSection>

      <PropsSection of='ResultProps' />

      <AccessibilitySection>
        <ul>
          <li>
            Default illustrations are decorative SVGs (<strong>aria-hidden</strong>) — title and subTitle carry the message
          </li>
          <li>
            Provide an <strong>icon</strong> to swap in a meaningful image with its own accessible name
          </li>
          <li>
            The <strong>extra</strong> area is a flex row — use real buttons or links for actions
          </li>
        </ul>
      </AccessibilitySection>

      <CssVarsSection component='result' />
    </DemoPage>
  );
}
