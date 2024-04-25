import { IconType } from '@zinnia/bloom/internal/components';

import { BankData } from '@/components/bank-data/BankData';
import { CallForAssistance } from '@/components/call-for-assistance/CallForAssistance';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import MockMessage from '@/components/MockMessage';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { getPaymentDetails } from '@/services/policy';
import { PolicyRequestInputs } from '@/types/policy';

export default async function PaymentDetails({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { data, error } = await getPaymentDetails({
    planCode: params.planCode,
    policyNumber: params.policyNumber,
  });

  if (error) {
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
      {data && !error && (
        <ClickableCardContainer>
          <BankData key={data.accountNumber} {...data} />
        </ClickableCardContainer>
      )}
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
