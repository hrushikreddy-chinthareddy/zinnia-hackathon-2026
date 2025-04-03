import { generateTableRows } from '../__mocks';
import type { AmlTrainingItem } from '../../../types/training-education.types';
import PomTable from '../../../components/pom-table/PomTable';
import { AmlTrainingSidesheet } from './AmlTrainingSidesheet';
import { default as PomStyles } from '../../../styles/pom.module.css';
import clsx from 'clsx';
import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router';
import { getProducer } from '../../../queries/producers';
import { generateMockProducer } from '../../producer/__mock';
import {
  ApiGetProducerResponse,
  MockGetProducerResponse,
} from '../../../types/get.types';

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

// The API spec doesn't have any trainings
const AmlTraining = () => {
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
        emptyRowMessage="There are currently no AML training for this entity."
      />
    );
  }

  // @TODO: clean this up once api spec is fixed
  const amlTrainingRows = isMockFromUrl
    ? tableRows(generateMockProducer(id ?? '').trainings.amlTrainings)
    : [];

  return (
    <PomTable
      headers={tableHeaders}
      rows={amlTrainingRows}
      emptyRowMessage="There are currently no AML training for this entity."
    />
  );
};

export default AmlTraining;
