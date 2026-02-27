import { useQuery } from '@tanstack/react-query';
import { Icon, IconType, TabContent } from '@zinnia/bloom/components';
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
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { isEndDated } from '@deps/helpers/date.helpers';
import {
    findCoverageParticipant,
    getRiskClass,
    getSexAtBirth,
    getSubstandardRating,
} from '@deps/helpers/party-info-helpers';
import { useTransactionPermissionCheck } from '@deps/hooks/useTransactionPermissionCheck';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import {
    checkAddressChangeEligibilityQuery,
    checkCommunicationPreferenceChangeEligibilityQuery,
    checkEmailChangeEligibilityQuery,
    checkManageBankChangeEligibilityQuery,
    checkPhoneChangeEligibilityQuery,
} from '@deps/queries/tanstack/checkEligibilityQueries/checkEligibilityQueries';
import { TransactionPermission } from '@deps/utils/auth';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { PartyRole } from '@zinnia/api-types/types/sor';

import PersonRoleTabs from './person-role-tabs';
import {
    getAgentRoles,
    getNonAgentRoles,
    hasAgentAndNonAgentRoles,
    PersonRoleTabValues,
} from './person-sub-page.helpers';
import styles from './person-sub-page.module.css';
import AgentSubPage from '../agent-sub-page/agent-sub-page';
import ActivityCard from '../people-data-cards/activity-card/activity-card';

export type PersonSubPageProps = {
    editable?: boolean;
    partyId: string;
    /** Tab slug from the URL for dual-role persons (e.g. 'agent-details') */
    roleTab?: string;
};

