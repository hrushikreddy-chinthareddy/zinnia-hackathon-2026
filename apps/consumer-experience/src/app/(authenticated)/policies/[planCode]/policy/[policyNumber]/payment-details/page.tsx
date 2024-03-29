import { BankData } from '@/components/bank-data/BankData';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { Footer } from '@/components/footer/Footer';
import { HeaderBreadcrumb } from '@/components/header-breadcrumb/HeaderBreadcrumb';
import { HeaderPolicyDetails } from '@/components/header-policy-details/HeaderPolicyDetails';
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

  return (
    <div>
      <HeaderBreadcrumb title="Payment Details" />
      <HeaderPolicyDetails />
      {data && !error && (
        <ClickableCardContainer>
          <BankData key={data.accountNumber} {...data} />
        </ClickableCardContainer>
      )}
      <Footer />
    </div>
  );
}
