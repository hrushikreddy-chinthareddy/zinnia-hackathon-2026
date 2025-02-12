import { Button } from '@zinnia/bloom/components';
import { generateAmlTraining, generateTableRows } from '../__mocks';
import type { AmlTrainingItem } from '../../../types/training-education.types';
import PomTable from '../../../components/pom-table/PomTable';
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
  generateTableRows(data, (training) => ({
    carrier: (
      <Button size="small" mode="link">
        {training.carrier}
      </Button>
    ),
    vendor: training.vendor,
    courseNumber: training.courseNumber,
    courseName: training.courseName,
    completionDate: training.completionDate,
    expirationDate: training.expirationDate,
  }));

const AmlTraining = ({ items = amlTrainingData }) => (
  <PomTable headers={tableHeaders} rows={tableRows(items)} />
);

export default AmlTraining;
