import { LineOfBusiness } from '@zinnia/api-types/types/sor';
import { IconType } from '@zinnia/bloom/components';
import { FC } from 'react';

import { getCoverage } from '@/services';
import { getComponentVisibility } from '@/services/display-rules';
import { ComponentName } from '@/services/display-rules/types';
import { lineOfBusinessUrlPath } from '@/utils/data';
import { buildCommonLogContext } from '@/utils/logging/server-logging';

import { GenerateClickableContainerList } from '../clickable-card-container/GenerateClickableContainerList';

interface AdditionalLinksProps {
  lineOfBusiness: LineOfBusiness;
  planCode: string;
  policyNumber: string;
}

const AdditionalLinks: FC<AdditionalLinksProps> = async ({
  lineOfBusiness,
  planCode,
  policyNumber,
}) => {
  const lineOfBusinessURL = lineOfBusinessUrlPath(lineOfBusiness);
  const loggingContext = await buildCommonLogContext();
  const { data, error } = await getCoverage(
    {
      planCode,
      policyNumber,
    },
    loggingContext
  );

  if (error) {
    return null;
  }

  const { beneficiaryCount } = data!;

  const visibility = await getComponentVisibility(policyNumber, planCode);

  const showBeneficiaries =
    visibility?.[ComponentName.OVERVIEW_BENEFICIARIES]() &&
    !!beneficiaryCount &&
    beneficiaryCount > 0;
  const showRiders = visibility?.[ComponentName.OVERVIEW_RIDERS]();
  const showDocuments = visibility?.[ComponentName.OVERVIEW_DOCUMENTS]();
  const showPaymentHistory =
    visibility?.[ComponentName.OVERVIEW_PAYMENT_HISTORY]();

  const links = [
    {
      url: `/coverage/${lineOfBusinessURL}/${planCode}/${policyNumber}/premium/history`,
      urlLabel: 'payment history',
      isInternal: true,
      iconType: IconType.HISTORY_EVENT,
      linkText: 'Payment History',
      visibility: showPaymentHistory,
    },

    {
      url: `/coverage/${lineOfBusinessURL}/${planCode}/${policyNumber}/profile`,
      urlLabel: 'my profile',
      isInternal: true,
      iconType: IconType.CIRCLE_USER,
      linkText: 'My Profile',
    },

    {
      url: `/coverage/${lineOfBusinessURL}/${planCode}/${policyNumber}/beneficiaries`,
      urlLabel: 'beneficiaries',
      isInternal: true,
      iconType: IconType.USER_GROUP,
      linkText: 'Beneficiaries',
      visibility: showBeneficiaries,
    },

    {
      url: `/coverage/${lineOfBusinessURL}/${planCode}/${policyNumber}/riders`,
      urlLabel:
        lineOfBusiness === LineOfBusiness.ANNUITY
          ? 'riders and extras'
          : 'riders and feature',
      isInternal: true,
      iconType: IconType.SUPPORT,
      linkText:
        lineOfBusiness === LineOfBusiness.ANNUITY
          ? 'Riders and extras'
          : 'riders and features',
      visibility: showRiders,
    },

    {
      url: `/coverage/${lineOfBusinessURL}/${planCode}/${policyNumber}/documents`,
      urlLabel: 'documents',
      isInternal: true,
      iconType: IconType.DOCUMENT_TEXT,
      linkText: 'Documents',
      visibility: showDocuments,
    },
  ];

  return <GenerateClickableContainerList links={links} />;
};

export default AdditionalLinks;
