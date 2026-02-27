import { useQuery } from '@tanstack/react-query';
import { Icon, IconType, Loader } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useContext, useMemo } from 'react';

import PersonPageHeader from '@deps/containers/page-header/interior-people-page-header';
import AddressCard from '@deps/containers/people-data-cards/address-card/address-card';
import EmailCard from '@deps/containers/people-data-cards/email-card/email-card';
import IdentificationCard from '@deps/containers/people-data-cards/identification-card/identification-card';
import PhoneCard from '@deps/containers/people-data-cards/phone-card/phone-card';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { isEndDated } from '@deps/helpers/date.helpers';
import PomAgentParty from '@deps/helpers/policy-sor/PomAgentParty';
import { getPomAgentData } from '@deps/queries/api/agents';
import { PomAgentData } from '@deps/types/agents';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import styles from './agent-sub-page.module.css';
import ActivityCard from '../people-data-cards/activity-card/activity-card';
import AllocationCard from '../people-data-cards/allocation-card/allocation-card';
import EmptyCard from '../people-data-cards/empty-card/empty-card';
import { getAgentRoles } from '../person-sub-page/person-sub-page.helpers';

export type AgentSubPage = {
    partyId: string;
    /** When true, the outer wrapper omits its own box-shadow (embedded in a tabbed parent) */
    isDualRoleView?: boolean;
};

export const AgentSubPage = ({
    partyId,
    isDualRoleView = false,
}: AgentSubPage) => {
    const { policy, policyDetails } = useContext(PolicyData);
    const { featureFlags } = useOptimizely();

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

    // Agent-only roles for AllocationCard and ActivityCard
    const agentOnlyRoles = useMemo(
        () => getAgentRoles(selectedPolicyPartyRoles),
        [selectedPolicyPartyRoles]
    );

    const newSelectedPolicyParty = policyDetails.getPartyById(partyId);

    // show allocation card if there are any agent roles NOT endDated
    const showAllocationCard = useMemo(() => {
        return !!agentOnlyRoles?.some((role) => !isEndDated(role.endDate));
    }, [agentOnlyRoles]);

    const { t } = useTranslation();

    return (
        <div className={isDualRoleView ? undefined : styles.wrapper}>
            {isLoading && (
                <div className={styles.loader}>
                    <Loader />
                </div>
            )}
            {!isLoading && agentData ? (
                <>
                    <PersonPageHeader
                        icon={
                            <Icon
                                type={IconType.BRIEFCASE}
                                width={24}
                                height={24}
                            />
                        }
                        selectedPolicyParty={agentData.party}
                        selectedPolicyPartyRoles={agentOnlyRoles}
                        editable={false}
                        partyStatus={agentData.party.partyStatus}
                        belowHeaderTextChildren={
                            <div className={styles.infoBanner}>
                                <Icon
                                    type={IconType.CIRCLE_INFO}
                                    width={16}
                                    height={16}
                                    className={styles.infoBannerIcon}
                                />
                                <span className={styles.infoBannerText}>
                                    {t('allFields.roleTabsAgentBanner')}
                                </span>
                            </div>
                        }
                    />

                    <hr className={styles.sectionDivider} />

                    {showAllocationCard && (
                        <>
                            <AllocationCard
                                deathBenefit={null}
                                hideRoleLabel
                                selectedPolicyPartyRoles={agentOnlyRoles}
                            />
                            <hr className={styles.sectionDivider} />
                        </>
                    )}

                    <IdentificationCard
                        selectedPolicyParty={agentData}
                        isAnnuity={policyDetails.isAnnuity}
                    />

                    <hr className={styles.sectionDivider} />
                    <PhoneCard
                        editable={false}
                        party={agentData?.party}
                        partyRoles={selectedPolicyPartyRoles}
                        planCode={planCode}
                        policyNumber={policyNumber}
                    />

                    <hr className={styles.sectionDivider} />
                    <EmailCard
                        editable={false}
                        party={agentData?.party}
                        partyRoles={selectedPolicyPartyRoles}
                        planCode={planCode}
                        policyNumber={policyNumber}
                    />

                    <hr className={styles.sectionDivider} />
                    <AddressCard
                        editable={false}
                        party={agentData?.party}
                        partyRoles={selectedPolicyPartyRoles}
                        planCode={planCode}
                        policyNumber={policyNumber}
                    />

                    {featureFlags?.[FEATURE_FLAGS.REVISED_HISTORY_TABLE] && (
                        <>
                            <hr className={styles.sectionDivider} />
                            <ActivityCard
                                selectedPolicyPartyRoles={agentOnlyRoles}
                                newSelectedPolicyParty={newSelectedPolicyParty}
                                selectedPolicyParty={selectedPolicyParty}
                            />
                        </>
                    )}
                </>
            ) : (
                <div className={styles.emptyState}>
                    <EmptyCard text={'No Agent data available.'} />
                </div>
            )}
        </div>
    );
};

export default AgentSubPage;
