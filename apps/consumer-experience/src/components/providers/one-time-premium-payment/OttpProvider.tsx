import React, { PropsWithChildren, useReducer } from 'react';

import { OttpContext } from './OttpContext';
import { Action, OttpAction, OttpState } from './types';

interface OttpProviderProps extends PropsWithChildren {}

// TODO: fix keys to be more consistent

function ottpReducer(state: OttpState, action: Action): OttpState {
  switch (action.type) {
    case OttpAction.SET_EFFECTIVE_DATE:
      return { ...state, effectiveDate: action.payload };
    case OttpAction.SET_PAYMENT_AMOUNT:
      return { ...state, paymentAmount: action.payload };
    case OttpAction.SET_PAYOR:
      return { ...state, payor: action.payload };
    default:
      return state;
  }
}

const OttpProvider: React.FC<OttpProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(ottpReducer, {
    effectiveDate: '',
    paymentAmount: 0,
    payor: {},
  });

  const value = { state, dispatch };

  return <OttpContext.Provider value={value}>{children}</OttpContext.Provider>;
};

export { OttpProvider };
