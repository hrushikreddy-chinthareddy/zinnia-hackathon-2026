import { SideSheetProps } from '@zinnia/bloom/components';
import { standardDateMonthDayYear } from '@zinnia/utils';
import { ViewSidesheet } from '../../../components/view-sidesheet/ViewSidesheet';
import { AmlTrainingItem } from '../../../types/training-education.types';

export interface AmlTrainingSidesheetProps
  extends Omit<SideSheetProps, 'children' | 'header'> {
  amlTraining: AmlTrainingItem;
}

export const AmlTrainingSidesheet = ({
  trigger,
  amlTraining,
  ...props
}: AmlTrainingSidesheetProps) => {
  const fields = [
    {
      label: 'Carrier',
      value: amlTraining.carrier,
    },
    {
      label: 'Vendor',
      value: amlTraining.vendor,
    },
    {
      label: 'Course number',
      value: amlTraining.courseNumber,
    },
    {
      label: 'Course name',
      value: amlTraining.courseName,
    },
    {
      label: 'Completion date',
      value: standardDateMonthDayYear(amlTraining.completionDate),
    },
    {
      label: 'Expiry date',
      value: standardDateMonthDayYear(amlTraining.expirationDate),
    },
  ];

  return (
    <ViewSidesheet
      header={amlTraining.carrier}
      trigger={trigger}
      fields={fields}
      {...props}
    />
  );
};
