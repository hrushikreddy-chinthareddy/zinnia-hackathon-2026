import { ProducerType } from '../../types';
import { SearchResult } from '../../types/search.types';

export const generateSearchResults = (npn: number): SearchResult[] => {
  return [
    {
      producerType: ProducerType.INDIVIDUAL,
      id: 'c8973ee6-45c3-41f0-b496-2d51c0cdafc9',
      firstName: 'Jane',
      lastName: 'Doe',
      producerName: '123456789',
      nationalProducerNumber: npn.toString(),
      email: 'producer@g.com',
      phone: '514999999',
    },
  ];
};
