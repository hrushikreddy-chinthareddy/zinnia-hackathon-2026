// @TODO: change this once we integrate with backend
// I'm using context to make it easier to pass the producer data to the components

import { GetProducerResponse } from '@deps/types/pom/types';
import { createContext } from 'react';

// and avoid prop drilling and whatnot
export const ProducerContext = createContext<GetProducerResponse | null>(null);
