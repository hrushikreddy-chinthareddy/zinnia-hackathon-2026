'use client';
import { IconType } from '@zinnia/bloom/components';

import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import useMock from '@/hooks/use-mock';
import { isMockAllowed } from '@/utils';

const MockMessage = () => {
  const { setMock } = useMock();
  if (isMockAllowed()) {
    return (
      <div className="mt-lg">
        <NoDataAvailable iconType={IconType.DATABASE} correlationId={undefined}>
          <p>
            <strong
              style={{ color: 'var(--color-status-icon-status-error-icon)' }}
            >
              Internal Message
            </strong>
            : The API is currently not responding or no data was returned. Click{' '}
            <a onClick={setMock} href="#">
              here
            </a>{' '}
            to turn on mock data.
          </p>
        </NoDataAvailable>
      </div>
    );
  }

  return null;
};

export default MockMessage;
