import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { Metadata } from 'next';

import { AccountValue } from '@/components/account-value/AccountValue';
import { AdditionalAccountValueLinks } from '@/components/account-value/AdditionalAccountValueLinks';
import { ClickableCardContainer } from '@/components/clickable-card-container/ClickableCardContainer';
import { RouteKey, getPageTitle } from '@/route-map';
import { PolicyRequestInputs } from '@/types/policy';

const pageTitle = getPageTitle(RouteKey.ACCOUNT);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

export default async function AccountValuePage({
  params,
}: {
  params: PolicyRequestInputs;
}) {
  const { planCode, policyNumber } = params;

  return (
    <div className="container">
      <div className="card-container">
        <ClickableCardContainer>
          <AccountValue
            planCode={planCode}
            policyNumber={policyNumber}
            hideLabel
          />
        </ClickableCardContainer>
        <AdditionalAccountValueLinks
          planCode={planCode}
          policyNumber={policyNumber}
          lineOfBusiness={LineOfBusiness.LIFE}
        />
      </div>
    </div>
  );
}
