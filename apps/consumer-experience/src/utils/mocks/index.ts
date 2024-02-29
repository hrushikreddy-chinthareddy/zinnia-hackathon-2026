import MockAdapter from 'axios-mock-adapter';

import { AxiosInstance } from '@/services/http';

export default function applyMockAdapter(axiosInstance: AxiosInstance) {
  const mock = new MockAdapter(axiosInstance);
  mock.onGet('/api/policies').reply(() => {
    const profile = {
      id: '5e8891ab188cd28',
      avatar: '/static/mock-images/avatars/jane.png',
      bio: 'Product Designer',
      email: 'jane@test.com',
      name: 'Jane',
    };
    return [200, { profile }];
  });
}
