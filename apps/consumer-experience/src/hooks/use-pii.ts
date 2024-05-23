import { useContext } from 'react';

import { PiiContext } from '@/components/providers/PiiContext';

// Custom hook to use the user context
export const usePii = () => {
  const context = useContext(PiiContext);
  if (!context) {
    throw new Error('usePii must be used within a PiiContext');
  }
  return context;
};
