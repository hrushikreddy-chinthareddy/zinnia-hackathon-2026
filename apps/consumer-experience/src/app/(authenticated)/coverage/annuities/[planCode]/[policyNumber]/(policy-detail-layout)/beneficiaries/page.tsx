import { LineOfBusiness, PartyRole } from '@zinnia/api-types/types/sor';
import { Metadata } from 'next';

import { BeneficiariesView } from '@/app/(authenticated)/coverage/shared-views/beneficiaries-view/BeneficiariesView';
import { RouteKey, getPageTitle } from '@/route-map';
import { getBeneficiaries } from '@/services/policy';
import { Beneficiary } from '@/types/policy';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

const pageTitle = getPageTitle(RouteKey.BENEFICIARIES);
// disable because NextJS needs this to be exported from this file
// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: pageTitle,
};

export default async function Beneficiaries({
  params,
}: {
  params: {
    planCode: string;
    policyNumber: string;
  };
}) {
  const planCode = params.planCode || '';
  const policyNumber = params.policyNumber || '';
  const loggingContext = await buildCommonLogContext();
  const { data } = await getBeneficiaries(
    {
      planCode,
      policyNumber,
    },
    loggingContext
  );

  const groupedBenes = data?.beneficiaries?.reduce(
    (grouped, bene) => {
      if (
        bene.partyRole === PartyRole.PRIMARYBENEFICIARY &&
        bene.beneficiaryPercentage &&
        bene.beneficiaryPercentage > 0
      ) {
        grouped.primary.push(bene);
      }

      if (
        bene.partyRole === PartyRole.CONTINGENTBENEFICIARY &&
        bene.beneficiaryPercentage &&
        bene.beneficiaryPercentage > 0
      ) {
        grouped.contingent.push(bene);
      }

      return grouped;
    },
    { primary: [] as Beneficiary[], contingent: [] as Beneficiary[] }
  );

  return (
    <BeneficiariesView
      data={{
        beneficiaries: groupedBenes,
        totalCoverageAmount: data?.totalCoverageAmount,
      }}
      lineOfBusiness={LineOfBusiness.ANNUITY}
    />
  );
}
