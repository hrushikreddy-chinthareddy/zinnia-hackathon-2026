import {
  AmlTrainingItem,
  StateTrainingItem,
} from '../../types/training-education.types';

const generateTraining =
  <T>(data: T) =>
  (numberOfRows: number): Array<T> =>
    Array(numberOfRows).fill(data);

const mockAmlTrainingItem: AmlTrainingItem = {
  carrier: 'Primerica',
  vendor: '0012149A',
  courseNumber: '12458-A',
  courseName: 'AML 2023 CA',
  completionDate: '01/01/2023',
  expirationDate: '01/01/2028',
};
export const generateAmlTraining = generateTraining(mockAmlTrainingItem);

export const generateProductTraining = () => [
  {
    carrier: 'Primerica',
    product: 'AML 2023 CA',
    completionDate: '01/01/2023',
  },
  {
    carrier: 'Primerica',
    product: 'AML 2024 CA',
    completionDate: '01/01/2023',
  },
  {
    carrier: 'AAA Insurance',
    product: 'AML 2000 CA',
    completionDate: '01/01/2023',
  },
];

const mockStateTrainingItem: StateTrainingItem = {
  vendor: '0012149A',
  courseNumber: '12458-A',
  courseName: 'AML 2023 CA',
  state: 'CA',
  hours: 10,
  completionDate: '01/01/2023',
  expirationDate: '01/01/2028',
};
export const generateStateTraining = generateTraining(mockStateTrainingItem);

export const generateTableRows = <T>(
  data: T[],
  callback: (training: T) => Record<keyof T, React.ReactNode>
): Record<keyof T, React.ReactNode>[] => data.map(callback);
