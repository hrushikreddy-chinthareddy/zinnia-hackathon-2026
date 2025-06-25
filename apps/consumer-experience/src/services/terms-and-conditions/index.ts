import { logApiNotOkDetails } from '@/utils/api';
import { getSession } from '@/utils/auth';
import { logError } from '@/utils/logging/log-fns';
import { getUserInfoFromSession } from '@/utils/logging/server-logging';

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

export const fetchAcknowledgedCases = async ({
  planCode,
  policyNumber,
}: {
  planCode: string;
  policyNumber: string;
}): Promise<CaseAcknowledgmentResponse> => {
  const res: CaseAcknowledgmentResponse = {
    data: null,
    error: null,
  };

  try {
    const session = await getSession();
    const { partyId } = getUserInfoFromSession(session);

    const rawResponse = await EnterpriseTokenApi.get(
      `${caseAcknowlegementApiBaseUrl}/${planCode}/${policyNumber}/${partyId}`
    );

    const parsedResponse = await rawResponse.json();

    if (!rawResponse.ok) {
      logError(
        'Error fetching acknowledged cases',
        JSON.stringify(
          await logApiNotOkDetails({
            rawResponse,
            parsedResponse,
          })
        )
      );
    }

    res.data = parsedResponse;
  } catch (error) {
    res.error = {
      message: 'Something went wrong',
      status: 500,
      name: 'getAcknowledgedCases Error',
    };
    console.error('Error fetching acknowledged cases', error);
  }

  return res;
};

export const acknowledgeCase = async ({
  acknowledgedIds,
  caseId,
  planCode,
  policyNumber,
}: AcknowledgeCaseDTO): Promise<CaseAcknowledgmentResponse> => {
  const res: CaseAcknowledgmentResponse = {
    data: null,
    error: null,
  };

  try {
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
      }
    );

    const parsedResponse = await rawResponse.json();

    if (!rawResponse.ok) {
      logError(
        'Error fetching case',
        JSON.stringify(
          await logApiNotOkDetails({
            rawResponse,
            parsedResponse,
          })
        )
      );

      throw new Error('Error acknowledging case');
    }

    res.data = parsedResponse;
  } catch (error) {
    res.error = {
      message: 'Something went wrong',
      status: 500,
      name: 'acknowledgeCase Error',
    };
  }

  return res;
};
