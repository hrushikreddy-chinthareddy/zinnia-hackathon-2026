import { SideSheetProps } from '@zinnia/bloom/components';
import { standardDateMonthDayYear } from '@zinnia/utils';
import { ViewSidesheet } from '../../../components/view-sidesheet/ViewSidesheet';
import { ProductTrainingItem } from '../../../types/training-education.types';

export interface ProductTrainingSidesheetProps
  extends Omit<SideSheetProps, 'children' | 'header'> {
  productTraining: ProductTrainingItem;
}

export const ProductTrainingSidesheet = ({
  trigger,
  productTraining,
  ...props
}: ProductTrainingSidesheetProps) => {
  const fields = [
    {
      label: 'Carrier',
      value: productTraining.carrier,
    },
    {
      label: 'Product',
      value: productTraining.product,
    },
    {
      label: 'Completion date',
      value: standardDateMonthDayYear(productTraining.completionDate),
    },
  ];

  return (
    <ViewSidesheet
      header={productTraining.carrier}
      trigger={trigger}
      fields={fields}
      {...props}
    />
  );
};
