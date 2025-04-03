import { ContactInfo } from './contact-info/ContactInfo';
import { Identification } from './identification/Identification';
import { ProducerType } from '../../types';
import { BackgroundChecks } from './background-checks/BackgroundChecks';
import { getProducer } from '../../queries/producers';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router';
import { Error } from '../../components/transaction-response-card/TransactionResponseCard';
import { generateMockProducer } from '../producer/__mock';
import {
  ApiGetProducerResponse,
  MockGetProducerResponse,
} from '../../types/get.types';

const EntityInformation = () => {
  const { id } = useParams();

  const [searchParams] = useSearchParams();
  const isMockFromUrl = searchParams.get('isMock') === 'true';

  const { data: queryData } = useQuery({
    queryKey: ['producer', id],
    queryFn: () => getProducer(id ?? ''),
  });

  const data: ApiGetProducerResponse | MockGetProducerResponse | undefined =
    isMockFromUrl ? generateMockProducer(id ?? '') : queryData;

  // If we're not mocking and there's no data returned by the query
  if (!isMockFromUrl && !data) {
    return <Error message={`Error finding producer with id ${id}`} />;
  }

  const producerType = data?.producerType;

  return (
    <div>
      <Identification />
      <ContactInfo />
      {producerType === ProducerType.INDIVIDUAL && <BackgroundChecks />}
    </div>
  );
};

export default EntityInformation;
