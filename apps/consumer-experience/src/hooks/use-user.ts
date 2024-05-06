import { useContext } from 'react';

import { UserContext } from '@/components/providers/UserContext';

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
