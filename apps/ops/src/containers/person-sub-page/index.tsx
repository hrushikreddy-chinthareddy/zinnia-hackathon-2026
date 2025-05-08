import { useTranslation } from 'next-i18next';
import { useContext, useMemo } from 'react';

import { beneficiaryRoles } from '@deps/components/side-sheet/side-sheet-allocations/side-sheet-allocations-helpers';
import PersonPageHeader from '@deps/containers/page-header/interior-people-page-header';
import AddressCard from '@deps/containers/people-data-cards/address-card/address-card';
import AllocationCard from '@deps/containers/people-data-cards/allocation-card/allocation-card';
import BankCard from '@deps/containers/people-data-cards/bank-card/bank-card';
import EmailCard from '@deps/containers/people-data-cards/email-card/email-card';
import IdentificationCard from '@deps/containers/people-data-cards/identification-card/identification-card';
import PhoneCard from '@deps/containers/people-data-cards/phone-card/phone-card';
import UnderwritingCard from '@deps/containers/people-data-cards/underwriting-card/underwriting-card';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { findCoverageParticipant, getRiskClass, getSexAtBirth, getSubstandardRating } from '@deps/helpers/party-info-helpers';
import { PartyRole } from '@deps/models/policy/sor-policy';

import AgentSubPage from '../agent-sub-page/agent-sub-page';

export type PersonSubPageProps = {
    editable?: boolean;
    partyId: string;
};

// TODO -- change editable to false once auth is implemented
export const PersonSubPage = ({ partyId, editable = true }: PersonSubPageProps) => {
    const { policy, policyDetails } = useContext(PolicyData);

    const { t } = useTranslation();

    const { coverage, parties, partyRoles, policyNumber, product } = policy ?? {};
    const { planCode } = product ?? {};

    const selectedPolicyParty = useMemo(() => {
        return parties?.find(pr => pr.partyId === partyId);
    }, [parties, partyId]);

    const selectedPolicyPartyRoles = useMemo(() => {
        return partyRoles?.filter(pr => pr.partyId === selectedPolicyParty?.partyId) || [];
    }, [partyRoles, selectedPolicyParty?.partyId]);

    // to do - this is the new implementation of the Parties Class - update in all locations, rather than just the Identification Card
    const newSelectedPolicyParty = policyDetails.getPartyById(partyId);

    const beneficiaryRole = selectedPolicyPartyRoles?.find(sppr => beneficiaryRoles.includes(sppr.partyRole))?.partyRole;
    const isInsured = selectedPolicyPartyRoles?.some(sppr => sppr.partyRole === PartyRole.INSURED);
    const coverageParticipant = coverage && findCoverageParticipant(coverage, selectedPolicyParty?.partyId);
    const relationshipToInsured = partyRoles?.find(role => role.partyId === selectedPolicyParty?.partyId)?.relationshipToInsured;

    const selectedPartyRoles = selectedPolicyPartyRoles.map(roleObject => {
        return roleObject.partyRole?.toLowerCase();
    });
    const isAgent =
        selectedPartyRoles.includes(PartyRole.PRIMARYWRITINGAGENT.toLowerCase()) ||
        selectedPartyRoles.includes(PartyRole.PRIMARYSERVICINGAGENT.toLowerCase());

    if (isAgent) {
        return <AgentSubPage partyId={partyId} />;
    } else
        return (
            <div className="shadow-elevation-light-04">
                <PersonPageHeader
                    selectedPolicyParty={selectedPolicyParty}
                    selectedPolicyPartyRoles={selectedPolicyPartyRoles}
                    editable={editable}
                    partyStatus={selectedPolicyParty?.partyStatus}
                />

                {beneficiaryRole && (
                    <>
                        <hr className="h-0.5 border-none bg-gray-200" />
                        <AllocationCard
                            allocation={selectedPolicyParty?.beneficiaryPercentage}
                            editable={editable}
                            deathBenefit={null} // deathBenefit is needed for estimated amount, which is currently out of scope
                            relationshipToInsured={relationshipToInsured}
                            selectedPartyId={selectedPolicyParty?.partyId}
                            selectedPartyType={selectedPolicyParty?.partyType}
                        />
                    </>
                )}

                <hr className="h-0.5 border-none bg-gray-200" />
                <IdentificationCard selectedPolicyParty={newSelectedPolicyParty} isAnnuity={policyDetails.isAnnuity} />

                <hr className="h-0.5 border-none bg-gray-200" />
                <PhoneCard
                    editable={editable}
                    party={selectedPolicyParty}
                    partyRoles={selectedPolicyPartyRoles}
                    planCode={planCode}
                    policyNumber={policyNumber}
                />

                <hr className="h-0.5 border-none bg-gray-200" />
                <EmailCard
                    editable={editable}
                    party={selectedPolicyParty}
                    partyRoles={selectedPolicyPartyRoles}
                    planCode={planCode}
                    policyNumber={policyNumber}
                />

                <hr className="h-0.5 border-none bg-gray-200" />
                <AddressCard
                    editable={editable}
                    party={selectedPolicyParty}
                    partyRoles={selectedPolicyPartyRoles}
                    planCode={planCode}
                    policyNumber={policyNumber}
                />

                <hr className="h-0.5 border-none bg-gray-200" />
                <BankCard
                    editable={editable}
                    party={selectedPolicyParty}
                    // TODO CB - set these ase vars to be reused above
                    planCode={planCode}
                    policyNumber={policyNumber}
                />

                {isInsured && (
                    <>
                        <hr className="h-0.5 border-none bg-gray-200" />
                        <UnderwritingCard
                            riskClass={getRiskClass(coverageParticipant?.riskClass)}
                            substandardRating={getSubstandardRating(coverageParticipant?.substandardRating, t)}
                            disabled={selectedPolicyParty?.insured?.impairmentDetails?.disabled}
                            disabilityStartDate={selectedPolicyParty?.insured?.impairmentDetails?.disabilityStartDate}
                            employed={selectedPolicyParty?.insured?.employed}
                            employmentStatus={selectedPolicyParty?.insured?.employmentStatus}
                            sexAtBirth={getSexAtBirth(selectedPolicyParty?.gender, t)}
                        />
                    </>
                )}
            </div>
        );
};

export default PersonSubPage;
