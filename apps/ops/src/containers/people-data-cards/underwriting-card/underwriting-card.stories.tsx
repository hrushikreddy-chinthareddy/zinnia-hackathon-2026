import { Meta } from '@storybook/react';
import { useTranslation } from 'next-i18next';

import {
    findCoverageParticipant,
    getEmploymentStatus,
    getRiskClass,
    getSexAtBirth,
    getSubstandardRating,
} from '@deps/helpers/party-info-helper';
import { PolicyCoverage } from '@deps/models/policy/sor-policy';

import UnderwritingCard from './underwriting-card';

export default {
    title: 'Containers/PeopleDataCards',
    component: UnderwritingCard,
} as Meta<typeof UnderwritingCard>;

export const UnderwritingCardContainer = () => {
    const { t } = useTranslation();
    const policyPartyID = 'Party_PI_1';
    const disabled = true;
    const disabilityStartDate = '12/07/1912';

    const coverage: PolicyCoverage = {
        coverageLayers: [
            {
                coverageParticipants: [
                    {
                        flatExtra: [],
                        issueAge: 18,
                        partyId: 'Party_PI_1',
                        riskClass: 'STANDARDTOBACCO',
                        substandardRating: 'NONETABLE',
                    },
                ],
            },
        ],
    };
    const coverageParticipant = findCoverageParticipant(coverage, policyPartyID);
    const sexAtBirth = 'MALE';
    const employed = true;
    const employmentStatus = 'RETIRED';

    return (
        <div className="p-6">
            <UnderwritingCard
                riskClass={getRiskClass(coverageParticipant?.riskClass) || '-'}
                substandardRating={getSubstandardRating(coverageParticipant?.substandardRating, t) || '-'}
                disabled={disabled}
                disabilityStartDate={disabilityStartDate}
                sexAtBirth={getSexAtBirth(sexAtBirth, t)}
                editable={true}
                employed={employed}
                employmentStatus={getEmploymentStatus(employmentStatus, t)}
            />
        </div>
    );
};
