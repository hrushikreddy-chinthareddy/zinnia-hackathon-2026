import { Loader } from '@zinnia/bloom/components';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import PersonPageHeader from '@deps/containers/page-header/interior-people-page-header';
import AddressCard from '@deps/containers/people-data-cards/address-card/address-card';
import EmailCard from '@deps/containers/people-data-cards/email-card/email-card';
import IdentificationCard from '@deps/containers/people-data-cards/identification-card/identification-card';
import PhoneCard from '@deps/containers/people-data-cards/phone-card/phone-card';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import AgentParty from '@deps/helpers/policy-sor/AgentParty';
import useBreadcrumb from '@deps/hooks/useBreadcrumbs';
import { getAgentData } from '@deps/queries/api/agents';

import AllocationCard from '../people-data-cards/allocation-card/allocation-card';
import FirmInformationCard from '../people-data-cards/firm-information-card/firm-information-card';

export type AgentSubPage = {
    partyId: string;
};

export const AgentSubPage = ({ partyId }: AgentSubPage) => {
    const [agentData, setAgentData] = useState<AgentParty>();
    const [isLoading, setIsLoading] = useState(true);
    const { policy, policyDetails } = useContext(PolicyData);

    const { breadcrumb } = useBreadcrumb();

    const { parties, partyRoles, policyNumber, product } = policy ?? {};
    const { planCode } = product ?? {};

    const selectedPolicyParty = useMemo(() => {
        return parties?.find(pr => pr.partyId === partyId);
    }, [parties, partyId]);

    const selectedPolicyPartyRoles = useMemo(() => {
        return partyRoles?.filter(pr => pr.partyId === selectedPolicyParty?.partyId) || [];
    }, [partyRoles, selectedPolicyParty?.partyId]);

    const agentId = selectedPolicyParty?.agentExternalId;
    const clientCode = policy.carrierId;

    const fetchPolicies = useCallback(async () => {
        try {
            const result = await getAgentData({ clientCode, id: agentId, policyNumber, planCode });
            setAgentData(new AgentParty(result, selectedPolicyParty));
        } catch (error) {
            console.error('Unable to fetch agent details', error);
            setAgentData(new AgentParty(undefined, selectedPolicyParty));
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [agentId, clientCode]);

    useEffect(() => {
        fetchPolicies();
    }, [fetchPolicies]);

    return (
        <div className="shadow-elevation-light-04">
            {isLoading && (
                <div className="h-screen text-center mt-16">
                    <Loader />
                </div>
            )}
            {!isLoading && agentData && (
                <>
                    <PersonPageHeader
                        breadcrumbText={breadcrumb?.text}
                        breadcrumbUrl={breadcrumb?.url}
                        selectedPolicyParty={agentData?.party}
                        selectedPolicyPartyRoles={selectedPolicyPartyRoles}
                        editable={false}
                        partyStatus={selectedPolicyParty?.partyStatus}
                    />

                    <hr className=" h-0.5 border-none bg-gray-100" />
                    <FirmInformationCard selectedPolicyParty={agentData} />

                    <hr className=" h-0.5 border-none bg-gray-100" />
                    <AllocationCard allocation={agentData?.party?.agentPercentage} deathBenefit={null} />

                    <hr className=" h-0.5 border-none bg-gray-100" />
                    <IdentificationCard
                        selectedPolicyParty={agentData}
                        isAnnuity={policyDetails.isAnnuity}
                        partyRoles={selectedPolicyPartyRoles}
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
            )}
        </div>
    );
};

export default AgentSubPage;
