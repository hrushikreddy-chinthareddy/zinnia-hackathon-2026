import { generateAmlTraining, generateTableRows } from '../__mocks';
import type { AmlTrainingItem } from '../../../types/training-education.types';
import PomTable from '../../../components/pom-table/PomTable';
import { AmlTrainingSidesheet } from './AmlTrainingSidesheet';
import { default as PomStyles } from '../../../styles/pom.module.css';
import clsx from 'clsx';
const amlTrainingData = generateAmlTraining(1);

const tableHeaders = {
  carrier: 'Carrier',
  vendor: 'Vendor',
  courseNumber: 'Course Number',
  courseName: 'Course Name',
  completionDate: 'Completion Date',
  expirationDate: 'Expiry Date',
};

const tableRows = (data: AmlTrainingItem[]) =>
  generateTableRows(data, training => ({
    carrier: (
      <AmlTrainingSidesheet
        trigger={
          <span className={clsx(PomStyles.cta)}>{training.carrier}</span>
        }
        amlTraining={training}
      />
    ),
    vendor: training.vendor,
    courseNumber: training.courseNumber,
    courseName: training.courseName,
    completionDate: training.completionDate,
    expirationDate: training.expirationDate,
  }));

const AmlTraining = ({ items = amlTrainingData }) => {
  return (
    <PomTable
      headers={tableHeaders}
      rows={tableRows(items)}
      emptyRowMessage="There are currently no AML training for this entity."
    />
  );
};

export default AmlTraining;
