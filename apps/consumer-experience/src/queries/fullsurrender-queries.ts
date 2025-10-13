import { SurrenderState } from '@/components/stepped-workflow/workflows/surrender/provider/types';
import {
  FullSurrenderBPMResponse,
  FullSurrenderSubmissionResponse,
} from '@/services/bpm/fullsurrender';
import { ClientApi } from '@/services/client-http';

export const postFullSurrenderValidation = async ({
  planCode,
  policyNumber,
  body,
}: {
  planCode: string;
  policyNumber: string;
  body: SurrenderState;
}): Promise<FullSurrenderBPMResponse> => {
  const response = await (
    await ClientApi.post(
      `/api/bpm/${planCode}/${policyNumber}/fullsurrender/validation`,
      JSON.stringify(body)
    )
  ).json();

  if (response.error || !response) {
    throw response.error;
  }

  return response.data;
};

export const submitFullSurrender = async ({
  planCode,
  policyNumber,
  body,
}: {
  planCode: string;
  policyNumber: string;
  body: SurrenderState;
}): Promise<FullSurrenderSubmissionResponse> => {
  const response = await (
    await ClientApi.post(
      `/api/bpm/${planCode}/${policyNumber}/fullsurrender`,
      JSON.stringify(body)
    )
  ).json();

  if (response.error || !response || 'errors' in response.data) {
    throw response.error;
  }

  return response.data;
};
