export enum WithdrawalSteps {
  INTRO = 'introduction',
  AMOUNT = 'amount',
  METHOD = 'method',
  WITHHOLDINGS = 'withholdings',
  PAYEE = 'payee',
  DISTRIBUTION = 'distribution',
  SUMMARY = 'summary',
  SUBMITTED = 'submitted',
  MFA = 'multi-factor-auth',
}

export const withdrawalUrls = {
  [WithdrawalSteps.INTRO]: 'information',
  [WithdrawalSteps.AMOUNT]: 'amount',
  [WithdrawalSteps.METHOD]: 'funds',
  [WithdrawalSteps.WITHHOLDINGS]: 'tax',
  [WithdrawalSteps.PAYEE]: 'payee',
  [WithdrawalSteps.DISTRIBUTION]: 'bank',
  [WithdrawalSteps.SUMMARY]: 'summary',
  [WithdrawalSteps.MFA]: 'verify-identity',
  [WithdrawalSteps.SUBMITTED]: 'submitted',
}