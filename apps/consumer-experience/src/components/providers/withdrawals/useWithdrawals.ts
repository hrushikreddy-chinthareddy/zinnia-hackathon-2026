import { createContext, useContext } from 'react';

import { Dispatch, WithdrawalsState } from './types';

export const WithdrawalsContext = createContext<
  | {
      dispatch: Dispatch;
      state: WithdrawalsState;
    }
  | undefined
>(undefined);

export function useWithdrawals() {
  const context = useContext(WithdrawalsContext);
  if (context === undefined) {
    throw new Error(
      'useWithdrawals must be used within an WithdrawalsProvider'
    );
  }
  return context;
}
