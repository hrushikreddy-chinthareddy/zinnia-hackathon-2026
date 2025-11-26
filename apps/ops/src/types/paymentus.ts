// -- Paymentus types --

export enum PaymentusAccountType {
    VISA = 'VISA',
    MC = 'MC',
    AMEX = 'AMEX',
    CHQ = 'CHQ',
    SAV = 'SAV',
    VISA_DEBIT = 'VISA_DEBIT',
    MC_DEBIT = 'MC_DEBIT',
    DISC = 'DISC',
    DISC_DEBIT = 'DISC_DEBIT',
    PD = 'PD',
    WALKIN_CASH = 'WALKIN_CASH',
    IONLINE = 'IONLINE',
    IPPPAYS_KIOSK_CASH = 'IPPPAYS_KIOSK_CASH',
    AP = 'AP',
    GP = 'GP',
    PAYPAL_ACCOUNT = 'PAYPAL_ACCOUNT',
    PAYPAL_CREDIT = 'PAYPAL_CREDIT',
    VENMO = 'VENMO',
    AMAZON_PAY = 'AMAZON_PAY',
    WALMART_PAY = 'WALMART_PAY',
}

export interface PaymentusProfile {
    token: string;
    type: PaymentusAccountType;
    'account-number': string;
    'bank-name'?: string;
    'routing-number'?: string;
    'card-holder-name': string;
    default?: boolean;
    'external-id'?: string;
    'credit-card-expiry-date'?: {
        month: string;
        year: string;
    };
    zip?: string;
}

export interface PaymentusListProfiles {
    profile: PaymentusProfile[];
}
