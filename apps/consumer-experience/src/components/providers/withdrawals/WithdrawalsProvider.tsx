'use client';
import {
  AllocationOption,
  AmountType,
  DisbursementPaymentForm,
  DisbursementType,
  FilingStatus,
  PartyRole,
  TaxRateToUse,
} from '@xd/api-types/dist/generated-types/bpm';
import { DEFAULT_DATE_FORMAT } from '@xd/utils/dist';
import dayjs from 'dayjs';
import { PropsWithChildren, useReducer } from 'react';

import { WithdrawalSteps } from '@/components/workflows/withdrawals/steps';

import {
  Action,
  taxWithholdingAmountTypeEnum,
  WithdrawalsAction,
  WithdrawalsState,
} from './types';
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
        amountType: AmountType.MAX,
        withdrawalType: DisbursementType.GROSS,
      },
      withdrawalMethodStep: {
        withdrawalMethod: AllocationOption.PRORATA,
      },
      distributionMethodStep: {
        distributionType: DisbursementPaymentForm.ACH,
      },
      taxWithholdingsStep: {
        federal: {
          amountType: taxWithholdingAmountTypeEnum.Enum.minimum,
          taxRateToUse: TaxRateToUse.USEDEFAULTTABLE,
          dollar: '0',
          percentage: '0',
          exemptions: '0',
          filingStatus: FilingStatus.DEFAULT,
          taxJurisdiction: 'USA',
        },
        state: {
          amountType: taxWithholdingAmountTypeEnum.Enum.minimum,
          taxRateToUse: TaxRateToUse.USEDEFAULTTABLE,
          dollar: '0',
          percentage: '0',
          exemptions: '0',
          filingStatus: FilingStatus.DEFAULT,
          taxJurisdiction: 'USA',
        },
      },
      payeeStep: {
        payeePartyId: '',
        payeeName: '',
        partyRole: PartyRole.PAYEE,
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
