import { SignPresent } from './renewal/signature-validation';

export const convertIsSignedFromValue = (value: boolean | null | undefined): SignPresent => {
    if (value === true) {
        return SignPresent.Yes;
    }
    if (value === false) {
        return SignPresent.No;
    }
    return SignPresent.Unselected;
};
