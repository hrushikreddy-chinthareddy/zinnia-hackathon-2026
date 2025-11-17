'use client';
import { DisbursementPaymentForm } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
import { PropsWithChildren, useReducer } from 'react';

import { DEFAULT_DATE_FORMAT } from '@/utils/dates';

import { Action, FreeLookCancelAction, FreeLookCancelState } from './types';
import { FreeLookCancelContext } from './useFreeLookCancel';

const freeLookCancelInitialState: FreeLookCancelState = {
  dateStep: {
    // TODO: set this from provider rather than on the page so we don't
    // have to set it on the select date page
    netSurrenderValue: 0,
    cancellationDate: dayjs().format(DEFAULT_DATE_FORMAT),
  },
  payeeStep: undefined,
  distributionMethodStep: {
    type: DisbursementPaymentForm.ACH,
    method: undefined,
  },
};

const freeLookCancelReducer = (state: FreeLookCancelState, action: Action) => {
  switch (action.type) {
    case FreeLookCancelAction.SET_FREE_LOOK_CANCEL_DATE_STEP:
      return {
        ...state,
        dateStep: action.payload,
      };
    case FreeLookCancelAction.SET_FREE_LOOK_CANCEL_PAYEE_STEP:
      return {
        ...state,
        payeeStep: action.payload,
      };
    case FreeLookCancelAction.SET_FREE_LOOK_CANCEL_DISTRIBUTION_METHOD_STEP:
      return {
        ...state,
        distributionMethodStep: action.payload,
      };
    default:
      return state;
  }
};

export const FreeLookCancelProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer<
    React.Reducer<FreeLookCancelState, Action>
  >(freeLookCancelReducer, freeLookCancelInitialState);

  return (
    <FreeLookCancelContext.Provider value={{ state, dispatch }}>
      {children}
    </FreeLookCancelContext.Provider>
  );
};
