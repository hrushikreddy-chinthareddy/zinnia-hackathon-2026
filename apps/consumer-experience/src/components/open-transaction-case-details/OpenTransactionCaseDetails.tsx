'use client';

import { useQuery } from '@tanstack/react-query';
import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';

import { Link } from '@/components/link/Link';
import { useFeatureFlags } from '@/hooks/use-feature-flags';
import { searchCasesByPolicyNumber } from '@/queries/case-queries';
import { QueryKeys } from '@/queries/query-keys';
import { RouteKey } from '@/route-map';
import { CaseSummary, CaseTypes } from '@/types/case';
import { caseTypesToProccessSubtype } from '@/utils/cases';
import { lineOfBusinessUrlPath } from '@/utils/data';
import { FEATURE_FLAGS } from '@/utils/optimizely/flags';
import { indefiniteArticle } from '@/utils/strings';
import { LineOfBusiness } from '@zinnia/api-types/types/sor';

import styles from './OpenTransactionCaseDetails.module.css';
import { ClientOnly } from '../client-only/ClientOnly';

const caseTypeDisplay: Partial<{ [key in CaseTypes]: string }> = {
  [CaseTypes.ADDRESS_CHANGE]: 'address',
  [CaseTypes.BANK_INFO_CHANGE]: 'bank',
};

export const OpenTransactionCaseDetails = ({
  planCode,
  policyNumber,
  lineOfBusiness,
  caseType,
}: {
  cases?: CaseSummary[];
  planCode: string;
  policyNumber: string;
  lineOfBusiness?: LineOfBusiness;
  caseType: CaseTypes;
}) => {
  const caseDisplay = caseTypeDisplay[caseType] || '';
  const { data: featureFlags } = useFeatureFlags();

  const { data: caseData, isPending } = useQuery({
    queryKey: [QueryKeys.CASES_FOR_POLICY, policyNumber],
    queryFn: () => searchCasesByPolicyNumber({ policyNumber }),
    select: ({ data }) => {
      return {
        hasInProgressCase: data?.find(
          item =>
            item.caseStatus === 'IN_PROGRESS' &&
            item.processSubType === caseTypesToProccessSubtype[caseType]
        ),
        hasException: data?.find(
          item =>
            item.caseStatus === 'EXCEPTION' &&
            item.processSubType === caseTypesToProccessSubtype[caseType]
        ),
      };
    },
  });

  if (
    !featureFlags?.[FEATURE_FLAGS.TRANSACTION_NOTIFICATIONS] ||
    !caseData ||
    isPending
  ) {
    return null;
  }

  return (
    <ClientOnly>
      <div className="mb-lg">
        {caseData?.hasException && (
          <div className="flex-center">
            <AssistiveText
              variant={AssistiveTextVariant.Error}
              text={`There was an error trying to make ${indefiniteArticle(caseDisplay)} ${caseDisplay} update.`}
              className="mb-sm"
            />
            <Link
              isInternal
              href={`/coverage/${lineOfBusinessUrlPath(lineOfBusiness)}/${planCode}/${policyNumber}${RouteKey.NOTIFICATIONS}`}
              className={styles.exceptionNotificationLink}
            >
              View case here
            </Link>
          </div>
        )}
        {caseData?.hasInProgressCase && (
          <AssistiveText
            variant={AssistiveTextVariant.Info}
            text={`There are ${caseDisplay} updates pending.`}
          />
        )}
      </div>
    </ClientOnly>
  );
};
