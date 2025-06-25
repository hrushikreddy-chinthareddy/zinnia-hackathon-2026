import { CarrierName } from '@zinnia/bloom/components';

export enum Theme {
    Farmers = 'farmers',
    Zinnia = 'zinnia',
}

export const CONNECTION_TO_THEME: Record<string, Theme> = {
    'Zinnia-AD': Theme.Zinnia,
    'FNWL-Okta': Theme.Farmers,
};

export function getRole(userConnection?: string): CarrierName {
    switch (userConnection) {
        case 'FNWL-Okta':
            return CarrierName.FARMERS;
        default:
            return CarrierName.ZINNIA;
    }
}
