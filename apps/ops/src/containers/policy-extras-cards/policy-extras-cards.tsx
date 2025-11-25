import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import PolicyExtrasCard from '@deps/components/policy-extras-card/policy-extras-card';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { useIsMounted } from '@deps/hooks/useIsMounted';
import { Rider } from '@zinnia/api-types/types/sor';

import {
    mapPolicyFeaturesToExtrasCards,
    mapPolicyRidersToExtrasCards,
} from './policy-extras-cards-helpers';
import EmptyCard from '../people-data-cards/empty-card/empty-card';
import { ExtraFilters } from '../riders-and-features-sub-page/riders-and-features-sub-page.helpers';

export enum ExtrasCardType {
    Feature = 'Feature',
    Rider = 'Rider',
}
type PolicyExtrasCardsProps = {
    policyDetails?: PolicyDetails;
    selectedTab: string;
    filterValues: { key: ExtrasCardType; value: string };
};

export default function PolicyExtrasCards({
    policyDetails,
    selectedTab,
    filterValues,
}: PolicyExtrasCardsProps) {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'policy.extras',
    });

    const [riderBenefitData, setRiderBenefitData] = useState<Rider[]>([]);
    const [featuresCards, setFeaturesCards] = useState(
        mapPolicyFeaturesToExtrasCards(
            policyDetails?.features.policyFeatures || [],
            t,
            policyDetails?.currency
        )
    );
    const [ridersCards, setRidersCards] = useState(
        mapPolicyRidersToExtrasCards(policyDetails, t)
    );
    const isMounted = useIsMounted();

    useEffect(() => {
        setRidersCards(
            mapPolicyRidersToExtrasCards(policyDetails, t, riderBenefitData)
        );
    }, [policyDetails, riderBenefitData, t]);

    useEffect(() => {
        // TODO: Convert to use tanstack for data fetching
        const isAnnuity = !!policyDetails?.isAnnuity;
        const getRiderBenefitDataOnPolicy = async () => {
            try {
                policyDetails?.riders?.map((rider: Rider) => {
                    setRiderBenefitData((prevData) => [
                        ...prevData,
                        rider ?? {},
                    ]);
                });
                setFeaturesCards(
                    mapPolicyFeaturesToExtrasCards(
                        policyDetails?.features.policyFeatures,
                        t,
                        policyDetails?.currency,
                        isAnnuity
                    )
                );
            } catch (error) {
                console.error(
                    'An error occurred setting rider/benefit data',
                    error
                );
            }
        };

        if (isMounted()) getRiderBenefitDataOnPolicy();
    }, [isMounted, policyDetails, t]);

    const cards = {
        Feature: featuresCards,
        Rider: ridersCards,
    };

    const filteredCards = [...(cards[filterValues.key] ?? [])]
        .filter(
            (card) =>
                card.status === filterValues.value ||
                filterValues.value === ExtraFilters.All
        )
        .sort((a, b) =>
            a.cardProps?.headerText?.toUpperCase() <
            b.cardProps?.headerText?.toUpperCase()
                ? -1
                : 1
        );

    if (!filteredCards.length) {
        return (
            <EmptyCard
                text={
                    t('general.empty', {
                        type: selectedTab.toLowerCase(),
                    }) as string
                }
            />
        );
    }

    return (
        <>
            {filteredCards.map(({ cardProps, cardKey }) => (
                <PolicyExtrasCard key={cardKey} {...cardProps} />
            ))}
        </>
    );
}
