import * as RadioGroup from '@radix-ui/react-radio-group';
import { PartyRole, Policy } from '@zinnia/api-types/types/sor';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';

import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import PeoplePageHeaderContainer from '@deps/containers/page-header/people-page-header';
import BeneficiaryCardContainer from '@deps/containers/people-card-container/beneficiary-card-container';
import PeopleCardContainer from '@deps/containers/people-card-container/people-card-container';
import {
    BeneficiaryType,
    PeopleCardData,
} from '@deps/containers/people-card-container/people-card-container.types';
import {
    beneficiaryDataByType,
    combineNameAndRoles,
    convertToTagText,
    countPartyRoles,
    NameTag,
    normalizePartyRole,
} from '@deps/containers/people-sub-page/people-sub-page.helpers';
import { ChipEnterContext } from '@deps/contexts/ChipEnterContext';
import { isEndDated } from '@deps/helpers/date.helpers';
import { sortByAndThenBy } from '@deps/helpers/sort.helpers';
import useBreadcrumb from '@deps/hooks/useBreadcrumbs';

import { useBeneChange } from '../../bene-change/bene-change-provider';

interface ReRegPeopleViewProps {
    policy: Policy;
    onManageBeneficiaryClick?: () => void;
    isEligibleBeneficiary?: boolean;
}

