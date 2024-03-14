import Link from 'next/link';

import { isProd } from '@/utils';

const MockMessage = () => {
  if (!isProd()) {
    return (
      <p className="my-lg">
        The API is currently not responding. Click{' '}
        <Link href="/policies?..mock..=on">here</Link> to turn on mock data.
      </p>
    );
  }

  return null;
};

export default MockMessage;
