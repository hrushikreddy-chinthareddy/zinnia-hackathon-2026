import { TFunction } from 'next-i18next';

import { FlatExtra } from '@deps/models/policy/sor-policy';

export interface AddChargesProps {
    flatExtra?: FlatExtra[];
    t: TFunction;
}

export const getAddCharges = ({ flatExtra, t }: AddChargesProps) => {
    const addCharges = [];

    if (flatExtra && flatExtra[0] && (flatExtra[0].flatExtraAmount || 0) > 0) {
        const [fe] = flatExtra;
        addCharges?.push({
            amount: fe.flatExtraAmount,
            label: t('additonalCharges.label'),
            tooltip: t('additionalCharges.tooltip'),
        });
        return addCharges;
    }

    return [
        {
            amount: 0,
            label: t('noAdditionalCharges'),
            tooltip: t('noAdditionalCharges'),
        },
    ];
};
