import { Label } from '@zinnia/bloom/components';
import { clsx } from 'clsx';

import { ProducerType } from '../../../types';

import { default as styles } from './Identification.module.css';
import { useParams, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { getProducer } from '../../../queries/producers';
import { Error as TransactionErrorCard } from '../../../components/transaction-response-card/TransactionResponseCard';
import { generateMockProducer } from '../../producer/__mock';
import {
  ApiGetProducerResponse,
  MockGetProducerResponse,
} from '../../../types/get.types';
import { DEFAULT_ERROR_STRING } from '@zinnia/utils';

export const Identification = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isMockFromUrl = searchParams.get('isMock') === 'true';

  const { data: queryData } = useQuery({
    queryKey: ['producer', id],
    queryFn: () => getProducer(id ?? ''),
  });

  const data: ApiGetProducerResponse | MockGetProducerResponse | undefined =
    isMockFromUrl ? generateMockProducer(id ?? '') : queryData;

  if (!data && !isMockFromUrl) {
    return (
      <TransactionErrorCard message={`Error finding producer with id ${id}`} />
    );
  }

  const corporationIdentificationFields = [
    {
      label: 'Type of corporation',
      value: data?.agencyType ?? DEFAULT_ERROR_STRING,
    },
    {
      label: 'Tax identification number',
      value: data?.taxPayerIdentificationNumber ?? DEFAULT_ERROR_STRING,
    },
    { label: 'Channel', value: data?.channel ?? DEFAULT_ERROR_STRING },
  ];

  const individualIdentificationFields = [
    { label: 'Birth date', value: data?.dateOfBirth ?? DEFAULT_ERROR_STRING },
    {
      label: 'Social Security Number',
      value: data?.socialSecurityNumber ?? DEFAULT_ERROR_STRING,
    },
  ];

  const identificationFields = (() => {
    switch (data?.producerType) {
      case ProducerType.CORPORATION:
        return corporationIdentificationFields;
      case ProducerType.INDIVIDUAL:
        return individualIdentificationFields;

      // @TODO: not sure if this is the right approach since i don't see an error boundary component
      // should I even check for this condition? or return []?
      // also should this be logged somewhere?
      default:
        throw new Error('Unknown producer type');
    }
  })();

  return (
    <div className="card-section">
      <h2>Identification</h2>
      <div className={clsx(styles.cardSubSectionContent)}>
        {identificationFields.map(field => (
          <div key={field.label}>
            <Label>{field.label}</Label>
            <span>{field.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
