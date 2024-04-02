import { IconType } from '@zinnia/bloom/internal/components';

import { BankData } from '@/components/bank-data/BankData';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
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
    <div>
      <HeaderBreadcrumb title="Payment Details" />
      <HeaderPolicyDetails
        planCode={params.planCode}
        policyNumber={params.policyNumber}
      />
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
      <Footer />
    </div>
  );
}
