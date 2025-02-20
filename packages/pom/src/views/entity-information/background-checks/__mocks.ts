import { BackgroundCheck, BackgroundCheckStatus } from '../../../types';

export const generateBackgroundChecks = (): BackgroundCheck[] => [
  {
    carrier: 'Acme',
    dateRequested: '2024-01-01',
    provider: 'Provider 1',
    resultDate: '2024-01-01',
    status: BackgroundCheckStatus.IN_PROGRESS,
  },
  {
    carrier: 'AAA insurance',
    dateRequested: '2024-01-01',
    provider: 'Provider 2',
    resultDate: '2024-01-01',
    status: BackgroundCheckStatus.APPROVED,
  },
  {
    carrier: 'Primerica',
    dateRequested: '2024-01-01',
    provider: 'Provider 3',
    resultDate: '2024-01-01',
    status: BackgroundCheckStatus.UNDER_REVIEW,
  },
  {
    carrier: 'Check Inc.',
    dateRequested: '2024-01-01',
    provider: 'Provider 4',
    resultDate: '2024-01-01',
    status: BackgroundCheckStatus.DENIED,
  },
  {
    carrier: 'Sec Benefits',
    dateRequested: '2024-01-01',
    provider: 'Provider 5',
    resultDate: '2024-01-01',
    status: BackgroundCheckStatus.CANT_COMPLETE,
  },
];
