import { createContext, useContext } from 'react';

import { Dispatch, SurrenderState } from './types';

export const SurrenderContext = createContext<
  | {
      dispatch: Dispatch;
      state: SurrenderState;
    }
  | undefined
>(undefined);

export function useSurrender() {
  const context = useContext(SurrenderContext);
  if (context === undefined) {
    throw new Error('useSurrender must be used within an SurrenderProvider');
  }
  return context;
}
