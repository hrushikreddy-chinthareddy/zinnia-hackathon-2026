import { createContext, useContext } from 'react';

import { Dispatch, SystematicPremiumsState } from './types';

export const SystematicPremiumsContext = createContext<
  | {
      dispatch: Dispatch;
      state: SystematicPremiumsState;
    }
  | undefined
>(undefined);

export function useSystematicPremiums() {
  const context = useContext(SystematicPremiumsContext);
  if (context === undefined) {
    throw new Error(
      'useSystematicPremiums must be used within an SystematicPremiumsProvider'
    );
  }
  return context;
}
