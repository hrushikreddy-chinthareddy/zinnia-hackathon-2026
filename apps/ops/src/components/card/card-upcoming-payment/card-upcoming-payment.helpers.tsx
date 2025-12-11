import { I18n, i18n } from 'next-i18next';

import { FlatExtra } from '@zinnia/api-types/types/sor';

export interface AddChargesProps {
    flatExtra?: FlatExtra[];
    keyPrefix: string;
    t: I18n['t'];
}

export const getAddCharges = ({ flatExtra, keyPrefix }: AddChargesProps) => {
    const { t } = i18n as I18n;

    const addCharges = [];

    if (flatExtra && flatExtra[0] && (flatExtra[0].flatExtraAmount || 0) > 0) {
        const [fe] = flatExtra;
        addCharges?.push({
            amount: fe.flatExtraAmount,
            label: t(`${keyPrefix}.additionalCharges.text`),
            tooltip: t(`${keyPrefix}.additionalCharges.tooltip`),
        });
        return addCharges;
    }

    return [
        {
            amount: 0,
            label: t(`${keyPrefix}.noAdditionalCharges`),
            tooltip: t(`${keyPrefix}.noAdditionalCharges`),
        },
    ];
};
