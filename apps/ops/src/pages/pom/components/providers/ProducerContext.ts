// @TODO: change this once we integrate with backend
// I'm using context to make it easier to pass the producer data to the components

import { createContext } from 'react';
import { GetProducerResponse } from '../../types';

// and avoid prop drilling and whatnot
export const ProducerContext = createContext<GetProducerResponse | null>(null);
