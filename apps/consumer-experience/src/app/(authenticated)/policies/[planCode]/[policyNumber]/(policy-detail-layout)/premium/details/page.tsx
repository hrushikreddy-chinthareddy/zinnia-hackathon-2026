import { IconType } from '@zinnia/bloom/components';
import { Metadata } from 'next';

import { BankData } from '@/components/bank-data/BankData';
import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import MockMessage from '@/components/MockMessage';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { RouteKey, getPageTitle } from '@/route-map';
import { getPaymentDetails } from '@/services/policy';
import { PolicyRequestInputs } from '@/types/policy';

const pageTitle = getPageTitle(RouteKey.PREMIUM_DETAILS);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

export default async function PaymentDetails({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { data, error } = await getPaymentDetails({
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  if (error || !data || data.length === 0) {
    return (
      <div className="space-mb-gap-lg">
        <MockMessage />
        <NoDataAvailable
          iconType={IconType.BANK}
          message="No payment details available"
        />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card-container">
        {data?.length > 0 &&
          !error &&
          data.map(detail => (
            <ClickableCardContainer key={detail.accountNumber}>
              <BankData
                {...detail}
                numberOfAccounts={data.length}
                partyId={detail.appliesToPartyId || ''}
              />
            </ClickableCardContainer>
          ))}
      </div>
      {error && !data && (
        <div className="space-mb-gap-lg">
          <MockMessage />
          <NoDataAvailable
            iconType={IconType.BANK}
            message="No payment details available"
          />
        </div>
      )}
      <CallForAssistance customInstruction="to begin the process." />
    </div>
  );
}
