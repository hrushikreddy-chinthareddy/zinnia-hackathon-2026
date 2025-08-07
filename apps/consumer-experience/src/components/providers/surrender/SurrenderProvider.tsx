'use client';

import {
  DisbursementPaymentForm,
  TaxRateToUse,
} from '@xd/api-types/dist/generated-types/bpm';
import dayjs from 'dayjs';
import { PropsWithChildren, useReducer } from 'react';

import { ZAHARA_DATE_FORMAT } from '@/utils/dates';

import { SurrenderState, SurrenderSteps, Action } from './types';
import { SurrenderContext } from './useSurrender';

interface SurrenderProviderProps extends PropsWithChildren {}

function SurrenderReducer(
  state: SurrenderState,
  action: Action
): SurrenderState {
  return {
    ...state,
    ...action.payload,
  };
}

const SurrenderProvider = ({ children }: SurrenderProviderProps) => {
  const [state, dispatch] = useReducer<React.Reducer<SurrenderState, Action>>(
    SurrenderReducer,
    {
      currentPage: SurrenderSteps.INFO,
      dateStep: {
        surrenderDate: dayjs().format(ZAHARA_DATE_FORMAT),
        netSurrenderValue: 1,
      },
      taxWithholdingsStep: {
        federal: {
          amountType: 'minimum',
          taxRateToUse: TaxRateToUse.USEDEFAULTTABLE,
          dollar: '',
          percentage: '',
        },
        state: {
          amountType: 'minimum',
          taxRateToUse: TaxRateToUse.USEDEFAULTTABLE,
          dollar: '',
          percentage: '',
        },
      },
      payeeStep: {
        payeePartyId: '',
        payeeName: '',
      },
      distributionMethodStep: {
        distributionType: DisbursementPaymentForm.ACH,
        bank: {
          bankId: '',
          branchName: '',
          accountType: '',
          accountNumber: '',
          autopayEnabled: false,
          appliesToPartyId: '',
        },
      },
    }
  );

  const value = { state, dispatch };

  return (
    <SurrenderContext.Provider value={value}>
      <div>{children}</div>
    </SurrenderContext.Provider>
  );
};

export { SurrenderProvider };
