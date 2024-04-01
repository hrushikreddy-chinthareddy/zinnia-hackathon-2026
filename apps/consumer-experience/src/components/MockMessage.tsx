'use client';
import { IconType } from '@zinnia/bloom/internal/components';

import { NoDataAvailable } from '@/components/no-data-available/NoDataAvailable';
import useMock from '@/hooks/use-mock';
import { isProd } from '@/utils';

const MockMessage = () => {
  const { setMock } = useMock();
  if (!isProd()) {
    return (
      <div className="mt-lg">
        <NoDataAvailable iconType={IconType.DATABASE}>
          <p>
            <strong>Internal Message</strong>: The API is currently not
            responding or no data was returned. Click{' '}
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
