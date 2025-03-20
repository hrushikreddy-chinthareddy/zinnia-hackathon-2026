import { toEnterpriseDate } from '@zinnia/utils';
import { ProducerFormData } from '../views/create-producer/types';
import { ClientApi } from './client-http';
import { ProducerType } from '../types';
import { GetProducersResponse } from '../types/search.types';

export const searchProducer = async ({
  nationalProducerNumber,
  limit = 10,
  offset = 0,
}: {
  nationalProducerNumber: number;
  limit?: number;
  offset?: number;
}): Promise<GetProducersResponse> => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const url = new URL(`${baseUrl}/api/pom/distributors/v1/producers/search`);

  url.searchParams.append('limit', limit.toString());
  url.searchParams.append('offset', offset.toString());

  const response = await ClientApi.post(
    url,
    JSON.stringify({ nationalProducerNumber }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return await response.json();
};

export const createProducer = async (data: ProducerFormData) => {
  const reqBody =
    data.recordType === ProducerType.INDIVIDUAL
      ? {
          firstName: data.firstName,
          lastName: data.lastName,
          nationalProducerNumber: data.nationalProducerNumber,
          dateOfBirth: toEnterpriseDate(data.dateOfBirth),
          email: data.email,
          carrier: data.carrier,
          producerType: data.recordType,
        }
      : {
          producerType: data.recordType,
          fullName: data.fullName,
          nationalProducerNumber: data.nationalProducerNumber,
          email: data.email,
          agencyType: data.corporationType,
          carrier: data.carrier,
          channel: data.channel,
        };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const url = new URL(`${baseUrl}/api/pom/bpm/onboarding/v1/producer`);

  const response = await ClientApi.post(url, JSON.stringify(reqBody), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};
