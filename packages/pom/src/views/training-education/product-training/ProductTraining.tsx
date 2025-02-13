import { Button } from '@zinnia/bloom/components';
import { generateProductTraining, generateTableRows } from '../__mocks';
import type { ProductTrainingItem } from '../../../types/training-education.types';
import PomTable from '../../../components/pom-table/PomTable';

const productTrainingData = generateProductTraining(9);

const tableHeaders: Record<keyof ProductTrainingItem, string> = {
  carrier: 'Carrier',
  product: 'Product',
  completionDate: 'Completion Date',
};

const tableRows = (data: ProductTrainingItem[]) =>
  generateTableRows(data, (training) => ({
    carrier: (
      <Button size="small" mode="link">
        {training.carrier}
      </Button>
    ),
    product: training.product,
    completionDate: training.completionDate,
  }));

const ProductTraining = ({ items = productTrainingData }) => (
  <PomTable headers={tableHeaders} rows={tableRows(items)} />
);

export default ProductTraining;
