import { CarrierName } from '@zinnia/bloom/components';

/** To add a new carrier's theme from Bloom, do the following:
 * in _app.tsx, import the new carrier's theme css file from bloom
 * in this file, add the theme name to the Theme enum (so far these are 1:1 with carrier names)
 * add the carrierName to the getCarrierNameFromTheme function (used for icons and logos)
 * in this file, add any Connection Names to the Connection enum (used to derive theme from how the user logged in)
 * */

// Right now, Themes are tied to CarrierNames, but this may not always be the case.
export enum Theme {
    FARMERS = CarrierName.FARMERS,
    SECURITY_BENEFIT = CarrierName.SECURITY_BENEFIT,
    ZINNIA = CarrierName.ZINNIA,
}

// We derive the theme from how the user logged in, which is based on the connection name
enum Connection {
    ZINNIA_AD = 'Zinnia-AD',
    FNWL_OKTA = 'FNWL-Okta',
    SECURITY_BENEFIT_OKTA = 'Security-Benefit-Okta',
}

// This function is used to derive the role from the connection name.  For now, carrierName === role, but this may not always be granular enough.
export function getRole(userConnection?: string): string {
    switch (userConnection) {
        case Connection.FNWL_OKTA:
            return CarrierName.FARMERS;
        case Connection.SECURITY_BENEFIT_OKTA:
            return CarrierName.SECURITY_BENEFIT;
        default:
            return CarrierName.ZINNIA;
    }
}

// Returns the theme based on the role derived from connection name
export function getThemeFromRole(role?: string): Theme {
    switch (role) {
        case CarrierName.FARMERS:
            return Theme.FARMERS;
        case CarrierName.SECURITY_BENEFIT:
            return Theme.SECURITY_BENEFIT;
        default:
            return Theme.ZINNIA;
    }
}

// Used predominantly for icons and logos based off the theme
export function getCarrierNameFromTheme(theme?: string): CarrierName {
    switch (theme) {
        case Theme.FARMERS:
            return CarrierName.FARMERS;
        case Theme.SECURITY_BENEFIT:
            return CarrierName.SECURITY_BENEFIT;
        default:
            return CarrierName.ZINNIA;
    }
}
