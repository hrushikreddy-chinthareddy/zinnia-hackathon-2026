export enum OttpAction {
  SET_EFFECTIVE_DATE = 'setEffectiveDate',
  SET_PAYMENT_AMOUNT = 'setPaymentAmount',
  SET_PAYOR_BANK = 'setPayorBank',
}

export type Action = { type: OttpAction; payload: any };
export type Dispatch = (action: Action) => void;
export interface OttpState {
  effectiveDate?: string;
  paymentAmount?: number;
  // TODO: update to include payor type
  payorBank: any;
}
