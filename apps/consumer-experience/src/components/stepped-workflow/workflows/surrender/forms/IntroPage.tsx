'use client';
import { Icon, IconType } from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { useForm } from 'react-hook-form';

import { Link } from '@/components/link/Link';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import { usePolicyUrlInputs } from '@/hooks/use-policy-url-inputs';

import { default as styles } from '../Surrender.module.css';
export const IntroPage = () => {
  const { stepInfo } = useSteppedWorkflowContext();
  const { lineOfBusinessUrl, planCode, policyNumber } = usePolicyUrlInputs();
  const router = useRouter();

  const form = useForm();

  const addBankUrl = `/coverage/${lineOfBusinessUrl}/${planCode}/${policyNumber}/profile#addBankSection`;

  const onSubmit = () => {
    router.push(stepInfo.nextStepUrl);
  };
  return (
    <form
      className={styles.form}
      id="submit-form"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      This will end your coverage. Before you begin, here are a few other things
      to keep in mind:
      <ul className={styles.intro}>
        <ListItem
          bodyText={
            <>
              Choose an address or bank account already on file, or{' '}
              <Link isInternal href={addBankUrl}>
                add a new one
              </Link>{' '}
              prior to starting.
            </>
          }
          headerText="Where to send your money?"
          iconType={IconType.CHECK_ITEM}
        />
        <ListItem
          bodyText="Tax withholding preferences"
          headerText="Decide how much you'd like to withhold for federal and state taxes."
          iconType={IconType.RECEIPT_TAX}
        />
        <ListItem
          bodyText="Surrenders may take a few business days, depending on your delivery method."
          headerText="Processing time"
          iconType={IconType.CLOCK}
        />
      </ul>
    </form>
  );
};

interface ListItemProps {
  iconType: IconType;
  headerText: string;
  bodyText: string | ReactNode;
}
const ListItem = ({ bodyText, headerText, iconType }: ListItemProps) => {
  return (
    <li>
      <div>
        <Icon className={styles.icon} type={iconType} />
      </div>
      <div>
        <h4 className="typography-content-body-sm-bold">{headerText}</h4>
        <p className="typography-content-body-sm">{bodyText}</p>
      </div>
    </li>
  );
};
