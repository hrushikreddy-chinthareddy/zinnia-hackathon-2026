import { Badge, BadgeVariant } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { HTMLAttributes } from 'react';

import { AgentSidesheet } from '@/components/agent-sidesheet/AgentSidesheet';
import { getPolicyDetails } from '@/services/policy';
import { pomAgentSearch } from '@/services/pom/distributors/v1/producers/search';
import { FilteredPomAgentData } from '@/services/pom/distributors/v1/producers/search/transformers';
import { ApiResponse } from '@/services/types';
import { isAnnuity, policyStatusDisplayText } from '@/utils/data';
import { buildCommonLogContext } from '@/utils/logging/server-logging';
import { toSentenceCase } from '@/utils/strings';
import { LineOfBusiness, PolicyStatus } from '@zinnia/api-types/types/sor';

import styles from './HeaderPolicyDetails.module.css';

interface FieldVisibility {
  policyName: boolean;
  policyNumber: boolean;
  status: boolean;
  agentInfo: boolean;
}

export interface Props extends HTMLAttributes<HTMLDivElement> {
  planCode: string;
  policyNumber: string;
  lineOfBusiness?: LineOfBusiness;
  fieldVisibility?: FieldVisibility;
}

export const HeaderPolicyDetails = async ({
  className,
  lineOfBusiness = LineOfBusiness.LIFE,
  planCode,
  policyNumber,
  fieldVisibility = {
    policyName: true,
    policyNumber: true,
    status: true,
    agentInfo: true,
  },
}: Props) => {
  const loggingContext = await buildCommonLogContext();

  const { data: policyData, error: policyError } = await getPolicyDetails(
    { planCode, policyNumber },
    loggingContext
  );

  let pomAgentData: ApiResponse<FilteredPomAgentData | undefined> = {
    data: undefined,
    error: null,
  };
  if (fieldVisibility.agentInfo && policyData) {
    pomAgentData = await pomAgentSearch(
      {
        clientCode: policyData?.carrierId || '',
        agentId: policyData?.primaryAgentExternalId || '',
      },
      loggingContext
    );
  }

  const badgeVariant = () => {
    switch (policyData?.policyStatus) {
      case PolicyStatus.PENDINGISSUED:
      case PolicyStatus.ACTIVE:
        return BadgeVariant.SUCCESS;
      case PolicyStatus.PENDINGLAPSE:
        return BadgeVariant.WARNING;
      case PolicyStatus.LAPSE:
      case PolicyStatus.SURRENDERED:
      case PolicyStatus.CANCELEDFREELOOK:
        return BadgeVariant.ERROR;
      default:
        return BadgeVariant.DEFAULT;
    }
  };

  //TODO: Do we need some sort of error state?
  if (!policyData || policyError) {
    return null;
  }

  return (
    <div
      className={clsx(
        { [className as string]: className },
        // TODO: update this to use the font style variables
        // on larger screen sizes this should be lg-alt
        'typography-labels-label-md-alt',
        styles.container
      )}
    >
      {fieldVisibility.status && (
        <div className={`mr-md ${styles.mobileBadge}`}>
          <Badge
            label={toSentenceCase(
              policyStatusDisplayText[policyData.policyStatus as PolicyStatus]
            )}
            variant={badgeVariant()}
          />
        </div>
      )}

      <div>
        {fieldVisibility.policyName && (
          <p>{policyData.product?.marketingName}</p>
        )}

        {fieldVisibility.policyNumber && (
          <p>
            <span>{isAnnuity(lineOfBusiness) ? 'Contract' : 'Policy'} #: </span>
            <span>{policyNumber}</span>
          </p>
        )}

        {/* There is the possibility that an agent id is on the policy, but no agent data
          is returned from mcs so null check is on the name rather than on the full object */}
        {pomAgentData?.data && fieldVisibility.agentInfo && (
          <>
            <span>Agent:</span>
            <AgentSidesheet agentData={pomAgentData.data} />
          </>
        )}
      </div>
      {fieldVisibility.status && (
        <div className={`ml-md ${styles.desktopBadge}`}>
          <Badge
            label={toSentenceCase(
              policyStatusDisplayText[policyData.policyStatus as PolicyStatus]
            )}
            variant={badgeVariant()}
          />
        </div>
      )}
    </div>
  );
};
