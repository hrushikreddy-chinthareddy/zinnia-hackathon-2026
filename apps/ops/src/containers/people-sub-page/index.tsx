import * as RadioGroup from '@radix-ui/react-radio-group';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import GlobalPolicyInfo from '@deps/components/global-values/policy-info/policy-info';
import { PopoverPlacement } from '@deps/components/popover/popover';
import BeneficiaryCardContainer from '@deps/containers/people-card-container/beneficiary-card-container';
import PeopleCardContainer from '@deps/containers/people-card-container/people-card-container';
import { BeneficiaryType, PeopleCardData } from '@deps/containers/people-card-container/people-card-container.types';
import { ChipEnterContext } from '@deps/contexts/ChipEnterContext';
import { PeopleRolesFilterContext } from '@deps/contexts/PeopleRolesFilter';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { policyDataToGlobalValues } from '@deps/helpers/global-values';
import AgentParty from '@deps/helpers/policy-sor/AgentParty';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { sortByAndThenBy } from '@deps/helpers/sort.helper';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helper';
import useBreadcrumb from '@deps/hooks/useBreadcrumbs';
import { PartyRole } from '@deps/models/policy/sor-policy';
import { getAgentData } from '@deps/queries/api/agents';

import {
    NameTag,
    beneficiaryDataByType,
    combineNameAndRoles,
    convertToTagText,
    countPartyRoles,
    normalizePartyRole,
} from './people-sub-page.helpers';
import PeoplePageHeaderContainer from '../page-header/people-page-header';
import SideSheetAllocations from '../side-sheet-allocations/side-sheet-allocations';

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

