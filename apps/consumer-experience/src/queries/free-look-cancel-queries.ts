import { FreeLookCancelState } from '@/components/stepped-workflow/workflows/free-look-cancel/provider/types';
import { FreeLookCancellationBPMResponse } from '@/services/bpm/free-look-cancel';
import { ClientApi } from '@/services/client-http';
import { ApiResponse } from '@/services/types';

export const submitFreeLookCancellation = async ({
  planCode,
  policyNumber,
  body,
}: {
  planCode: string;
  policyNumber: string;
  body: FreeLookCancelState;
}): Promise<FreeLookCancellationBPMResponse> => {
  const response: ApiResponse<FreeLookCancellationBPMResponse> = await (
    await ClientApi.post(
      `/api/bpm/${planCode}/${policyNumber}/freelookcancellation`,
      JSON.stringify(body)
    )
  ).json();

  if (response.error || !response || 'errors' in response.data) {
    throw response.error;
  }

  return response.data;
};
