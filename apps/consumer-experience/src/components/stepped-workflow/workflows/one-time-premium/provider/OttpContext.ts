import { createContext, useContext } from 'react';

import { Dispatch, OttpState } from './types';

export const OttpContext = createContext<
  { state: OttpState; dispatch: Dispatch } | undefined
>(undefined);

export function useOttp() {
  const context = useContext(OttpContext);
  if (context === undefined) {
    throw new Error('useOttp must be used within an OttpProvider');
  }
  return context;
}
