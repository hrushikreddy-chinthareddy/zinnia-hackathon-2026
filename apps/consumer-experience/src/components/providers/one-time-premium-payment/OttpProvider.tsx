'use client';
import React, { PropsWithChildren, useReducer } from 'react';

import { BankDetail } from '@/components/person-data/types';

import { OttpContext } from './OttpContext';
import { Action, OttpAction, OttpState } from './types';

interface OttpProviderProps extends PropsWithChildren {}

function ottpReducer(state: OttpState, action: Action): OttpState {
  switch (action.type) {
    case OttpAction.SET_EFFECTIVE_DATE:
      return { ...state, effectiveDate: action.payload };
    case OttpAction.SET_PAYMENT_AMOUNT:
      const paymentWithFees =
        state.paymentFee && action.payload
          ? action.payload * (1 - state.paymentFee / 100)
          : action.payload;
      return {
        ...state,
        paymentAmount: { plain: action.payload, withFees: paymentWithFees },
      };
    case OttpAction.SET_PAYOR_BANK:
      return { ...state, payorBank: action.payload };
    case OttpAction.SET_PAYMENT_FEE:
      return { ...state, paymentFee: action.payload };

    default:
      return state;
  }
}

const OttpProvider: React.FC<OttpProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(ottpReducer, {
    effectiveDate: '',
    paymentAmount: {
      plain: 0,
      withFees: 0,
    },
    payorBank: {} as BankDetail,
    paymentFee: 0,
  });

  const value = { state, dispatch };

  return <OttpContext.Provider value={value}>{children}</OttpContext.Provider>;
};

export { OttpProvider };
