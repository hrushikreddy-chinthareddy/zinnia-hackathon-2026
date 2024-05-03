import { IconType } from '@zinnia/bloom/internal/components';
import { Metadata } from 'next';

import { BankData } from '@/components/bank-data/BankData';
import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import MockMessage from '@/components/MockMessage';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { getPaymentDetails } from '@/services/policy';
import { PolicyRequestInputs } from '@/types/policy';

const pageTitle = 'Payment details';

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

  if (error || !data) {
    return (
      <div className="space-mb-gap-lg">
        <MockMessage />
        <NoDataAvailable
          iconType={IconType.PAYMENT}
          message="There is currently no payments detail data available."
        />
      </div>
    );
  }

  return (
    <div className="container">
      <HeaderBreadcrumb title="Payment Details" />
      <div className="card-container">
        {data?.length > 0 &&
          !error &&
          data.map(detail => (
            <ClickableCardContainer key={detail.accountNumber}>
              <BankData {...detail} />
            </ClickableCardContainer>
          ))}
      </div>
      {error && !data && (
        <div className="space-mb-gap-lg">
          <MockMessage />
          <NoDataAvailable
            iconType={IconType.PAYMENT}
            message="There is currently no payments detail data available."
          />
        </div>
      )}
      <CallForAssistance customInstruction="to begin the process." />
    </div>
  );
}
