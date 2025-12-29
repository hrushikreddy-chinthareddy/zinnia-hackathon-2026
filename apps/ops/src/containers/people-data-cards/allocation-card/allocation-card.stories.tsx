import { Meta } from '@storybook/react';
import { useTranslation } from 'next-i18next';

import { getRelationshipToInsured } from '@deps/helpers/party-info-helpers';
import { RelationshipToParty } from '@zinnia/api-types/types/sor';

import AllocationCard from './allocation-card';

export default {
    title: 'Containers/PeopleDataCards',
    component: AllocationCard,
} as Meta<typeof AllocationCard>;

export const AllocationCardContainer = () => {
    const { t } = useTranslation();
    const allocation = 100;
    const deathBenefit = 80000;
    const relationshipToInsured = RelationshipToParty.STEPFATHER;
    return (
        <div className="p-6">
            <AllocationCard
                allocation={allocation}
                deathBenefit={deathBenefit}
                relationshipToInsured={
                    getRelationshipToInsured(
                        relationshipToInsured,
                        t
                    ) as RelationshipToParty
                }
                selectedPartyId={''}
                selectedPartyType="Individual"
                editable={true}
            />
        </div>
    );
};
