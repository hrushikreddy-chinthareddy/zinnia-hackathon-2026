import type { StateTrainingItem } from '../../../types/training-education.types';
import PomTable from '../../../components/pom-table/PomTable';
import { generateTableRows } from '../__mocks';
import { StateTrainingSidesheet } from './StateTrainingSidesheet';
import clsx from 'clsx';
import { default as PomStyles } from '../../../styles/pom.module.css';
import { useParams, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { getProducer } from '../../../queries/producers';
import { generateMockProducer } from '../../producer/__mock';
import {
  ApiGetProducerResponse,
  MockGetProducerResponse,
} from '../../../types/get.types';

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

const StateTraining = () => {
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
        emptyRowMessage="There are currently no state training for this entity."
      />
    );
  }

  // @TODO: clean this up once api spec is fixed
  const stateTrainingRows = isMockFromUrl
    ? tableRows(generateMockProducer(id ?? '').trainings.stateTrainings)
    : [];
  return (
    <PomTable
      headers={tableHeaders}
      rows={stateTrainingRows}
      emptyRowMessage="There are currently no state training for this entity."
    />
  );
};

export default StateTraining;
