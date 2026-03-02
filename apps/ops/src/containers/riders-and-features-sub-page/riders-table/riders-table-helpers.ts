import { TFunction } from 'next-i18next';

import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { toSentenceCase } from '@deps/helpers/string.helpers';
import { browserLogWarn } from '@deps/utils/browser-logging';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import { PartyStatus, Rider, Status } from '@zinnia/api-types/types/sor';

import { RiderInsuredData } from './types';
import { RIDER_NOT_ELECTED } from '../../policy-extras-cards/consts';

export const getRiderStatusText = (rider: Rider, t: TFunction): string => {
    if (rider.riderElected === RIDER_NOT_ELECTED) {
        return toSentenceCase(t('policy.extras.riders.notElected') as string);
    }

    switch (rider.status?.toLowerCase()) {
        case Status.ACTIVE.toLowerCase():
            return toSentenceCase(
                t('policy.extras.riders.available') as string
            );
        case Status.PENDING.toLowerCase():
            return toSentenceCase(t('policy.extras.riders.active') as string);
        case Status.TERMINATED.toLowerCase():
            return toSentenceCase(
                t('policy.extras.riders.terminated') as string
            );
        case Status.SUSPENDED.toLowerCase():
            return toSentenceCase(
                t('policy.extras.riders.suspended') as string
            );
        default:
            browserLogWarn(
                'getRiderStatusText::Invalid or unsupported rider type',
                { riderStatus: rider.status }
            );
            return toSentenceCase(rider?.status ?? '');
    }
};

export const getRiderInsured = (
    policyDetails: PolicyDetails,
    rider: Rider
): RiderInsuredData[] => {
    const insuredIds = rider.riderParticipant?.map(
        (participant) => participant.insuredId
    );

    if (!insuredIds?.length) {
        return [{ name: DEFAULT_ERROR_STRING }];
    }

    const hasCoveredPeople = policyDetails.coveredPeople.length > 0;

    return insuredIds.reduce<RiderInsuredData[]>((acc, insuredId) => {
        const insuredParty = policyDetails.getPartyById(insuredId);

        if (insuredParty?.party?.partyStatus === PartyStatus.NOTAPPROVED) {
            return acc;
        }

        if (!hasCoveredPeople || !insuredParty?.partyId) {
            acc.push({
                name: insuredParty?.fullName ?? DEFAULT_ERROR_STRING,
            });
            return acc;
        }

        acc.push({
            name: insuredParty.fullName,
            partyId: insuredParty.partyId,
            href: `/policies/${policyDetails.planCode}/${policyDetails.policyNumber}/people/${insuredParty.partyId}`,
        });
        return acc;
    }, []);
};
