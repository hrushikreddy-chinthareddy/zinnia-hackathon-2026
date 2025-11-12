import { createContext, useContext } from 'react';

import { Dispatch, FreeLookCancelState } from './types';

export const FreeLookCancelContext = createContext<
  | {
      dispatch: Dispatch;
      state: FreeLookCancelState;
    }
  | undefined
>(undefined);

export function useFreeLookCancel() {
  const context = useContext(FreeLookCancelContext);
  if (context === undefined) {
    throw new Error(
      'useFreeLookCancel must be used within a FreeLookCancelProvider'
    );
  }
  return context;
}