export const ReRegPeopleView = ({
    policy,
    onManageBeneficiaryClick,
    isEligibleBeneficiary,
}: ReRegPeopleViewProps) => {
    const { t } = useTranslation();
    const { peopleSelection, setPeopleSelection, setSOR } = useBeneChange();
    const { breadcrumb } = useBreadcrumb();
    const router = useRouter();

    const [chipEntered, setChipEntered] = useState(false);
    const extractedParties = useMemo(() => policy?.parties || [], [policy]);
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

    useEffect(() => {
        if (nameTags?.length > 0) {
            setPeopleSelection((prevState) => ({
                ...prevState,
                cardActionData: {
                    ...prevState.cardActionData,
                    filteredData: nameTags,
                    isBeneficiarySelected: false,
                },
            }));
        }
    }, [nameTags, setPeopleSelection, t]);

    const handleChipClick = (chipValue: string) => {
        const tagList = convertToTagText(chipValue, t);
        setPeopleSelection((prevState) => ({
            ...prevState,
            selectedChip: chipValue,
            selectedTagList: tagList,
        }));

        if (chipValue === 'All') {
            setPeopleSelection((prevState) => ({
                ...prevState,
                cardActionData: {
                    filteredData: nameTags,
                    isAgentSelected: false,
                    isBeneficiarySelected: false,
                },
            }));
        } else {
            const filteredNameTags = sortByAndThenBy<NameTag>(
                nameTags.filter((nameTag) =>
                    nameTag.partyRoles.some(
                        (partyRole) =>
                            normalizePartyRole(partyRole as PartyRole) ===
                            chipValue
                    )
                ),
                'fullName',
                'fullName'
            );
            setPeopleSelection((prevState) => ({
                ...prevState,
                cardActionData: {
                    filteredData: filteredNameTags,
                    isAgentSelected: chipValue === 'agent',
                    isBeneficiarySelected: chipValue === 'beneficiary',
                },
            }));
        }
    };

    const peopleCardData: PeopleCardData = {
        router,
        selectedTagList: peopleSelection.selectedTagList,
        planCode: policy?.product?.planCode,
        policyNumber: policy?.policyNumber,
        accessibilityText: t('people.card.allocationText'),
        accessibilityClickText: t('ariaLabel.openPeople'),
        isBeneficiarySelected:
            peopleSelection.cardActionData.isBeneficiarySelected,
    };

    const filteredRoles = countedRoles.filter(
        (role) => role.value === 'beneficiary'
    );

    return (
        <ChipEnterContext.Provider value={{ chipEntered, setChipEntered }}>
            <div className="grow rounded bg-white shadow-elevation-light-04">
                <PeoplePageHeaderContainer
                    hideControls={true}
                    breadcrumbText={breadcrumb?.text}
                    breadcrumbUrl={breadcrumb?.url}
                />
                <hr className="h-0.5 border-none bg-gray-100" />
                {filteredRoles.length === 0 && (
                    <div className="w-full mb-5">
                        <div className="mb-5 mt-7 bg-gray-50 p-3 text-center">
                            <NavElement
                                onClick={onManageBeneficiaryClick}
                                type={NavElementType.Button}
                                size={NavElementSize.Small}
                                tabIndex={0}
                                className="flex h-[21px] items-center self-center whitespace-nowrap leading-[21px] [&_svg]:mr-1"
                            >
                                {t('quickActions.people.manageBeneficiaries')}
                            </NavElement>
                        </div>
                    </div>
                )}
                {peopleSelection.cardActionData.filteredData.length > 0 && (
                    <div className="mx-4 my-6 flex flex-col gap-6 md:mx-6 md:mb-0 lg:mx-8 lg:flex-row">
                        <div className="lg:max-w-[308px]">
                            <div className="field-label mb-2 text-gray-900">
                                {t('people.filterByRole')}
                            </div>
                            <RadioGroup.Root
                                className="mb-10 flex flex-wrap gap-2"
                                value={peopleSelection.selectedChip ?? 'All'}
                                aria-label="chips"
                                onValueChange={handleChipClick}
                            >
                                <RadioGroup.Item className="chip" value="All">
                                    All
                                </RadioGroup.Item>
                                {filteredRoles.map((role) => (
                                    <RadioGroup.Item
                                        className="chip"
                                        key={`people-chip-${role.value}`}
                                        value={role.value}
                                    >
                                        {role.text} ({role.quantity})
                                    </RadioGroup.Item>
                                ))}
                            </RadioGroup.Root>
                        </div>
                        {peopleSelection.cardActionData
                            .isBeneficiarySelected && (
                            <div className="w-full mb-5">
                                <div className="mb-5 mt-7 flex bg-gray-50 p-3">
                                    <NavElement
                                        onClick={onManageBeneficiaryClick}
                                        type={NavElementType.Button}
                                        size={NavElementSize.Small}
                                        tabIndex={0}
                                        className="flex h-[21px] items-center self-center whitespace-nowrap leading-[21px] [&_svg]:mr-1"
                                        disabled={!isEligibleBeneficiary}
                                    >
                                        {t(
                                            'quickActions.people.manageBeneficiaries'
                                        )}
                                    </NavElement>
                                </div>
                                <BeneficiaryCardContainer
                                    title={t('people.primaryAllocation')}
                                    peopleCardData={peopleCardData}
                                    filteredData={beneficiaryDataByType(
                                        peopleSelection.cardActionData
                                            .filteredData,
                                        BeneficiaryType.PRIMARY
                                    )}
                                    classNames="mb-10"
                                    type={BeneficiaryType.PRIMARY}
                                    isRereg={true}
                                />
                                {beneficiaryDataByType(
                                    peopleSelection.cardActionData.filteredData,
                                    BeneficiaryType.CONTINGENT
                                )?.length ? (
                                    <BeneficiaryCardContainer
                                        title={t('people.contingentAllocation')}
                                        peopleCardData={peopleCardData}
                                        filteredData={beneficiaryDataByType(
                                            peopleSelection.cardActionData
                                                .filteredData,
                                            BeneficiaryType.CONTINGENT
                                        )}
                                        type={BeneficiaryType.CONTINGENT}
                                        isRereg={true}
                                    />
                                ) : null}
                            </div>
                        )}

                        {!peopleSelection.cardActionData
                            .isBeneficiarySelected &&
                            !peopleSelection.cardActionData.isAgentSelected && (
                                <div className="mb-10 w-full">
                                    <PeopleCardContainer
                                        peopleCardData={peopleCardData}
                                        filteredData={
                                            peopleSelection.cardActionData
                                                .filteredData
                                        }
                                        isRereg={true}
                                    />
                                </div>
                            )}
                    </div>
                )}
            </div>
        </ChipEnterContext.Provider>
    );
};
