import { useTranslation } from 'next-i18next';
import { useContext, useMemo } from 'react';

import PersonPageHeader from '@deps/containers/page-header/interior-people-page-header';
import AddressCard from '@deps/containers/people-data-cards/address-card/address-card';
import AllocationCard from '@deps/containers/people-data-cards/allocation-card/allocation-card';
import BankCard from '@deps/containers/people-data-cards/bank-card/bank-card';
import EmailCard from '@deps/containers/people-data-cards/email-card/email-card';
import IdentificationCard from '@deps/containers/people-data-cards/identification-card/identification-card';
import PhoneCard from '@deps/containers/people-data-cards/phone-card/phone-card';
import UnderwritingCard from '@deps/containers/people-data-cards/underwriting-card/underwriting-card';
import { beneficiaryRoles } from '@deps/containers/side-sheet-allocations/side-sheet-allocations-helper';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { findCoverageParticipant, getRiskClass, getSexAtBirth, getSubstandardRating } from '@deps/helpers/party-info-helper';
import useBreadcrumb from '@deps/hooks/useBreadcrumbs';
import { PartyRole } from '@deps/models/policy/sor-policy';

export type PersonSubPageProps = {
    editable?: boolean;
    partyId: string;
};

// TODO -- change editable to false once auth is implemented
export const PersonSubPage = ({ partyId, editable = true }: PersonSubPageProps) => {
    const { policy } = useContext(PolicyData);

    const { t } = useTranslation();
    const { breadcrumb } = useBreadcrumb();

    const { coverage, parties, partyRoles, policyNumber, product } = policy ?? {};
    const { planCode } = product ?? {};

    const selectedPolicyParty = useMemo(() => {
        return parties?.find(pr => pr.partyId === partyId);
    }, [parties, partyId]);

    const selectedPolicyPartyRoles = useMemo(() => {
        return partyRoles?.filter(pr => pr.partyId === selectedPolicyParty?.partyId) || [];
    }, [partyRoles, selectedPolicyParty?.partyId]);

    const beneficiaryRole = selectedPolicyPartyRoles?.find(sppr => beneficiaryRoles.includes(sppr.partyRole))?.partyRole;
    const isInsured = selectedPolicyPartyRoles?.some(sppr => sppr.partyRole === PartyRole.INSURED);
    const coverageParticipant = coverage && findCoverageParticipant(coverage, selectedPolicyParty?.partyId);
    const relationshipToInsured = partyRoles?.find(role => role.partyId === selectedPolicyParty?.partyId)?.relationshipToInsured;

    return (
        <div className="shadow-elevation-light-04">
            <PersonPageHeader
                breadcrumbText={breadcrumb?.text}
                breadcrumbUrl={breadcrumb?.url}
                selectedPolicyParty={selectedPolicyParty}
                selectedPolicyPartyRoles={selectedPolicyPartyRoles}
                editable={editable}
            />

            {beneficiaryRole && (
                <>
                    <hr className=" h-0.5 border-none bg-gray-100" />
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

            <hr className=" h-0.5 border-none bg-gray-100" />
            <IdentificationCard selectedPolicyParty={selectedPolicyParty} />

            <hr className="h-0.5 border-none bg-gray-100" />
            <PhoneCard
                editable={editable}
                party={selectedPolicyParty}
                partyRoles={selectedPolicyPartyRoles}
                planCode={planCode}
                policyNumber={policyNumber}
            />

            <hr className="h-0.5 border-none bg-gray-100" />
            <EmailCard
                editable={editable}
                party={selectedPolicyParty}
                partyRoles={selectedPolicyPartyRoles}
                planCode={planCode}
                policyNumber={policyNumber}
            />

            <hr className="h-0.5 border-none bg-gray-100" />
            <AddressCard
                editable={editable}
                party={selectedPolicyParty}
                partyRoles={selectedPolicyPartyRoles}
                planCode={planCode}
                policyNumber={policyNumber}
            />

            <hr className="h-0.5 border-none bg-gray-100" />
            <BankCard
                editable={editable}
                party={selectedPolicyParty}
                // TODO CB - set these ase vars to be reused above
                planCode={planCode}
                policyNumber={policyNumber}
            />

            {isInsured && (
                <>
                    <hr className="h-0.5 border-none bg-gray-100" />
                    <UnderwritingCard
                        riskClass={getRiskClass(coverageParticipant?.riskClass, t)}
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
