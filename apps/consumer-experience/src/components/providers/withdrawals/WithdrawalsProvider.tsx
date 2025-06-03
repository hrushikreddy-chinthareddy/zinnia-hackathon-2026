'use client';
import { PaymentForm } from '@xd/api-types/dist/generated-types/bpm';
import { DEFAULT_DATE_FORMAT } from '@xd/utils/dist';
import dayjs from 'dayjs';
import { PropsWithChildren, useReducer } from 'react';

import { WithdrawalSteps } from '@/components/workflows/withdrawals/types';

import { Action, WithdrawalsAction, WithdrawalsState } from './types';
import { WithdrawalsContext } from './useWithdrawals';

interface WithdrawalsProviderProps extends PropsWithChildren {}

function WithdrawalsReducer(
  state: WithdrawalsState,
  action: Action
): WithdrawalsState {
  switch (action.type) {
    case WithdrawalsAction.SET_WITHDRAWAL_AMOUNT_STEP:
      return {
        ...state,
        withdrawalAmountStep: {
          ...action.payload,
        },
      };
    case WithdrawalsAction.SET_WITHDRAWAL_METHOD_STEP: {
      return {
        ...state,
        withdrawalMethodStep: {
          ...action.payload,
        },
      };
    }
    case WithdrawalsAction.SET_WITHDRAWAL_TAX_WITHHOLDING_STEP: {
      return {
        ...state,
        taxWithholdingsStep: {
          ...action.payload,
        },
      };
    }
    case WithdrawalsAction.SET_WITHDRAWAL_PAYEE_STEP: {
      return {
        ...state,
        payeeStep: {
          ...action.payload,
        },
      };
    }
    case WithdrawalsAction.SET_WITHDRAWAL_DISTRIBUTION_METHOD_STEP: {
      return {
        ...state,
        distributionMethodStep: {
          ...action.payload,
        },
      };
    }
    default:
      return state;
  }
}

const WithdrawalsProvider = ({ children }: WithdrawalsProviderProps) => {
  const [state, dispatch] = useReducer<React.Reducer<WithdrawalsState, Action>>(
    WithdrawalsReducer,
    {
      currentPage: WithdrawalSteps.INTRO,
      withdrawalAmountStep: {
        effectiveDate: dayjs().format(DEFAULT_DATE_FORMAT),
        paymentAmount: 0,
        radioOption: 'maximum',
        withdrawalType: 'GROSS',
      },
      withdrawalMethodStep: {
        withdrawalMethod: 'prorata',
      },
      distributionMethodStep: {
        distributionType: PaymentForm.ACH,
      },
      taxWithholdingsStep: {
        federal: {
          type: 'minimum',
          amount: '0',
        },
        state: {
          type: 'minimum',
          amount: '0',
        },
      },
      payeeStep: {
        payeePartyId: '',
        payeeName: '',
      },
    }
  );

  const value = { state, dispatch };

  return (
    <WithdrawalsContext.Provider value={value}>
      {children}
    </WithdrawalsContext.Provider>
  );
};

export { WithdrawalsProvider };
