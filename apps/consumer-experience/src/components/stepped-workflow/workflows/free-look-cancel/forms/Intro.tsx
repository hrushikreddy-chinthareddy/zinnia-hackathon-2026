'use client';
import { Icon, IconType } from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

import { Button } from '@/components/button/Button';
import { Link } from '@/components/link/Link';
import { CancelDialogLink } from '@/components/stepped-workflow/common/CancelDialogLink';
import styles from '@/components/stepped-workflow/common/Styles.module.css';
import { useGetTransactionStepData } from '@/hooks/use-get-transaction-step-data';
import { usePolicyUrlInputs } from '@/hooks/use-policy-url-inputs';
import { PaymentProvider } from '@/types/carrier-config';

import { stepsInfo } from '../steps';

export const Intro = ({
  paymentProvider,
}: {
  paymentProvider?: PaymentProvider;
}) => {
  const { nextStep } = useGetTransactionStepData({ stepsInfo });
  const { lineOfBusinessUrl, planCode, policyNumber } = usePolicyUrlInputs();
  const router = useRouter();

  const addBankUrl = `/coverage/${lineOfBusinessUrl}/${planCode}/${policyNumber}/profile#addBankSection`;
  const allowDirectDeposit = paymentProvider === PaymentProvider.ZINNIA;

  const moveToNextStep = () => {
    router.push(nextStep?.url || '');
  };
  return (
    <div className={styles.intro}>
      <h1>Are you sure you want to cancel?</h1>
      <p>
        This will end your coverage. Before you begin, here are a few other
        things to keep in mind:
      </p>
      <ul>
        {/* TODO: this copy needs to change if farmers because they will not
        have banks available */}
        <ListItem
          bodyText={
            <>
              {`Choose an address ${allowDirectDeposit ? 'or bank account' : ''} already on file, or `}
              <Link isInternal href={addBankUrl}>
                add a new one
              </Link>{' '}
              prior to starting
            </>
          }
          headerText="Where to send your money?"
          iconType={IconType.CHECK_ITEM}
        />
        <ListItem
          bodyText="Surrenders may take a few business days, depending on your delivery method."
          headerText="Processing time"
          iconType={IconType.CLOCK}
        />
      </ul>
      <div className={`${styles.stepActions} mt-xl`}>
        <Button onClick={moveToNextStep}>Continue</Button>
        <CancelDialogLink />
      </div>
    </div>
  );
};

// TODO: what are we saving here? maybe move this into it's own component?
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
