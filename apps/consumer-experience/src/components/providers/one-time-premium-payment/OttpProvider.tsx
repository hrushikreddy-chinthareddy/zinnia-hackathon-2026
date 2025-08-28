'use client';
import React, { PropsWithChildren, useReducer } from 'react';

import { PaymentMethod } from '@/types/payment';

import { OttpContext } from './OttpContext';
import { Action, OttpAction, OttpState } from './types';

interface OttpProviderProps extends PropsWithChildren {}

const initialState = {
  effectiveDate: '',
  paymentAmount: {
    plain: 0,
    withFees: 0,
  },
  payorBank: {} as PaymentMethod,
  paymentFee: 0,
};

const calculatePaymentWithFees = (paymentAmount: number, fees?: number) => {
  return fees && paymentAmount
    ? paymentAmount * (1 - fees / 100)
    : paymentAmount;
};

function ottpReducer(state: OttpState, action: Action): OttpState {
  switch (action.type) {
    case OttpAction.SET_EFFECTIVE_DATE:
      return { ...state, effectiveDate: action.payload };
    case OttpAction.SET_PAYMENT_AMOUNT:
      return {
        ...state,
        paymentAmount: {
          plain: action.payload,
          withFees: calculatePaymentWithFees(action.payload, state.paymentFee),
        },
      };
    case OttpAction.SET_PAYOR_BANK:
      return { ...state, payorBank: action.payload };
    case OttpAction.SET_PAYMENT_FEE:
      return { ...state, paymentFee: action.payload };
    case OttpAction.RESET:
      return initialState;

    default:
      return state;
  }
}

const OttpProvider: React.FC<OttpProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(ottpReducer, initialState);

  const value = { state, dispatch };

  return <OttpContext.Provider value={value}>{children}</OttpContext.Provider>;
};

export { OttpProvider };
