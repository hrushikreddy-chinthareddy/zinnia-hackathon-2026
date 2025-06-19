import { PaymentusAccountType } from '@/types/paymentus';

export const mockListProfiles = {
  'list-profiles-response': {
    profile: [
      {
        token: 'CA3512F4DFA95A03169C5A670A4C91A19B3077B4',
        type: PaymentusAccountType.CHQ,
        'account-number': '*****0022-*******2365',
        'bank-name': 'BANK OF AMERICA N.A.',
        'card-holder-name': 'John Doe',
        default: false,
      },
      {
        token: 'B13621B1FE2F468FD0DD77926615DD5B1D9410B7',
        type: PaymentusAccountType.SAV,
        'account-number': '*****6666',
        'routing-number': '071000013',
        'bank-name': 'JPMORGAN CHASE',
        'card-holder-name': 'SUZANA DEBLOCK',
        'external-id': '67786674-1629565911739-Renter',
      },
      {
        token: 'AF3E133428B9E25C55BC59FE534248E6A0C0F17B',
        type: PaymentusAccountType.VISA,
        'account-number': '************4448',
        'credit-card-expiry-date': {
          month: '5',
          year: '2027',
        },
        'card-holder-name': 'John Doe',
        zip: '12345',
        default: true,
      },
      {
        token: '761F22B2C1593D0BB87E0B606F990BA4974706DE',
        type: PaymentusAccountType.MC,
        'account-number': '*********SWCC',
        'card-holder-name': 'John Doe',
      },
      {
        token: 'A6EFE488C09B099F659563C42B61F1053760AF5D ',
        type: PaymentusAccountType.AMEX,
        'account-number': '***************6698',
        'card-holder-name': 'John Doe',
      },
    ],
  },
};
