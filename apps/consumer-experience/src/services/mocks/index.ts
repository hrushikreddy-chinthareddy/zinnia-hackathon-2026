import MockAdapter from 'axios-mock-adapter';

import { AxiosInstance } from '@/services/http';

import { policyOverviewData } from './policy';
import { policyRiders } from './policy-riders';
import { profileData } from './profile';
import { baseAppUrl } from '../api-config';

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

  mock.onGet(`${baseAppUrl}/api/profile`).reply(() => {
    return [200, profileData];
  });

  // TODO: send in policy number here?
  const policyUrl = new RegExp(`${baseAppUrl}/api/policies/*`);
  mock.onGet(policyUrl).reply(() => {
    return [200, policyOverviewData];
  });

  mock.onGet(`${baseAppUrl}/api/policy-riders`).reply(() => {
    return [200, policyRiders];
  });
}
