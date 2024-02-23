import applyMockAdapter from '@/services/mocks';

import { axios } from './http';

const clientApi = axios.create();

if (process.env.NEXT_PUBLIC_MOCK_API_REQUEST === 'true') {
  applyMockAdapter(clientApi);
}

export { clientApi };
