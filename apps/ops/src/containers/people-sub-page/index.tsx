import * as RadioGroup from '@radix-ui/react-radio-group';
import { useQueries } from '@tanstack/react-query';
import { Toggle } from '@zinnia/bloom/components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useMemo, useState } from 'react';

import GlobalPolicyInfo from '@deps/components/global-values/policy-info/policy-info';
import { PopoverPlacement } from '@deps/components/popover/popover';
import BeneficiaryCardContainer from '@deps/containers/people-card-container/beneficiary-card-container';
import PeopleCardContainer from '@deps/containers/people-card-container/people-card-container';
import {
    AgentType,
    BeneficiaryType,
    PeopleCardData,
} from '@deps/containers/people-card-container/people-card-container.types';
import { ChipEnterContext } from '@deps/contexts/ChipEnterContext';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { PeopleRolesFilterContext } from '@deps/contexts/PeopleRolesFilter';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { useSideSheetContextLegacy } from '@deps/contexts/SideSheetContext';
import { isEndDated } from '@deps/helpers/date.helpers';
import { policyDataToGlobalValues } from '@deps/helpers/global-values';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import PomAgentParty from '@deps/helpers/policy-sor/PomAgentParty';
import { sortByAndThenBy } from '@deps/helpers/sort.helpers';
import { getPomAgentData } from '@deps/queries/api/agents';
import { PomAgentData } from '@deps/types/agents';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { toTitleCase } from '@deps/utils/strings';
import { Parties, PartyRole } from '@zinnia/api-types/types/sor';

import ManagePeople from './manage-people';
import {
    NameTag,
    agentDataByType,
    beneficiaryDataByType,
    combineNameAndRoles,
    convertToTagText,
    countPartyRoles,
    normalizePartyRole,
} from './people-sub-page.helpers';
import styles from './people-sub-page.module.css';
import SideSheetAllocations from '../../components/side-sheet/side-sheet-allocations/side-sheet-allocations';
import PeoplePageHeaderContainer from '../page-header/people-page-header';

const ALL_ROLES = 'All';

export interface CardActionData {
    filteredData: NameTag[];
    isBeneficiarySelected: boolean;
    isAgentSelected: boolean;
}

export interface PeopleState {
    cardActionData: CardActionData;
    selectedChip: string;
    selectedTagList: string[];
}

