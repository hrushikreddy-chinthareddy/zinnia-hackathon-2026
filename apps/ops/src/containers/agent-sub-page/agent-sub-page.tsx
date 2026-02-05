import { useQuery } from '@tanstack/react-query';
import { Loader } from '@zinnia/bloom/components';
import { useContext, useMemo } from 'react';

import PersonPageHeader from '@deps/containers/page-header/interior-people-page-header';
import AddressCard from '@deps/containers/people-data-cards/address-card/address-card';
import EmailCard from '@deps/containers/people-data-cards/email-card/email-card';
import IdentificationCard from '@deps/containers/people-data-cards/identification-card/identification-card';
import PhoneCard from '@deps/containers/people-data-cards/phone-card/phone-card';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import PomAgentParty from '@deps/helpers/policy-sor/PomAgentParty';
import { getPomAgentData } from '@deps/queries/api/agents';
import { PomAgentData } from '@deps/types/agents';

import AllocationCard from '../people-data-cards/allocation-card/allocation-card';
import EmptyCard from '../people-data-cards/empty-card/empty-card';

export type AgentSubPage = {
    partyId: string;
};

export const AgentSubPage = ({ partyId }: AgentSubPage) => {
    const { policy, policyDetails } = useContext(PolicyData);

    const { parties, partyRoles, policyNumber, product } = policy ?? {};
    const { planCode } = product ?? {};

    const selectedPolicyParty = useMemo(() => {
        return parties?.find((pr) => pr.partyId === partyId);
    }, [parties, partyId]);

    const selectedPolicyPartyRoles = useMemo(() => {
        return (
            partyRoles?.filter(
                (pr) => pr.partyId === selectedPolicyParty?.partyId
            ) || []
        );
    }, [partyRoles, selectedPolicyParty?.partyId]);

    const agentId = selectedPolicyParty?.agentExternalId;

    const { data: agentData, isLoading } = useQuery({
        queryKey: ['agentData', agentId, policyNumber, planCode],
        queryFn: () => getPomAgentData({ id: agentId, policyNumber, planCode }),
        enabled: !!policyNumber && !!agentId && !!planCode,
        select: (data) =>
            data
                ? new PomAgentParty(data as PomAgentData, selectedPolicyParty)
                : undefined,
    });

    return (
        <div className="shadow-elevation-light-04">
            {isLoading && (
                <div className="h-screen text-center mt-16">
                    <Loader />
                </div>
            )}
            {!isLoading && agentData ? (
                <>
                    <PersonPageHeader
                        selectedPolicyParty={agentData?.party}
                        selectedPolicyPartyRoles={selectedPolicyPartyRoles}
                        editable={false}
                        partyStatus={selectedPolicyParty?.partyStatus}
                    />

                    <hr className=" h-0.5 border-none bg-gray-100" />
                    <AllocationCard
                        deathBenefit={null}
                        selectedPolicyPartyRoles={selectedPolicyPartyRoles}
                    />

                    <hr className=" h-0.5 border-none bg-gray-100" />
                    <IdentificationCard
                        selectedPolicyParty={agentData}
                        isAnnuity={policyDetails.isAnnuity}
                    />

                    <hr className="h-0.5 border-none bg-gray-100" />
                    <PhoneCard
                        editable={false}
                        party={agentData?.party}
                        partyRoles={selectedPolicyPartyRoles}
                        planCode={planCode}
                        policyNumber={policyNumber}
                    />

                    <hr className="h-0.5 border-none bg-gray-100" />
                    <EmailCard
                        editable={false}
                        party={agentData?.party}
                        partyRoles={selectedPolicyPartyRoles}
                        planCode={planCode}
                        policyNumber={policyNumber}
                    />

                    <hr className="h-0.5 border-none bg-gray-100" />
                    <AddressCard
                        editable={false}
                        party={agentData?.party}
                        partyRoles={selectedPolicyPartyRoles}
                        planCode={planCode}
                        policyNumber={policyNumber}
                    />
                </>
            ) : (
                <div className="p-4">
                    <EmptyCard text={'No Agent data available.'} />
                </div>
            )}
        </div>
    );
};

export default AgentSubPage;
