import { toEnterpriseDate } from '@zinnia/utils';
import { ProducerFormData } from '../views/create-producer/types';
import { ClientApi } from './client-http';
import { ProducerType } from '../types';

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

  const response = await ClientApi.post(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/pom/bpm/onboarding/v1/producer`,
    JSON.stringify(reqBody),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return await response.json();
};