export const PeopleSubPage: React.FC<{ isEligibleBeneficiary?: boolean }> = ({
    isEligibleBeneficiary,
}) => {
    const { policy, refreshPolicy } = useContext(PolicyData);

    const { t } = useTranslation();
    const [showArchived, setShowArchived] = useState(false);
    const policyDetails = useMemo(() => new PolicyDetails(policy), [policy]);
    const router = useRouter();
    const extractedParties = useMemo(() => policy?.parties || [], [policy]);
    // if there's an enddate and the enddate is in the past, that role is no longer valid
    const extractedPartyRoles = useMemo(
        () =>
            policy?.partyRoles?.filter(
                (role) => !role.endDate || !isEndDated(role.endDate)
            ) || [],
        [policy]
    );
    const archivedPartyRoles = useMemo(
        () =>
            policy?.partyRoles?.filter(
                (role) => !!role.endDate && isEndDated(role.endDate)
            ) ?? [],
        [policy]
    );
    const countedRoles = useMemo(
        () =>
            countPartyRoles(
                showArchived ? archivedPartyRoles : extractedPartyRoles,
                t
            ),
        [extractedPartyRoles, showArchived, archivedPartyRoles, t]
    );
    const nameTags = useMemo(
        () =>
            combineNameAndRoles(
                extractedParties,
                showArchived ? archivedPartyRoles : extractedPartyRoles,
                t
            ),
        [
            extractedParties,
            extractedPartyRoles,
            showArchived,
            archivedPartyRoles,
            t,
        ]
    );

    const { featureFlags } = useOptimizely();

    const beneChangeEnabled =
        featureFlags[FEATURE_FLAGS.BENEFICIARY_CHANGE_TRANSACTION];

    const { peopleRolesFilter, setPeopleRolesFilter, clearPeopleRolesFilter } =
        useContext(PeopleRolesFilterContext);
    const [chipEntered, setChipEntered] = useState(false);
    const sideSheet = useSideSheetContextLegacy();
    const globalValuesData = useMemo(
        () => policyDataToGlobalValues(policyDetails, t),
        [policyDetails, t]
    );
    const openSidesheet = () => {
        sideSheet.changeSideSheetContent(
            <GlobalPolicyInfo
                tooltipPlacements={PopoverPlacement.BottomLeft}
                {...globalValuesData}
            />,
            <SideSheetAllocations
                handleClose={() => sideSheet.handleOpen(false)}
                policy={policy}
                refreshPolicy={refreshPolicy}
            />
        );
        sideSheet.handleOpen(true);
    };

    // Archived name tags filtered by the currently selected role,
    // used to enable/disable the "Show archived parties" toggle.
    const archivedNameTags = useMemo(() => {
        const tags = combineNameAndRoles(
            extractedParties,
            archivedPartyRoles,
            t
        );

        // If ALL is selected, just check if any archived exists
        if (peopleRolesFilter.filterValue === ALL_ROLES) {
            return tags;
        }

        // Otherwise, filter by selected role
        return tags.filter((nameTag) =>
            nameTag.partyRoles.some(
                (partyRole) =>
                    normalizePartyRole(partyRole as PartyRole) ===
                    peopleRolesFilter.filterValue
            )
        );
    }, [
        extractedParties,
        archivedPartyRoles,
        peopleRolesFilter.filterValue,
        t,
    ]);

    const hasVisibleRoleData = (role: string, tags: NameTag[]): boolean => {
        if (role === ALL_ROLES) return tags.length > 0;

        return tags.some((tag) =>
            tag.partyRoles.some(
                (partyRole) =>
                    normalizePartyRole(partyRole as PartyRole) === role
            )
        );
    };

    const isArchivedToggleDisabled = archivedNameTags.length === 0;

    useEffect(() => {
        if (isArchivedToggleDisabled && showArchived) {
            setShowArchived(false);
        }
    }, [isArchivedToggleDisabled, showArchived]);

    // Prevent empty role state when toggling archived parties
    useEffect(() => {
        if (peopleRolesFilter.filterValue === ALL_ROLES) {
            return;
        }
        const visibleTags = showArchived
            ? archivedPartyRoles
            : extractedPartyRoles;

        const combinedTags = combineNameAndRoles(
            extractedParties,
            visibleTags,
            t
        );
        const currentRole = peopleRolesFilter.filterValue;
        if (
            currentRole !== ALL_ROLES &&
            !hasVisibleRoleData(currentRole, combinedTags)
        ) {
            setPeopleRolesFilter({
                filterValue: ALL_ROLES,
                filterTagList: convertToTagText(ALL_ROLES, t),
            });
        }
    }, [
        showArchived,
        archivedPartyRoles,
        extractedPartyRoles,
        extractedParties,
        peopleRolesFilter.filterValue,
        setPeopleRolesFilter,
        t,
    ]);

    // Fetch data for agents if there are any
    const agentParties = useMemo(
        () =>
            nameTags?.filter((party) => {
                return (
                    party.partyRoles.includes(
                        PartyRole.PRIMARYSERVICINGAGENT
                    ) ||
                    party.partyRoles.includes(PartyRole.PRIMARYWRITINGAGENT) ||
                    // the spec that is coming back to use has a misspelled "writinggagent" so can't use the type here until that's updated
                    party.partyRoles.includes('ADDITIONALWRITINGAGENT')
                );
            }),
        [nameTags]
    );
    const clientCode = policy?.carrierId;
    const { data: agentData, isLoading: isAgentDataLoading } = useQueries({
        queries: agentParties?.map((party) => ({
            queryKey: [
                'agentData',
                party.agentExternalId,
                clientCode,
                policy?.policyNumber,
                policy?.product?.planCode,
                party?.partyId,
            ],
            queryFn: () =>
                getPomAgentData({
                    id: party?.agentExternalId,
                    policyNumber: policy?.policyNumber,
                    planCode: policy?.product?.planCode,
                }),
            enabled:
                !!party.agentExternalId &&
                !!policy.policyNumber &&
                !!policy.product?.planCode,
            select: (data) =>
                data
                    ? // FIXME: party is NameTag but PomAgentParty expects Parties
                      new PomAgentParty(data as PomAgentData, party as Parties) // [PomAgentParty] => { ...party: data }
                    : undefined,
        })),

        combine: (results) => ({
            data: results.map((result) => result.data),
            isLoading: results.some((result) => result.isLoading),
        }),
    });

    const handleRadioClick = (value: string) => {
        const selectedTagList = convertToTagText(value, t);

        setPeopleRolesFilter({
            filterValue: value,
            filterTagList: selectedTagList,
        });
    };

    // If `ALL` is selected, do not filter
    let filteredNameTags =
        peopleRolesFilter.filterValue === ALL_ROLES
            ? nameTags
            : sortByAndThenBy<NameTag>(
                  nameTags.filter((nameTag) =>
                      nameTag.partyRoles.some(
                          (partyRole) =>
                              normalizePartyRole(partyRole as PartyRole) ===
                              peopleRolesFilter.filterValue
                      )
                  ),
                  'fullName',
                  'fullName'
              );
    // Add agent data if there is any
    if (agentData && agentData.length > 0) {
        filteredNameTags = filteredNameTags.map((tag) => {
            const isAgent = agentData.some((agent) => {
                return agent?.party?.agentExternalId === tag.agentExternalId;
            });
            if (isAgent) {
                const agent = agentData.find(
                    (agent) =>
                        agent?.party?.agentExternalId === tag.agentExternalId
                );
                // NOTE: this is complicated but POM and Zahara partyId for the same agent DO NOT match - MR
                // Preserve SOR-derived tags/partyRoles so Servicing vs Writing Agent labels are correct
                return {
                    ...agent?.party,
                    partyId: tag.partyId,
                    tags: tag.tags,
                    partyRoles: tag.partyRoles,
                } as NameTag;
            } else {
                return tag;
            }
        });
    }

    const isAgentSelected = peopleRolesFilter.filterValue === 'agent';
    const isBeneficiarySelected =
        peopleRolesFilter.filterValue === 'beneficiary';
    // Since policy can be undefined, we need to check if policy exists before accessing policyId
    const peopleCardData: PeopleCardData = {
        router,
        selectedTagList: peopleRolesFilter.filterTagList,
        planCode: policy?.product?.planCode,
        policyNumber: policy?.policyNumber,
        accessibilityText: t('people.card.allocationText'),
        accessibilityClickText: t('ariaLabel.openPeople'),
        isBeneficiarySelected: isBeneficiarySelected,
        isAgentSelected: isAgentSelected,
    };

    const commissionAllocationData = agentDataByType(
        filteredNameTags,
        AgentType.PRIMARY
    );

    const nonCommissionAgents = filteredNameTags.filter(
        (nameTag) =>
            !commissionAllocationData.some(
                (commAgent) => commAgent.partyId === nameTag.partyId
            )
    );

    const otherSectionData = agentDataByType(
        nonCommissionAgents,
        AgentType.AGENT
    );

    const handleToggle = () => {
        setShowArchived((prevState) => !prevState);
    };

    return (
        <ChipEnterContext.Provider value={{ chipEntered, setChipEntered }}>
            <PeoplePageHeaderContainer onClick={clearPeopleRolesFilter} />
            <hr className={styles.sectionDivider} />
            {filteredNameTags.length > 0 && (
                <div className={styles.peoplePage}>
                    <div className={styles.filterPanel}>
                        <div className={`field-label ${styles.filterLabel}`}>
                            {t('people.filterByRole')}
                        </div>
                        <RadioGroup.Root
                            className={styles.filterChips}
                            value={peopleRolesFilter.filterValue ?? ALL_ROLES}
                            aria-label="chips"
                            onValueChange={handleRadioClick}
                        >
                            <RadioGroup.Item className="chip" value={ALL_ROLES}>
                                {ALL_ROLES}
                            </RadioGroup.Item>
                            {countedRoles.map((role) => (
                                <RadioGroup.Item
                                    className="chip"
                                    key={`people-chip-${role.value}`}
                                    value={role.value}
                                >
                                    {toTitleCase(role.text ?? '')} (
                                    {role.quantity})
                                </RadioGroup.Item>
                            ))}
                        </RadioGroup.Root>
                    </div>

                    <div className={styles.contentColumn}>
                        <div className={styles.actionBar}>
                            <ManagePeople policy={policyDetails} />
                            {featureFlags?.[
                                FEATURE_FLAGS.REVISED_HISTORY_TABLE
                            ] && (
                                <>
                                    <Toggle
                                        labelId="show-archived-toggle"
                                        text={
                                            t(
                                                'allFields.showArchivedParties'
                                            ) ?? ''
                                        }
                                        onClick={handleToggle}
                                        pressed={showArchived}
                                        data-testid="show-archived-toggle"
                                        isDisabled={isArchivedToggleDisabled}
                                    />
                                </>
                            )}
                        </div>
                        <div className={styles.peopleInfo}>
                            {isBeneficiarySelected && (
                                <div className={styles.fullWidth}>
                                    <BeneficiaryCardContainer
                                        title={t('people.primaryAllocation')}
                                        peopleCardData={peopleCardData}
                                        filteredData={beneficiaryDataByType(
                                            filteredNameTags,
                                            BeneficiaryType.PRIMARY
                                        )}
                                        classNames="mb-10"
                                        openAllocationSideSheet={openSidesheet}
                                        type={BeneficiaryType.PRIMARY}
                                        showManageBeneficiary={true}
                                        enableManageBeneficiary={
                                            isEligibleBeneficiary &&
                                            beneChangeEnabled
                                        }
                                    />
                                    {beneficiaryDataByType(
                                        filteredNameTags,
                                        BeneficiaryType.CONTINGENT
                                    )?.length ? (
                                        <BeneficiaryCardContainer
                                            title={t(
                                                'people.contingentAllocation'
                                            )}
                                            peopleCardData={peopleCardData}
                                            filteredData={beneficiaryDataByType(
                                                filteredNameTags,
                                                BeneficiaryType.CONTINGENT
                                            )}
                                            type={BeneficiaryType.CONTINGENT}
                                            openAllocationSideSheet={
                                                openSidesheet
                                            }
                                            showManageBeneficiary={false}
                                            enableManageBeneficiary={
                                                isEligibleBeneficiary
                                            }
                                        />
                                    ) : null}
                                </div>
                            )}

                            {isAgentSelected && (
                                <div className={styles.fullWidth}>
                                    {commissionAllocationData?.length ? (
                                        <PeopleCardContainer
                                            peopleCardData={peopleCardData}
                                            filteredData={
                                                commissionAllocationData
                                            }
                                            type={AgentType.PRIMARY}
                                            isAgentDataLoading={
                                                isAgentDataLoading
                                            }
                                        />
                                    ) : null}

                                    {otherSectionData?.length ? (
                                        <PeopleCardContainer
                                            peopleCardData={peopleCardData}
                                            filteredData={otherSectionData}
                                            type={AgentType.AGENT}
                                            isAgentDataLoading={
                                                isAgentDataLoading
                                            }
                                        />
                                    ) : null}
                                </div>
                            )}

                            {!isBeneficiarySelected && !isAgentSelected && (
                                <PeopleCardContainer
                                    peopleCardData={peopleCardData}
                                    filteredData={filteredNameTags}
                                    isAgentDataLoading={isAgentDataLoading}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </ChipEnterContext.Provider>
    );
};

export default PeopleSubPage;
