import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import PolicyExtrasCard from '@deps/components/policy-extras-card/policy-extras-card';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { useIsMounted } from '@deps/hooks/useIsMounted';
import { Rider } from '@deps/models/policy/sor-policy';
import { getRiderBenefitData } from '@deps/queries/api/product-rate';
import { RiderBenefit } from '@deps/types/product-rate';

import { mapPolicyFeaturesToExtrasCards, mapPolicyRidersToExtrasCards } from './policy-extras-cards-helper';

type PolicyExtrasCardsProps = {
    policyDetails?: PolicyDetails;
    filterValues: { key: 'type' | 'status'; value: string } | null;
};

export enum ExtrasCardType {
    Feature = 'Feature',
    Rider = 'Rider',
}

export default function PolicyExtrasCards({ policyDetails, filterValues }: PolicyExtrasCardsProps) {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'policy.extras',
    });

    const [riderBenefitData, setRiderBenefitData] = useState<RiderBenefit[]>([]);
    const [featuresCards, setFeaturesCards] = useState(mapPolicyFeaturesToExtrasCards(policyDetails?.features.policyFeatures || [], t, policyDetails?.currency));
    const [ridersCards, setRidersCards] = useState(mapPolicyRidersToExtrasCards(policyDetails, t));
    const isMounted = useIsMounted();
    
    
    
    useEffect(() => {
        setRidersCards(mapPolicyRidersToExtrasCards(policyDetails, t, riderBenefitData));
    }, [policyDetails, riderBenefitData, t]);
    
    useEffect(() => {
        const isAnnuity = !!policyDetails?.isAnnuity;
        const getRiderBenefitDataOnPolicy = async () => {
            try {
                policyDetails?.riders?.map(async (rider: Rider) => {
                    const riderBenefit = await getRiderBenefitData(policyDetails, rider);

                    setRiderBenefitData(prevData => [...prevData, riderBenefit ?? {}]);
                });
                setFeaturesCards(mapPolicyFeaturesToExtrasCards(policyDetails?.features.policyFeatures, t, policyDetails?.currency, isAnnuity));
            } catch (error) {
                console.error('An error occurred setting rider/benefit data', error);
            }
        };

        if (isMounted()) getRiderBenefitDataOnPolicy();
    }, [isMounted, policyDetails, t]);

    const filteredCards = [...(featuresCards ?? []), ...(ridersCards ?? [])]
        .filter(card => (filterValues ? card[filterValues.key] === filterValues?.value : true))
        .sort((a, b) => (a.cardProps?.headerText?.toUpperCase() < b.cardProps?.headerText?.toUpperCase() ? -1 : 1));

    return (
        <>
            {filteredCards.map(({ cardProps, cardKey }) => (
                <PolicyExtrasCard key={cardKey} {...cardProps} />
            ))}
        </>
    );
}
