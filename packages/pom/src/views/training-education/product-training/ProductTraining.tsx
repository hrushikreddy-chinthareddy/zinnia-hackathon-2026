import type { ProductTrainingItem } from '../../../types/training-education.types';
import PomTable from '../../../components/pom-table/PomTable';
import { ProductTrainingSidesheet } from './ProductTrainingSidesheet';
import clsx from 'clsx';
import { default as PomStyles } from '../../../styles/pom.module.css';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router';
import { getProducer } from '../../../queries/producers';
import { generateMockProducer } from '../../producer/__mock';
import {
  ApiGetProducerResponse,
  MockGetProducerResponse,
} from '../../../types/get.types';

const tableHeaders: Record<keyof ProductTrainingItem, string> = {
  carrier: 'Carrier',
  product: 'Product',
  completionDate: 'Completion Date',
};

const trainingRow = (training: ProductTrainingItem) => ({
  carrier: (
    <ProductTrainingSidesheet
      trigger={<span className={clsx(PomStyles.cta)}>{training.carrier}</span>}
      productTraining={training}
    />
  ),
  product: training.product,
  completionDate: training.completionDate,
});

const expandableTrainingRow = (
  carrier: string,
  trainings: ProductTrainingItem[]
) => {
  const uniqueProducts = new Set(trainings.map(t => t.product));

  return {
    carrier: <span className={clsx(PomStyles.cta)}>{carrier}</span>,
    product: `${uniqueProducts.size} Product${uniqueProducts.size > 1 ? 's' : ''}`,
    completionDate: '',
  };
};

const tableRows = (data: ProductTrainingItem[]) => {
  // 1- Group trainings by carrier
  const grouped = data.reduce(
    (acc, training) => {
      const carrier = training.carrier;
      if (!acc[carrier]) {
        acc[carrier] = [];
      }
      acc[carrier].push(training);
      return acc;
    },
    {} as Record<string, ProductTrainingItem[]>
  );

  // 2- Create rows for grouped trainings
  return Object.entries(grouped).map(([carrier, trainings]) => {
    if (trainings.length === 1) {
      return trainingRow(trainings[0]);
    }

    // 3- If there are multiple trainings, create an expandable row with trainings under it
    return [
      expandableTrainingRow(carrier, trainings),
      ...trainings.map(trainingRow),
    ];
  });
};

const ProductTraining = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isMockFromUrl = searchParams.get('isMock') === 'true';

  const { data: queryData } = useQuery({
    queryKey: ['producer', id],
    queryFn: () => getProducer(id ?? ''),
  });

  const data: ApiGetProducerResponse | MockGetProducerResponse | undefined =
    isMockFromUrl ? generateMockProducer(id ?? '') : queryData;

  // have to do this weird ts check because the api spec doesn't have any trainings
  // this will change once the api spec is fixed
  if (!isMockFromUrl && (!data || !('trainings' in data))) {
    return (
      <PomTable
        headers={tableHeaders}
        rows={[]}
        emptyRowMessage="There are currently no product training for this entity."
      />
    );
  }

  // @TODO: clean this up once api spec is fixed
  const productTrainingRows = isMockFromUrl
    ? tableRows(generateMockProducer(id ?? '').trainings.productTrainings)
    : [];

  return (
    <PomTable
      headers={tableHeaders}
      rows={productTrainingRows}
      emptyRowMessage="There are currently no product training for this entity."
    />
  );
};

export default ProductTraining;
