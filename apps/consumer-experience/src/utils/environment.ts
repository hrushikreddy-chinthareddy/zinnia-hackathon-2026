import { headers } from 'next/headers';

/**
 *
 * @returns true if the url is running on vercel
 */
export const isVercelEnvironment = () => {
  const headersList = headers();
  const url = headersList.get('host') || '';

  return url.includes('vercel.app');
};
