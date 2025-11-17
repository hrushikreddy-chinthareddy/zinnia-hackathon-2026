import * as RadioGroup from '@radix-ui/react-radio-group';
import { useQueries } from '@tanstack/react-query';
import { toTitleCase } from '@xd/utils/dist';
import { PartyRole } from '@zinnia/api-types/types/sor';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useContext, useMemo, useState } from 'react';

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
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { isEndDated } from '@deps/helpers/date.helpers';
import { policyDataToGlobalValues } from '@deps/helpers/global-values';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import PomAgentParty from '@deps/helpers/policy-sor/PomAgentParty';
import { sortByAndThenBy } from '@deps/helpers/sort.helpers';
import { getPomAgentData } from '@deps/queries/api/agents';
import { PomAgentData } from '@deps/types/agents';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

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
import SideSheetAllocations from '../../components/side-sheet/side-sheet-allocations/side-sheet-allocations';
import PeoplePageHeaderContainer from '../page-header/people-page-header';

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

const initialPeopleState: PeopleState = {
    cardActionData: {
        filteredData: [],
        isAgentSelected: false,
        isBeneficiarySelected: false,
    },
    selectedChip: 'All',
    selectedTagList: ['All'],
};

export const PeopleSubPage: React.FC<{ isEligibleBeneficiary?: boolean }> = ({
    isEligibleBeneficiary,
}) => {
    const { policy, refreshPolicy } = useContext(PolicyData);

    const { t } = useTranslation();
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
    const countedRoles = useMemo(
        () => countPartyRoles(extractedPartyRoles, t),
        [extractedPartyRoles, t]
    );
    const nameTags = useMemo(
        () => combineNameAndRoles(extractedParties, extractedPartyRoles, t),
        [extractedParties, extractedPartyRoles, t]
    );

    const { featureFlags } = useOptimizely();

    const beneChangeEnabled =
        featureFlags[FEATURE_FLAGS.BENEFICIARY_CHANGE_TRANSACTION];

    const { peopleRolesFilter, setPeopleRolesFilter, clearPeopleRolesFilter } =
        useContext(PeopleRolesFilterContext);
    const [chipEntered, setChipEntered] = useState(false);
    const sideSheet = useSideSheetContext();
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
    const { data: agentData } = useQueries({
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
                    ? new PomAgentParty(data as PomAgentData, party) // [PomAgentParty] => { ...party: data }
                    : undefined,
        })),

        combine: (results) => {
            return {
                data: results.map((result) => result.data),
            };
        },
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
        peopleRolesFilter.filterValue === 'All'
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
                return { ...agent?.party, partyId: tag.partyId } as NameTag;
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

    return (
        <ChipEnterContext.Provider value={{ chipEntered, setChipEntered }}>
            <PeoplePageHeaderContainer onClick={clearPeopleRolesFilter} />
            <hr className="h-0.5 border-none bg-gray-200" />
            {filteredNameTags.length > 0 && (
                <div className="mx-4 my-6 flex flex-col gap-6 md:mx-6 lg:mx-8 lg:flex-row">
                    <div className="lg:max-w-[308px]">
                        <div className="field-label mb-2 text-gray-900">
                            {t('people.filterByRole')}
                        </div>
                        <RadioGroup.Root
                            className="flex flex-wrap gap-2"
                            value={peopleRolesFilter.filterValue ?? 'All'}
                            aria-label="chips"
                            onValueChange={handleRadioClick}
                        >
                            <RadioGroup.Item className="chip" value="All">
                                All
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

                    <div className="flex flex-col h-fit w-full mx-4 my-6 gap-6 md:mx-6 lg:mx-8">
                        <div className="flex w-full flex-row items-center gap-8 bg-gray-50 px-8 py-4 align-middle">
                            <ManagePeople policy={policyDetails} />
                        </div>
                        <div>
                            {isBeneficiarySelected && (
                                <div className="w-full">
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
                                <div className="w-full">
                                    {commissionAllocationData?.length ? (
                                        <BeneficiaryCardContainer
                                            title={t(
                                                'people.commissionAllocation'
                                            )}
                                            peopleCardData={peopleCardData}
                                            filteredData={
                                                commissionAllocationData
                                            }
                                            classNames="mb-10"
                                            type={AgentType.PRIMARY}
                                            tooltip={
                                                t(
                                                    'people.commissionAllocationTooltip'
                                                ) as string
                                            }
                                        />
                                    ) : null}

                                    {otherSectionData?.length ? (
                                        <BeneficiaryCardContainer
                                            title={t('people.other')}
                                            peopleCardData={peopleCardData}
                                            filteredData={otherSectionData}
                                            type={AgentType.AGENT}
                                            showAllocationBar={false}
                                            tooltip={
                                                t(
                                                    'people.otherTooltip'
                                                ) as string
                                            }
                                        />
                                    ) : null}
                                </div>
                            )}

                            {!isBeneficiarySelected && !isAgentSelected && (
                                <PeopleCardContainer
                                    peopleCardData={peopleCardData}
                                    filteredData={filteredNameTags}
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
