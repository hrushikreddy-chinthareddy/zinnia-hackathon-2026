'use client';
import { LineOfBusiness } from '@xd/api-types/dist/generated-types/sor';
import { Icon, IconType } from '@zinnia/bloom/components';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { ReactNode, useMemo } from 'react';
import { useForm } from 'react-hook-form';

import { Link } from '@/components/link/Link';
import { useSteppedWorkflowContext } from '@/components/stepped-workflow/SteppedWorkflowContext';
import { LineOfBusinessPath } from '@/types';
import { lineOfBusinessUrlPath } from '@/utils/data';

import { WithdrawalSteps } from '../types';
import { getNextUrl } from '../utils';
import { default as styles } from '../Withdrawals.module.css';
export const IntroPage = () => {
  const { planCode, policyNumber } = useParams<{
    planCode: string;
    policyNumber: string;
  }>();
  const router = useRouter();

  const nextUrl = getNextUrl({
    step: WithdrawalSteps.INTRO,
    planCode,
    policyNumber,
  });
  const form = useForm();
  const { setPrimaryButtonDisabled } = useSteppedWorkflowContext();
  setPrimaryButtonDisabled(
    !form.formState.isValid || form.formState.isSubmitting
  );
  const pathName = usePathname();

  const lineOfBusiness = useMemo(() => {
    if (pathName.includes(LineOfBusinessPath.ANNUITIES)) {
      return LineOfBusiness.ANNUITY;
    }

    return LineOfBusiness.LIFE;
  }, [pathName]);

  const addBankUrl = `/coverage/${lineOfBusinessUrlPath(lineOfBusiness)}/${planCode}/${policyNumber}/profile#addBankSection`;

  const onSubmit = () => {
    router.push(nextUrl);
  };
  return (
    <form
      className={styles.form}
      id="submit-form"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <p>
        This usually takes just a few minutes to complete. Before you begin,
        here are a few things to keep in mind:
      </p>
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
          iconType={IconType.CHECK_PROGRESS}
        />
        <ListItem
          bodyText="Tax withholding preferences"
          headerText="Decide how much you'd like to withhold for federal and state taxes."
          iconType={IconType.REFRESH}
        />
        <ListItem
          bodyText="Withdrawals may take a few business days, depending on your delivery method."
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
      <Icon className={styles.icon} type={iconType} />
      <div>
        <h4 className="typography-content-body-sm-bold">{headerText}</h4>
        <p className="typography-content-body-sm">{bodyText}</p>
      </div>
    </li>
  );
};
