import { createContext } from 'react';

import { UserContext as UserContextType } from '@/types/auth';

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);
