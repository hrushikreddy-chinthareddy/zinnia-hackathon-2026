'use client';
import dayjs from 'dayjs';
import { PropsWithChildren, useReducer } from 'react';
import z from 'zod';

import { ZAHARA_DATE_FORMAT } from '@/utils/dates';
import { PolicyFeature, SystematicProgram } from '@zinnia/api-types/types/sor';

import { Action, selectBankStepSchema, SystematicPremiumsState } from './types';
import { SystematicPremiumsContext } from './useSystematicPremiums';

// TODO: fix this type
interface SystematicPremiumsProviderProps extends PropsWithChildren {
  currentSystematicPremium?: SystematicProgram;
  currentBillingFeature?: PolicyFeature;
  isTerm?: boolean;
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
  isTerm,
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
      paymentAmount: isTerm
        ? currentBillingFeature?.paymentAmount || 0
        : currentSystematicPremium?.amount || 0, //If Term, this is current billing feature. If non-term, this should be currentSystematicPremium
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
