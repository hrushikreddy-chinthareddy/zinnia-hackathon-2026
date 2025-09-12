'use client';
import {
  PolicyFeature,
  SystematicProgram,
} from '@xd/api-types/dist/generated-types/sor';
import dayjs from 'dayjs';
import { PropsWithChildren, useReducer } from 'react';
import z from 'zod';

import { ZAHARA_DATE_FORMAT } from '@/utils/dates';

import { Action, selectBankStepSchema, SystematicPremiumsState } from './types';
import { SystematicPremiumsContext } from './useSystematicPremiums';

// TODO: fix this type
interface SystematicPremiumsProviderProps extends PropsWithChildren {
  currentSystematicPremium?: SystematicProgram;
  currentBillingFeature?: PolicyFeature;
}

function SystematicPremiumsReducer(
  state: SystematicPremiumsState,
  action: Action
): SystematicPremiumsState {
  return {
    ...state,
    ...action.payload,
  };
}

const SystematicPremiumsProvider = ({
  currentSystematicPremium,
  currentBillingFeature,
  children,
}: SystematicPremiumsProviderProps) => {
  const [state, dispatch] = useReducer<
    React.Reducer<SystematicPremiumsState, Action>
  >(SystematicPremiumsReducer, {
    activeArrangementId: currentSystematicPremium?.arrangementId,
    currentSystematicPremium: currentSystematicPremium,
    systematicPremiumAmountStep: {
      nextPaymentDate:
        currentSystematicPremium?.nextProgramDate ||
        dayjs().format(ZAHARA_DATE_FORMAT),
      // TODO: what should the default for this be???
      paymentAmount: currentBillingFeature?.paymentAmount,
      // TODO: eventually remove the bpm enum to zod enum mapping?
      paymentFrequency: currentBillingFeature?.frequency,
    },
    // TODO: I don't like this, what should the default here be?
    selectBankStep: {} as z.infer<typeof selectBankStepSchema>,
  });

  const value = { state, dispatch };

  return (
    <SystematicPremiumsContext.Provider value={value}>
      {children}
    </SystematicPremiumsContext.Provider>
  );
};

export { SystematicPremiumsProvider };
