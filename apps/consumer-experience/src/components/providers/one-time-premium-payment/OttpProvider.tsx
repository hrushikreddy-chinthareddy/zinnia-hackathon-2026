import React, {
  PropsWithChildren,
  useContext,
  createContext,
  useReducer,
} from 'react';

export enum OttpAction {
  SET_POLICY_NUMBER = 'setPolicyNumber',
  SET_PLAN_CODE = 'setPlanCode',
  SET_EFFECTIVE_DATE = 'setEffectiveDate',
  SET_PAYMENT_AMOUNT = 'setPaymentAmount',
  SET_PAYOR = 'setPayor',
}

type Action = { type: OttpAction; payload: any };
type Dispatch = (action: Action) => void;
interface OttpState {
  policyNumber?: string;
  planCode?: string;
  effectiveDate?: string;
  paymentAmount?: number;
  // TODO: update to include payor type
  payor: any;
}

interface OttpProviderProps extends PropsWithChildren {}

const OttpContext = createContext<
  { state: OttpState; dispatch: Dispatch } | undefined
>(undefined);
// TODO: fix keys to be more consistent

function ottpReducer(state: OttpState, action: any): OttpState {
  switch (action.type) {
    // TODO: these should be in their own provider probably
    // case OttpAction.SET_POLICY_NUMBER:
    //   return { ...state, policyNumber: action.payload };
    // case OttpAction.SET_PLAN_CODE:
    //   return { ...state, planCode: action.payload };
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
    // policyNumber: undefined,
    // planCode: '',
    effectiveDate: '',
    paymentAmount: 0,
    payor: {},
  });

  const value = { state, dispatch };

  return <OttpContext.Provider value={value}>{children}</OttpContext.Provider>;
};

// TODO: I guess move this somewhere else because of fast refresh and also decide if need/want this
function useOttp() {
  const context = useContext(OttpContext);
  if (context === undefined) {
    throw new Error('useOttp must be used within an OttpProvider');
  }
  return context;
}

export { OttpProvider, useOttp };
