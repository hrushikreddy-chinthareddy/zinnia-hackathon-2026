import { SideSheetProps } from '@zinnia/bloom/components';
import { standardDateMonthDayYear } from '@zinnia/utils';
import { ViewSidesheet } from '../../../components/view-sidesheet/ViewSidesheet';
import { StateTrainingItem } from '../../../types/training-education.types';

export interface StateTrainingSidesheetProps
  extends Omit<SideSheetProps, 'children' | 'header'> {
  stateTraining: StateTrainingItem;
}

export const StateTrainingSidesheet = ({
  trigger,
  stateTraining,
  ...props
}: StateTrainingSidesheetProps) => {
  const fields = [
    {
      label: 'Vendor',
      value: stateTraining.vendor,
    },
    {
      label: 'Course number',
      value: stateTraining.courseNumber,
    },
    {
      label: 'Course name',
      value: stateTraining.courseName,
    },
    {
      label: 'State',
      value: stateTraining.state,
    },
    {
      label: 'Hours',
      value: stateTraining.hours,
    },
    {
      label: 'Completion date',
      value: standardDateMonthDayYear(stateTraining.completionDate),
    },
    {
      label: 'Expiry date',
      value: standardDateMonthDayYear(stateTraining.expirationDate),
    },
  ];

  return (
    <ViewSidesheet
      header={stateTraining.vendor}
      trigger={trigger}
      fields={fields}
      {...props}
    />
  );
};
