import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import PolicyExtrasCard from '@deps/components/policy-extras-card/policy-extras-card';
import { Policy } from '@deps/models/policy/sor-policy';

import { mapPolicyFeaturesToExtrasCards, mapPolicyRidersToExtrasCards } from './policy-extras-cards-helper';

type PolicyExtrasCardsProps = {
    policy: Policy;
    filterValues: { key: 'type' | 'status'; value: string } | null;
};

export enum ExtrasCardType {
    Feature = 'Feature',
    Rider = 'Rider',
}

export default function PolicyExtrasCards({ policy, filterValues }: PolicyExtrasCardsProps) {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'policy.extras',
    });

    const [featuresCards, setFeaturesCards] = useState(mapPolicyFeaturesToExtrasCards(policy.policyFeatures || [], t, policy.currency));
    const [ridersCards, setRidersCards] = useState(mapPolicyRidersToExtrasCards(policy, t));

    useEffect(() => {
        setFeaturesCards(mapPolicyFeaturesToExtrasCards(policy.policyFeatures, t, policy.currency));
        setRidersCards(mapPolicyRidersToExtrasCards(policy, t));
    }, [policy]);

    const filteredCards = [...(featuresCards ?? []), ...ridersCards]
        .filter(card => (filterValues ? card[filterValues.key] === filterValues?.value : true))
        .sort((a, b) => (a.cardProps.headerText.toUpperCase() < b.cardProps.headerText.toUpperCase() ? -1 : 1));

    return (
        <>
            {filteredCards.map(({ cardProps, cardKey }) => (
                <PolicyExtrasCard key={cardKey} {...cardProps} />
            ))}
        </>
    );
}
