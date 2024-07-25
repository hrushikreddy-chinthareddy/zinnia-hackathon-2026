export enum OttpAction {
  SET_EFFECTIVE_DATE = 'setEffectiveDate',
  SET_PAYMENT_AMOUNT = 'setPaymentAmount',
  SET_PAYOR = 'setPayor',
}

export type Action = { type: OttpAction; payload: any };
export type Dispatch = (action: Action) => void;
export interface OttpState {
  effectiveDate?: string;
  paymentAmount?: number;
  // TODO: update to include payor type
  payor: any;
}
