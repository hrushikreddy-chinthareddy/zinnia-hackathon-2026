import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useState } from 'react';

import styles from '@/app/styles/unthemedTabsWrapper.module.css';
import { useUser } from '@/hooks/use-user';
import { getPaymentusToken } from '@/queries/paymentus-queries';
import { analytics } from '@/utils/segment';

// TODO: i think the frms TLA changes based on environment -- we really need to get
// confirmation of this from farmers
const iframeTokenUrl = `${process.env.NEXT_PUBLIC_FARMERS_API_BASE_URL}/xotp/pm/frms`;

export const AddPaymentMethod = ({
  policyNumber,
}: {
  policyNumber: string;
}) => {
  const { user } = useUser();
  const [currentPaymentTypeView, setCurrentPaymentTypeView] = useState<
    'cc' | 'bank'
  >('bank');

  const addPaymentMethodParams = {
    // TODO: hardcoding for now, but this will need to come from access_token
    // which will only be available through SSO login
    ownerId: '7657659',
    postMessagePmDetailsOrigin: window.location.href,
    timestamp: Date.now(),
  };

  const {
    data: ccToken,
    error: ccError,
    isLoading: ccLoading,
  } = useQuery({
    queryKey: ['paymentusAddCCToken', policyNumber],
    queryFn: () =>
      getPaymentusToken({
        ...addPaymentMethodParams,
        pmCategory: 'CC',
      }),
  });

  const {
    data: bankToken,
    error: bankError,
    isLoading: bankLoading,
  } = useQuery({
    queryKey: ['paymentusAddBankToken', policyNumber],
    queryFn: () =>
      getPaymentusToken({
        ...addPaymentMethodParams,
        pmCategory: 'DD',
      }),
  });

  const trackAndSetView = (viewType: 'cc' | 'bank') => () => {
    analytics.track('button_clicked', {
      additionalContext: 'add paymentus payment method',
      buttonText: `add payment method ${viewType}`,
      userId: user?.partyId,
    });
    setCurrentPaymentTypeView(viewType);
  };

  // TODO: figure out the loading and error state
  // if (bankLoading || !bankToken) return <div>Loading...</div>;
  if ((bankError && ccError) || bankLoading || ccLoading) {
    // TODO: what should happen here? // the error screen shows the iframe error, which i can leave if that's better?
    return null;
  }

  return (
    <div style={{ height: '100%' }}>
      <ul className={styles.unthemedTabsWrapper}>
        <li>
          <button
            onClick={trackAndSetView('bank')}
            className={clsx({
              [styles.selected as string]: currentPaymentTypeView === 'bank',
            })}
          >
            Bank Account
          </button>
        </li>
        <li>
          <button
            onClick={trackAndSetView('cc')}
            className={clsx({
              [styles.selected as string]: currentPaymentTypeView === 'cc',
            })}
          >
            Credit Card
          </button>
        </li>
      </ul>
      <div style={{ height: '100%' }}>
        {currentPaymentTypeView === 'bank' && (
          <iframe
            id="paymentusAddBankIframe"
            src={`${iframeTokenUrl}?authToken=${bankToken}`}
            width="100%"
            height="100%"
          />
        )}
        {currentPaymentTypeView === 'cc' && (
          <iframe
            id="paymentusAddCCIframe"
            src={`${iframeTokenUrl}?authToken=${ccToken}`}
            width="100%"
            height="100%"
          />
        )}
      </div>
    </div>
  );
};
