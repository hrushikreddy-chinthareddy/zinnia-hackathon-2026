export enum PaymentProvider {
  ZINNIA = 'ZINNIA',
  PAYMENTUS = 'PAYMENTUS',
}

export enum ManageChange {
  EXTERNAL = 'EXTERNAL',
  INTERNAL = 'INTERNAL',
}

type CommunicationPreferenceBase = {
  manageChanges: ManageChange;
};

type PolicyProfileUpdateInternal = CommunicationPreferenceBase & {
  url: string;
};

type PolicyProfileUpdateExternal = CommunicationPreferenceBase & {
  url?: never;
};

type PolicyProfileUpdate<T extends ManageChange> =
  T extends ManageChange.INTERNAL
    ? PolicyProfileUpdateExternal
    : PolicyProfileUpdateInternal;

type PolicyProfile<T extends ManageChange> = {
  communicationPreference?: PolicyProfileUpdate<T>;
  email?: PolicyProfileUpdate<T>;
  phoneNumber?: PolicyProfileUpdate<T>;
};

export interface PaymentConfig {
  provider: PaymentProvider;
  verifyIdentityRequired: boolean;
}

export interface CarrierConfig {
  payment: PaymentConfig;
  policyProfile: PolicyProfile<ManageChange>;
}
