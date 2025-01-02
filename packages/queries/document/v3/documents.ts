import axios from 'axios';
import https from 'https';
import { v4 as uuidV4 } from 'uuid';
import { UserProfile } from '../../../../apps/ops/src/models/user-profile';
import { ApiResponse } from '../../types/api-response';

type DocumentSearchBody = {
  parentCarrierCode?: string;
  documentClassification?:
    | 'INBOUND'
    | 'OUTBOUND'
    | 'SERVICE_REQUEST'
    | 'TAX_FORMS'; // INBOUND = Policy, OUTBOUND = Correspondence (SED), other two aren't ready day 1
  documentType?: string;
  documentCategory?:
    | 'NEW_BUSINESS'
    | 'POST_ISSUE'
    | 'DEATH'
    | 'CORRESPONDENCE'
    | 'TAX_FORMS';
  policyNumber?: string; // Also known as contract number
  planCode?: string; // combined with policy number, uniquifies the policy in question
  documentDate?: string; // date when the document was created or issued, formatted: YYYY-MM-DDTHH:mm:ss.SSSZ
  documentStartDate?: string; // start date of the document period for filtering results, formatted: YYYY-MM-DDTHH:mm:ss.SSSZ
  documentEndDate?: string; // end date of the document period for filtering results, formatted: YYYY-MM-DDTHH:mm:ss.SSSZ
  documentStatus?: ('ACTIVE' | 'INACTIVE')[]; // Statuses the document may have, supporting filtering by multiple statuses
  periodYear?: number; // the year part of the period associated with the document
  periodQuarter?: string; // the quarter part of the period associated with the document, in Q1-Q4 format
  ownerSSN?: string; // Social Security number of the document owner
  appId?: string; // Application ID tied to the document for tracking and retrieval
  zinniaLiveCaseId?: string; // Unique case ID in the Zinnia system associated with the document
  agentTaxId?: string; // Tax ID of the agent handling the document
  orderBy?: string; // field used to order search results.  Defaults to document category
  orderDirection?: 'ASC' | 'DESC'; // direction to order results
};

// BPB - this assumes NEXT_PUBLIC_BACKEND_URL is set in the .env file
const documentsV3Url =
  process.env.NEXT_PUBLIC_BACKEND_URL + '/document/v3/documents';
// uses the v3 enterprise documents api to search for documents
// This endpoint will return results from v2 if the carrier code isn't supported in v3 yet
export const documentSearch = async ({
  limit = 10,
  offset = 0,
  searchBody,
  correlationId,
  authToken,
  user,
  loggingContext,
}: {
  limit?: number;
  offset?: number;
  searchBody: DocumentSearchBody;
  correlationId?: string;
  authToken?: string;
  user?: UserProfile;
  loggingContext?: any;
}): Promise<ApiResponse<any>> => {
  try {
    const results = await axios.post(
      `${documentsV3Url}/search?limit=${limit}&offset=${offset}`,
      searchBody,
      {
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
        headers: {
          authorization: `Bearer ${authToken}`,
          ['x-correlation-id']: correlationId || uuidV4(),
        },
      }
    );
    if (results.status === 200) {
      return { data: results.data, error: null };
    } else {
      // BPB - add logging somehow
      return {
        data: results.data,
        error: {
          status: results.status || 500,
          ...new Error(results.statusText),
        },
      };
    }
  } catch (e) {}
};
