import { SignatureWithdrawal } from '@deps/models/case/withdrawal/case';

export type SignatureState = {
    isIrrevocableBene: boolean;
    isSpousePresent: boolean | null;
    signatures: SignatureWithdrawal[];
};
