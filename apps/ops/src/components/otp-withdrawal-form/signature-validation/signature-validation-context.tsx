import { createContext } from 'react';

import {
    DesignationPresent,
    SignatureValidationTypeWithdrawal,
} from '@deps/models/case/renewal/signature-validation';
import {
    FormValidationErrors,
    SignatureWithdrawal,
} from '@deps/models/case/withdrawal/case';

export interface SignatureState extends SignatureWithdrawal {
    errors: FormValidationErrors;
    setIsSignatureValid: React.Dispatch<
        React.SetStateAction<boolean | null | undefined>
    >;
    setIsSigned: React.Dispatch<React.SetStateAction<boolean | null>>;
    setSignatureComment: React.Dispatch<
        React.SetStateAction<string | undefined>
    >;
    setSignDate: React.Dispatch<React.SetStateAction<{ text: string | null }>>;
    setSignName: React.Dispatch<React.SetStateAction<string | null>>;
    setCommissionExpiryDate: React.Dispatch<
        React.SetStateAction<{ text: string | null } | undefined>
    >;
    setSignTitle: React.Dispatch<React.SetStateAction<{ text: string | null }>>;
    setSignType: React.Dispatch<
        React.SetStateAction<{ text: SignatureValidationTypeWithdrawal | null }>
    >;
    setIsNotaryValid: React.Dispatch<
        React.SetStateAction<boolean | null | undefined>
    >;
    setSignGuaranteeStamp: React.Dispatch<
        React.SetStateAction<{ text: string | null } | undefined>
    >;
    setSsn: React.Dispatch<
        React.SetStateAction<{ text: string | null } | undefined>
    >;
    setIsSignatureCityProvided: React.Dispatch<
        React.SetStateAction<{ text: boolean | null } | undefined>
    >;
    isDesignationPresent: DesignationPresent | boolean | null;
    setIsDesignationPresent: React.Dispatch<React.SetStateAction<any>>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (() => {}) as React.Dispatch<React.SetStateAction<any>>;

export const defaultSignatureState = {
    errors: {},
    isSignatureValid: null,
    isSigned: null,
    isNotaryValid: null,
    isDesignationPresent: null,
    setIsDesignationPresent: noop,
    setIsSignatureValid: noop,
    setIsSigned: noop,
    setIsNotaryValid: noop,
    setSignatureComment: noop,
    setSignDate: noop,
    setSignName: noop,
    setSignTitle: noop,
    setSignType: noop,
    setCommissionExpiryDate: noop,
    setSignGuaranteeStamp: noop,
    setSsn: noop,
    setIsSignatureCityProvided: noop,
    signatureComment: '',
    ssn: { text: '' },
    signDate: { text: '' },
    signTitle: { text: '' },
    signType: { text: null },
    commissionExpiryDate: { text: '' },
    isSignatureCityProvided: { text: null },
};

export const SignatureValidationContext = createContext<SignatureState>(
    defaultSignatureState as SignatureState
);
