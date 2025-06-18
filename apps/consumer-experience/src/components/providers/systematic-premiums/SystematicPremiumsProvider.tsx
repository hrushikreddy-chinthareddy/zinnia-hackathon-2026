'use client';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { PropsWithChildren, useReducer } from 'react';

import { SystematicPremiumSteps } from '@/components/workflows/systematic-premiums/steps';
import {
  getSystematicProgramAmounts,
} from '@/components/workflows/systematic-premiums/utils';
import { usePolicyUrlInputs } from '@/hooks/use-policy-url-inputs';
import { getAllSystematicPrograms } from '@/queries/policy-queries';
import { QueryKeys } from '@/queries/query-keys';

import { Action, SystematicPremiumsState } from './types';
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
  const { planCode, policyNumber } = usePolicyUrlInputs();
  const search = useSearchParams();
  const arrangementId = search.get('arrangementId');

  const { data: systematicPremium } = useQuery({
    queryKey: [QueryKeys.SYSTEMATIC_PREMIUMS, planCode, policyNumber, arrangementId],
    queryFn: () => getAllSystematicPrograms({ planCode, policyNumber }),
    select: data => data.find(sp => sp.arrangementId === arrangementId),
    enabled:
      !!planCode?.length && !!policyNumber?.length && search.has('arrangementId')
  });

  const {
    paymentFrequency,
    monthlyAmount,
    totalAmount,
    effectiveDate,
    bankId,
    partyId
  } = getSystematicProgramAmounts({
    monthlyAmount: systematicPremium?.amount,
    bpmFrequency: systematicPremium?.frequency,
    effectiveDate: systematicPremium?.nextProgramDate,
    parties: systematicPremium?.party ?? systematicPremium?.parties
  })

  const [state, dispatch] = useReducer<
    React.Reducer<SystematicPremiumsState, Action>
  >(SystematicPremiumsReducer, {
    activeArrangementId: systematicPremium?.arrangementId,
    currentPage: SystematicPremiumSteps.AMOUNT,
    yearlyPremiumAmount: totalAmount,
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
        payorName: ''
      },
      bank: {
        bankId
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