export const PeopleSubPage: React.FC = () => {
    const { policy, refreshPolicy } = useContext(PolicyData);
    const { t } = useTranslation();
    // BPB - ToDo: Use this everywhere here.
    const policyDetails = useMemo(() => new PolicyDetails(policy), [policy]);
    const router = useRouter();
    const extractedParties = useMemo(() => policy?.parties || [], [policy]);
    // if there's an enddate, that role is no longer valid
    const extractedPartyRoles = useMemo(
        () => policy?.partyRoles?.filter(role => !role.endDate || dayjs().isBefore(role.endDate)) || [],
        [policy]
    );
    const countedRoles = useMemo(() => countPartyRoles(extractedPartyRoles, t), [extractedPartyRoles, t]);
    const nameTags = useMemo(
        () => combineNameAndRoles(extractedParties, extractedPartyRoles, t),
        [extractedParties, extractedPartyRoles, t]
    );

    const [peopleState, setPeopleState] = useState<PeopleState>(initialPeopleState);
    const { breadcrumb } = useBreadcrumb();
    const { peopleRolesFilter, setPeopleRolesFilter, clearPeopleRolesFilter } = useContext(PeopleRolesFilterContext);
    const [chipEntered, setChipEntered] = useState(false);
    const sideSheet = useSideSheetContext();

    const globalValuesData = useMemo(() => policyDataToGlobalValues(policyDetails, t), [policyDetails, t]);
    const openSidesheet = () => {
        sideSheet.changeSideSheetContent(
            <GlobalPolicyInfo tooltipPlacements={PopoverPlacement.BottomLeft} {...globalValuesData} />,
            <SideSheetAllocations handleClose={() => sideSheet.handleOpen(false)} policy={policy} refreshPolicy={refreshPolicy} />
        );
        sideSheet.handleOpen(true);
    };

    // Fetch data for agents if there are any
    const [agentData, setAgentData] = useState<AgentParty[]>();
    const agentParties = useMemo(
        () =>
            nameTags?.filter(party => {
                return (
                    party.partyRoles.includes(PartyRole.PRIMARYSERVICINGAGENT) || party.partyRoles.includes(PartyRole.PRIMARYWRITINGAGENT)
                );
            }),
        [nameTags]
    );
    const clientCode = policy?.carrierId;

    const fetchAgentData = useCallback(async () => {
        if (agentParties && agentParties.length > 0) {
            const agentData = [];
            for (const agent of agentParties) {
                try {
                    const result = await getAgentData({
                        clientCode,
                        id: agent.agentExternalId,
                        policyNumber: policy.policyNumber,
                        planCode: policy.product?.planCode,
                    });
                    agentData.push(new AgentParty(result, agent));
                } catch (error) {
                    console.error('Unable to fetch agent details', error);
                }
            }
            setAgentData(agentData);
        }
    }, [agentParties, clientCode, policy]);

    useEffect(() => {
        fetchAgentData();
    }, [fetchAgentData]);

    useEffect(() => {
        const cardTags = combineNameAndRoles(extractedParties, extractedPartyRoles, t);
        let filteredCardTags = cardTags;
        if (agentData && agentData.length > 0) {
            filteredCardTags = cardTags.map(tag => {
                const isAgent = agentData.some(agent => agent.partyId === tag.partyId);
                if (isAgent) {
                    const agent = agentData.find(agent => agent.partyId === tag.partyId);
                    return agent?.party as NameTag;
                } else {
                    return tag;
                }
            });
        }

        if (filteredCardTags?.length > 0) {
            setPeopleState(prevState => ({
                ...prevState,
                cardActionData: {
                    ...prevState.cardActionData,
                    filteredData: filteredCardTags,
                },
            }));
        }
    }, [agentData, extractedParties, extractedPartyRoles, t]);

    useEffect(() => {
        // Set selected chip, tag list, and card action data on initial load
        if (peopleRolesFilter.filterValue !== 'All') {
            setPeopleState(prevState => ({
                ...prevState,
                selectedChip: peopleRolesFilter.filterValue,
                selectedTagList: peopleRolesFilter.filterTagList,
                cardActionData: {
                    filteredData: sortByAndThenBy<NameTag>(
                        nameTags.filter(nameTag =>
                            nameTag.partyRoles.some(
                                partyRole => normalizePartyRole(partyRole as PartyRole) === peopleRolesFilter.filterValue
                            )
                        ),
                        'fullName',
                        'fullName'
                    ),
                    isAgentSelected: peopleRolesFilter.filterValue === 'agent',
                    isBeneficiarySelected: peopleRolesFilter.filterValue === 'beneficiary',
                },
            }));
        }
    }, [nameTags, peopleRolesFilter]);

    // Handler(s)
    const handleChipClick = (chipValue: string) => {
        const tagList = convertToTagText(chipValue, t);
        setPeopleState(prevState => ({
            ...prevState,
            selectedChip: chipValue,
            selectedTagList: tagList,
        }));

        if (chipValue === 'All') {
            setPeopleState(prevState => ({
                ...prevState,
                cardActionData: {
                    filteredData: nameTags,
                    isAgentSelected: false,
                    isBeneficiarySelected: false,
                },
            }));
            setPeopleRolesFilter({ ...peopleRolesFilter, filterValue: chipValue, filterTagList: tagList });
        } else {
            const filteredNameTags = sortByAndThenBy<NameTag>(
                nameTags.filter(nameTag => nameTag.partyRoles.some(partyRole => normalizePartyRole(partyRole as PartyRole) === chipValue)),
                'fullName',
                'fullName'
            );
            setPeopleState(prevState => ({
                ...prevState,
                cardActionData: {
                    filteredData: filteredNameTags,
                    isAgentSelected: chipValue === 'agent',
                    isBeneficiarySelected: chipValue === 'beneficiary',
                },
            }));
            setPeopleRolesFilter({
                ...peopleRolesFilter,
                filterValue: chipValue,
                filterTagList: tagList,
            });
        }
    };

    // Since policy can be undefined, we need to check if policy exists before accessing policyId
    const peopleCardData: PeopleCardData = {
        router,
        selectedTagList: peopleState.selectedTagList,
        planCode: policy?.product?.planCode,
        policyNumber: policy?.policyNumber,
        accessibilityText: t('people.card.allocationText'),
        accessibilityClickText: t('ariaLabel.openPeople'),
        isBeneficiarySelected: peopleState.cardActionData.isBeneficiarySelected,
    };

    return (
        <ChipEnterContext.Provider value={{ chipEntered, setChipEntered }}>
            <div className="grow rounded bg-white shadow-elevation-light-04">
                <PeoplePageHeaderContainer
                    breadcrumbText={breadcrumb?.text}
                    breadcrumbUrl={breadcrumb?.url}
                    onClick={() => clearPeopleRolesFilter()}
                />
                <hr className="h-0.5 border-none bg-gray-100" />
                {peopleState.cardActionData.filteredData.length > 0 && (
                    <div className="mx-4 my-6 flex flex-col gap-6 md:mx-6 lg:mx-8 lg:flex-row">
                        <div className="lg:max-w-[308px]">
                            <div className="field-label mb-2 text-gray-900">{t('people.filterByRole')}</div>
                            <RadioGroup.Root
                                className="flex flex-wrap gap-2"
                                value={peopleState.selectedChip ?? 'All'}
                                aria-label="chips"
                                onValueChange={handleChipClick}
                            >
                                <RadioGroup.Item className="chip" value="All">
                                    All
                                </RadioGroup.Item>
                                {countedRoles.map(role => (
                                    <RadioGroup.Item className="chip" key={`people-chip-${role.value}`} value={role.value}>
                                        {role.text} ({role.quantity})
                                    </RadioGroup.Item>
                                ))}
                            </RadioGroup.Root>
                        </div>

                        {peopleState.cardActionData.isBeneficiarySelected && (
                            <div className="w-full">
                                <BeneficiaryCardContainer
                                    title={t('people.primaryAllocation')}
                                    peopleCardData={peopleCardData}
                                    filteredData={beneficiaryDataByType(peopleState.cardActionData.filteredData, BeneficiaryType.PRIMARY)}
                                    classNames="mb-10"
                                    openAllocationSideSheet={openSidesheet}
                                    type={BeneficiaryType.PRIMARY}
                                />
                                {beneficiaryDataByType(peopleState.cardActionData.filteredData, BeneficiaryType.CONTIGENT)?.length ? (
                                    <BeneficiaryCardContainer
                                        title={t('people.contingentAllocation')}
                                        peopleCardData={peopleCardData}
                                        filteredData={beneficiaryDataByType(
                                            peopleState.cardActionData.filteredData,
                                            BeneficiaryType.CONTIGENT
                                        )}
                                        type={BeneficiaryType.CONTIGENT}
                                        openAllocationSideSheet={openSidesheet}
                                    />
                                ) : null}
                            </div>
                        )}

                        {peopleState.cardActionData.isAgentSelected && (
                            <div className="w-full">
                                <BeneficiaryCardContainer
                                    title={t('people.primaryAllocation')}
                                    peopleCardData={peopleCardData}
                                    filteredData={beneficiaryDataByType(peopleState.cardActionData.filteredData, BeneficiaryType.PRIMARY)}
                                    classNames="mb-10"
                                    type={BeneficiaryType.PRIMARY}
                                />

                                <BeneficiaryCardContainer
                                    title={'Other'}
                                    peopleCardData={peopleCardData}
                                    filteredData={peopleState.cardActionData.filteredData.filter(fd =>
                                        isNullEmptyOrUndefined(fd.beneficiaryPercentage || '')
                                    )}
                                    showAllocationBar={false}
                                />
                            </div>
                        )}

                        {!peopleState.cardActionData.isBeneficiarySelected && !peopleState.cardActionData.isAgentSelected && (
                            <PeopleCardContainer peopleCardData={peopleCardData} filteredData={peopleState.cardActionData.filteredData} />
                        )}
                    </div>
                )}
            </div>
        </ChipEnterContext.Provider>
    );
};

export default PeopleSubPage;
