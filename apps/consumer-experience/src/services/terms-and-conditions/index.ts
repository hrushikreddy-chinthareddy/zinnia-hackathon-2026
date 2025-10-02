import { getSession } from '@/utils/auth';
import {
  CommonLogContext,
  getUserInfoFromSession,
} from '@/utils/logging/server-logging';
import { withLogging } from '@/utils/logging/with-logging';

import { consumerExperienceAPIBaseUrl } from '../api-config';
import { EnterpriseTokenApi } from '../enterprise-api-token-http';

export type CaseAcknowledgmentItem = {
  planCode: string;
  policyNumber: string;
  partyId: string;
  caseId: string;
  dateAcknowledged: string;
  // We need to track the acknowledged IDs of the steps
  // just in case in the future a new step causes
  // the case to go into NIGO
  acknowledgedIds: Array<string>;
};

export type CaseAcknowledgmentResponse = {
  data: Array<CaseAcknowledgmentItem> | null;
  error: {
    message: string;
    status: number;
    name: string;
  } | null;
};

export type AcknowledgeCaseDTO = {
  acknowledgedIds: Array<string> | string;
  caseId: string;
  planCode: string;
  policyNumber: string;
};

const caseAcknowlegementApiBaseUrl = `${consumerExperienceAPIBaseUrl}/CaseAcknowledgment`;

export const fetchAcknowledgedCases = withLogging(
  async (
    {
      planCode,
      policyNumber,
    }: {
      planCode: string;
      policyNumber: string;
    },
    loggingCtx: CommonLogContext
  ): Promise<CaseAcknowledgmentItem[] | null> => {
    const session = await getSession();
    const { partyId } = getUserInfoFromSession(session);

    const rawResponse = await EnterpriseTokenApi.get(
      `${caseAcknowlegementApiBaseUrl}/${planCode}/${policyNumber}/${partyId}`,
      undefined,
      loggingCtx
    );

    const parsedResponse = await rawResponse.json();

    if (!rawResponse.ok) {
      throw new Error('Error fetching acknowledged cases');
    }

    return parsedResponse;
  },
  {
    file: 'services/terms-and-conditions',
    functionName: 'fetchAcknowledgedCases',
  }
);

export const acknowledgeCase = withLogging(
  async (
    { acknowledgedIds, caseId, planCode, policyNumber }: AcknowledgeCaseDTO,
    loggingCtx: CommonLogContext
  ): Promise<CaseAcknowledgmentItem[] | null> => {
    const session = await getSession();
    const { partyId } = getUserInfoFromSession(session);

    const body = {
      acknowledgedIds,
      planCode,
      policyNumber,
      caseId,
      partyId,
      dateAcknowledged: new Date(),
    };

    const rawResponse = await EnterpriseTokenApi.post(
      caseAcknowlegementApiBaseUrl,
      JSON.stringify(body),
      {
        headers: { 'Content-Type': 'application/json' },
      },
      loggingCtx
    );

    const parsedResponse = await rawResponse.json();

    if (!rawResponse.ok) {
      throw new Error('Error acknowledging case');
    }

    return parsedResponse;
  },
  {
    file: 'services/terms-and-conditions',
    functionName: 'acknowledgeCase',
  }
);
