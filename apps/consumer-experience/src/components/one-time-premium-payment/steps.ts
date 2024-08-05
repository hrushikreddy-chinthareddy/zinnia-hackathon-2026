export const oneTimePremiumSteps = {
  amount: {
    title: 'Make a one-time payment',
    url: '/policies/:planCode/:policyNumber/premium-payment/select-amount',
  },
  bank: {
    title: 'select payment method',
    url: '/policies/:planCode/:policyNumber/premium-payment/select-bank',
  },
  summary: {
    title: 'summary',
    url: '/policies/:planCode/:policyNumber/premium-payment/summary',
  },
  submitted: {
    step: 'submitted',
    title: 'submitted',
    url: '/policies/:planCode/:policyNumber/premium-payment/submitted',
  },
};
