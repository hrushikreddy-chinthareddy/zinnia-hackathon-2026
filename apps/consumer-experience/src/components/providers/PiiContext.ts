import { createContext } from 'react';

import { PiiContext as PiiContexType } from '@/types/pii';

export const PiiContext = createContext<PiiContexType | undefined>(undefined);