// TODO -- change editable to false once auth is implemented
export const PersonSubPage = ({
    partyId,
    editable = true,
    roleTab,
}: PersonSubPageProps) => {
    const { policy, policyDetails } = useContext(PolicyData);

    const { featureFlags } = useOptimizely();

    const { t } = useTranslation();

    const { coverage, parties, partyRoles, policyNumber, product } =
        policy ?? {};
    const { planCode } = product ?? {};

    const selectedPolicyParty = useMemo(() => {
        return parties?.find((pr) => pr.partyId === partyId);
    }, [parties, partyId]);

    const selectedPolicyPartyRoles = useMemo(() => {
        return (
            partyRoles?.filter(
                (pr) =>
                    pr.partyId === selectedPolicyParty?.partyId &&
                    !isEndDated(pr.endDate)
            ) || []
        );
    }, [partyRoles, selectedPolicyParty?.partyId]);
    const hasTPD = selectedPolicyPartyRoles.some(
        (policy) => policy.partyRole === PartyRole.THIRDPARTYDESIGNEE
    );

    // to do - this is the new implementation of the Parties Class - update in all locations, rather than just the Identification Card
    const newSelectedPolicyParty = policyDetails.getPartyById(partyId);

    const beneficiaryRole = selectedPolicyPartyRoles?.find((sppr) =>
        beneficiaryRoles.includes(sppr.partyRole)
    )?.partyRole;
    const isInsured = selectedPolicyPartyRoles?.some(
        (sppr) => sppr.partyRole === PartyRole.INSURED
    );
    const coverageParticipant =
        coverage &&
        findCoverageParticipant(coverage, selectedPolicyParty?.partyId);
    const relationshipToInsured = partyRoles?.find(
        (role) => role.partyId === selectedPolicyParty?.partyId
    )?.relationshipToInsured;

    const { data: emailChangeEligibility } = useQuery({
        queryKey: ['emailChangeEligibility', planCode, policyNumber],
        queryFn: () =>
            checkEmailChangeEligibilityQuery(
                planCode as string,
                policyNumber as string
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => {
            return {
                ...data,
                isEligibleEmailChange:
                    data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    const { data: addressChangeEligibility } = useQuery({
        queryKey: [
            'checkAddressChangeEligibilityQuery',
            planCode,
            policyNumber,
        ],
        queryFn: () =>
            checkAddressChangeEligibilityQuery(
                planCode as string,
                policyNumber as string
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => {
            return {
                ...data,
                isEligibleAddressChange:
                    data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    const { data: communicationPreferenceChangeEligibility } = useQuery({
        queryKey: [
            'checkCommunicationPreferenceChangeEligibilityQuery',
            planCode,
            policyNumber,
        ],
        queryFn: () =>
            checkCommunicationPreferenceChangeEligibilityQuery(
                planCode as string,
                policyNumber as string
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => {
            return {
                ...data,
                isEligibleCommunicationPreferenceChange:
                    data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    // Trigger condition: person has at least 1 agent role AND at least 1 non-agent role
    const isDualRole = hasAgentAndNonAgentRoles(selectedPolicyPartyRoles);

    // Pre-filtered role sets for dual-role mode
    const hasAgentRoles = !!getAgentRoles(selectedPolicyPartyRoles).length;
    const nonAgentPartyRoles = useMemo(
        () => getNonAgentRoles(selectedPolicyPartyRoles),
        [selectedPolicyPartyRoles]
    );

    const { isPermissioned: isUserAllowedToEditCards } =
        useTransactionPermissionCheck(
            TransactionPermission.WritePolicy,
            policyNumber,
            planCode
        );

    const { data: phoneChangeEligibility } = useQuery({
        queryKey: [
            'checkPhoneChangeEligibilityQuery',
            planCode,
            policyNumber,
            policy.policyNumber,
        ],
        queryFn: () =>
            checkPhoneChangeEligibilityQuery(
                planCode as string,
                policy.policyNumber as string
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => {
            return {
                ...data,
                isEligiblePhoneChange:
                    data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    const { data: manageBankChangeEligibility } = useQuery({
        queryKey: [
            'checkManageJointOwnerEligibilityQuery',
            planCode,
            policy.policyNumber,
        ],
        queryFn: () =>
            checkManageBankChangeEligibilityQuery(
                planCode as string,
                policy.policyNumber as string
            ),
        placeholderData: (previousData) => previousData,
        select: (data) => {
            return {
                ...data,
                isEligibleBankChange:
                    data?.status === TransactionResponseStatus.Success,
            };
        },
    });

    // Agent-only (no non-agent roles) → existing AgentSubPage
    if (hasAgentRoles && !isDualRole) {
        return <AgentSubPage partyId={partyId} />;
    }

    // Shared header: dual-role adds a User icon and shows only non-agent role tags
    const header = (
        <PersonPageHeader
            icon={
                isDualRole ? (
                    <Icon type={IconType.USER} width={24} height={24} />
                ) : undefined
            }
            selectedPolicyParty={selectedPolicyParty}
            selectedPolicyPartyRoles={
                isDualRole ? nonAgentPartyRoles : selectedPolicyPartyRoles
            }
            editable={
                editable &&
                communicationPreferenceChangeEligibility?.isEligibleCommunicationPreferenceChange
            }
            isUserPermissionedToEditCards={isUserAllowedToEditCards}
            partyStatus={selectedPolicyParty?.partyStatus}
        />
    );

    // Policy Details panel content (non-agent sections)
    const policyDetailsContent = (
        <>
            {isDualRole && !!nonAgentPartyRoles.length ? (
                <>
                    <hr className={styles.sectionDivider} />
                    <AllocationCard
                        deathBenefit={null}
                        selectedPolicyPartyRoles={nonAgentPartyRoles}
                    />
                </>
            ) : (
                beneficiaryRole && (
                    <>
                        <hr className={styles.sectionDivider} />
                        <AllocationCard
                            allocation={
                                selectedPolicyParty?.beneficiaryPercentage
                            }
                            editable={editable}
                            deathBenefit={null} // deathBenefit is needed for estimated amount, which is currently out of scope
                            relationshipToInsured={relationshipToInsured}
                            selectedPartyId={selectedPolicyParty?.partyId}
                            selectedPartyType={selectedPolicyParty?.partyType}
                        />
                    </>
                )
            )}

            <hr className={styles.sectionDivider} />
            <IdentificationCard
                selectedPolicyParty={newSelectedPolicyParty}
                isAnnuity={policyDetails.isAnnuity}
            />

            <hr className={styles.sectionDivider} />
            <PhoneCard
                editable={
                    editable && phoneChangeEligibility?.isEligiblePhoneChange
                }
                isUserPermissionedToEditCards={isUserAllowedToEditCards}
                party={selectedPolicyParty}
                partyRoles={selectedPolicyPartyRoles}
                planCode={planCode}
                policyNumber={policyNumber}
            />

            <hr className={styles.sectionDivider} />
            <EmailCard
                editable={
                    editable && emailChangeEligibility?.isEligibleEmailChange
                }
                isUserPermissionedToEditCards={isUserAllowedToEditCards}
                party={selectedPolicyParty}
                partyRoles={selectedPolicyPartyRoles}
                planCode={planCode}
                policyNumber={policyNumber}
            />

            <hr className={styles.sectionDivider} />
            <AddressCard
                editable={
                    editable &&
                    addressChangeEligibility?.isEligibleAddressChange
                }
                isUserPermissionedToEditCards={isUserAllowedToEditCards}
                party={selectedPolicyParty}
                partyRoles={selectedPolicyPartyRoles}
                planCode={planCode}
                policyNumber={policyNumber}
            />

            <hr className={styles.sectionDivider} />
            {!hasTPD && (
                <BankCard
                    editable={editable}
                    isUserPermissionedToEditCards={isUserAllowedToEditCards}
                    party={selectedPolicyParty}
                    planCode={planCode}
                    policyNumber={policyNumber}
                    isEligible={
                        manageBankChangeEligibility?.isEligibleBankChange
                    }
                />
            )}

            {isInsured && (
                <>
                    <hr className={styles.sectionDivider} />
                    <UnderwritingCard
                        riskClass={getRiskClass(coverageParticipant?.riskClass)}
                        substandardRating={getSubstandardRating(
                            coverageParticipant?.substandardRating,
                            t
                        )}
                        disabled={
                            !!selectedPolicyParty?.insured?.impairmentDetails
                                ?.disabled
                        }
                        disabilityStartDate={
                            selectedPolicyParty?.insured?.impairmentDetails
                                ?.disabilityStartDate
                        }
                        employed={!!selectedPolicyParty?.insured?.employed}
                        employmentStatus={
                            selectedPolicyParty?.insured?.employmentStatus
                        }
                        sexAtBirth={getSexAtBirth(
                            selectedPolicyParty?.gender,
                            t
                        )}
                    />
                </>
            )}
            {featureFlags?.[FEATURE_FLAGS.REVISED_HISTORY_TABLE] && (
                <>
                    <hr className={styles.sectionDivider} />
                    <ActivityCard
                        selectedPolicyPartyRoles={
                            isDualRole
                                ? nonAgentPartyRoles
                                : selectedPolicyPartyRoles
                        }
                        newSelectedPolicyParty={newSelectedPolicyParty}
                        selectedPolicyParty={selectedPolicyParty}
                    />
                </>
            )}
        </>
    );

    // Dual-role: show tabs with Policy Details and Agent Details panels
    if (isDualRole) {
        return (
            <div className={styles.wrapper}>
                <PersonRoleTabs activeTab={roleTab}>
                    <TabContent
                        className={styles.tabContentFull}
                        value={PersonRoleTabValues.policyDetails}
                    >
                        {header}
                        {policyDetailsContent}
                    </TabContent>
                    <TabContent
                        className={styles.tabContentFull}
                        value={PersonRoleTabValues.agentDetails}
                    >
                        <AgentSubPage partyId={partyId} isDualRoleView />
                    </TabContent>
                </PersonRoleTabs>
            </div>
        );
    }

    // Non-agent-only: existing behavior without tabs
    return (
        <div className={styles.wrapper}>
            {header}
            {policyDetailsContent}
        </div>
    );
};

export default PersonSubPage;
