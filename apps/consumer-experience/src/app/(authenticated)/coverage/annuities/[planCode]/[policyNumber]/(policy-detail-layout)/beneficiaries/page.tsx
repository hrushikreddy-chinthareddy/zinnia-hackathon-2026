import { IconType } from '@zinnia/bloom/components';
import { Metadata } from 'next';

import { BeneficiariesView } from '@/app/(authenticated)/coverage/shared-views/beneficiaries-view/BeneficiariesView';
import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import { RouteKey, getPageTitle } from '@/route-map';
import { getBeneficiaries } from '@/services/policy';
import { Beneficiary } from '@/types/policy';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { LineOfBusiness, PartyRole } from '@zinnia/api-types/types/sor';

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
  const { data, error } = await getBeneficiaries(
    {
      planCode,
      policyNumber,
    },
    loggingContext
  );

  if (error || data?.beneficiaries?.length === 0) {
    return (
      <div className="space-mb-gap-lg">
        <NoDataAvailable
          iconType={IconType.CIRCLE_USER}
          message="There is currently no beneficiary data available."
          correlationId={error?.correlationId}
        />
      </div>
    );
  }

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
