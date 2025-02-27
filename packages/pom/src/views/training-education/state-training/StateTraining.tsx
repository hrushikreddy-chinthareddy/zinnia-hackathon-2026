import type { StateTrainingItem } from '../../../types/training-education.types';
import PomTable from '../../../components/pom-table/PomTable';
import { generateStateTraining, generateTableRows } from '../__mocks';
import { StateTrainingSidesheet } from './StateTrainingSidesheet';
import clsx from 'clsx';
import { default as PomStyles } from '../../../styles/pom.module.css';

const tableHeaders: Record<keyof StateTrainingItem, string> = {
  vendor: 'Vendor',
  courseNumber: 'Course Number',
  courseName: 'Course Name',
  state: 'State',
  hours: 'Hours',
  completionDate: 'Completion Date',
  expirationDate: 'Expiry Date',
};

const tableRows = (data: StateTrainingItem[]) =>
  generateTableRows(data, training => ({
    vendor: (
      <StateTrainingSidesheet
        trigger={<span className={clsx(PomStyles.cta)}>{training.vendor}</span>}
        stateTraining={training}
      />
    ),
    courseNumber: training.courseNumber,
    courseName: training.courseName,
    state: training.state,
    hours: training.hours,
    completionDate: training.completionDate,
    expirationDate: training.expirationDate,
  }));

const StateTraining = ({ items = generateStateTraining(6) }) => (
  <PomTable
    headers={tableHeaders}
    rows={tableRows(items)}
    emptyRowMessage="There are currently no state training for this entity."
  />
);

export default StateTraining;
