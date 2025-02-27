import { generateProductTraining } from '../__mocks';
import type { ProductTrainingItem } from '../../../types/training-education.types';
import PomTable from '../../../components/pom-table/PomTable';
import { ProductTrainingSidesheet } from './ProductTrainingSidesheet';
import clsx from 'clsx';
import { default as PomStyles } from '../../../styles/pom.module.css';

const productTrainingData = generateProductTraining();
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

const ProductTraining = ({ items = productTrainingData }) => (
  <PomTable
    headers={tableHeaders}
    rows={tableRows(items)}
    emptyRowMessage="There are currently no product training for this entity."
  />
);

export default ProductTraining;
