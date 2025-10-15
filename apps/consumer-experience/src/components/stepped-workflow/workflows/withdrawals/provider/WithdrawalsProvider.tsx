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

import {
  Action,
  taxWithholdingAmountTypeEnum,
  WithdrawalsState,
  WithdrawalSteps,
} from './types';
import { WithdrawalsContext } from './useWithdrawals';

interface WithdrawalsProviderProps extends PropsWithChildren {}

function WithdrawalsReducer(
  state: WithdrawalsState,
  action: Action
): WithdrawalsState {
  return {
    ...state,
    ...action.payload,
  };
}

const WithdrawalsProvider = ({ children }: WithdrawalsProviderProps) => {
  const [state, dispatch] = useReducer<React.Reducer<WithdrawalsState, Action>>(
    WithdrawalsReducer,
    {
      // TODO: remove this and action to set it, it never gets used
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
        // TODO: Update this to be CHECK
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
