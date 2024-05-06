import { createContext } from 'react';

import { UserContext as UserContexType } from '@/types/auth';

export const UserContext = createContext<UserContexType | undefined>(undefined);
