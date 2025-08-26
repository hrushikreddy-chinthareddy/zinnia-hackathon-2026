'use client';
import { useSearchParams } from 'next/navigation';
import { PropsWithChildren, useReducer } from 'react';

import { getSystematicProgramAmounts } from '@/components/workflows/systematic-premiums/utils';
import { useSystematicProgramsFor } from '@/hooks/use-systematic-programs';

import {
  Action,
  SystematicPremiumsState,
  SystematicPremiumSteps,
} from './types';
import { SystematicPremiumsContext } from './useSystematicPremiums';

interface SystematicPremiumsProviderProps extends PropsWithChildren { }

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
  children,
}: SystematicPremiumsProviderProps) => {
  const search = useSearchParams();
  const arrangementId = search.get('arrangementId');

  const { data: systematicPremium } = useSystematicProgramsFor(arrangementId)

  const {
    paymentFrequency,
    monthlyAmount,
    totalAmount,
    effectiveDate,
    bankId,
    partyId,
  } = getSystematicProgramAmounts({
    monthlyAmount: systematicPremium?.amount,
    bpmFrequency: systematicPremium?.frequency,
    effectiveDate: systematicPremium?.nextProgramDate,
    parties: systematicPremium?.party ?? systematicPremium?.parties,
  });

  const previousProgramDate = arrangementId
    ? systematicPremium?.previousProgramDate
    : undefined;
  const nextProgramDate = arrangementId
    ? systematicPremium?.nextProgramDate
    : undefined;

  const [state, dispatch] = useReducer<
    React.Reducer<SystematicPremiumsState, Action>
  >(SystematicPremiumsReducer, {
    activeArrangementId: systematicPremium?.arrangementId,
    currentPage: SystematicPremiumSteps.AMOUNT,
    yearlyPremiumAmount: totalAmount,
    previousProgramDate,
    nextProgramDate,
    systematicPremiumAmountStep: {
      effectiveDate: effectiveDate,
      // TODO: GET PAYMENT AMOUNT
      paymentAmount: monthlyAmount,
      // AND PAYMENT FREQUENCY
      paymentFrequency,
      // FROM API
    },
    selectBankStep: {
      payor: {
        payorPartyId: partyId ?? '',
        payorName: '',
      },
      bank: {
        bankId,
      },
    },
  });

  const value = { state, dispatch };

  return (
    <SystematicPremiumsContext.Provider value={value}>
      {children}
    </SystematicPremiumsContext.Provider>
  );
};

export { SystematicPremiumsProvider };
