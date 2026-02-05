import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import Label, { LabelVariant } from '@deps/components/label/label';
import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import SideSheetAllocations from '@deps/components/side-sheet/side-sheet-allocations/side-sheet-allocations';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import SideSheetPeopleHeader from '@deps/containers/people-data-cards/side-sheet-people-header/side-sheet-people-header';
import { convertToChipText } from '@deps/containers/people-sub-page/people-sub-page.helpers';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { isEndDated } from '@deps/helpers/date.helpers';
import {
    numberFormatify,
    percentFormatify,
} from '@deps/helpers/numbers.helpers';
import { safeString } from '@deps/helpers/string.helpers';
import {
    NonFinancialTransactionActions,
    NonFinancialTransactions,
} from '@deps/queries/api/bpm-non-financial';
import { ReactComponent as EditIcon } from '@deps/styles/elements/icons/icons_outlined/edit-alt.svg';
import { PartyType, PolicyPartyRoles } from '@zinnia/api-types/types/sor';

export interface AllocationCardProps {
    allocation?: number;
    deathBenefit: number | null;
    editable?: boolean;
    relationshipToInsured?: string;
    selectedPartyId?: string;
    selectedPartyType?: string;
    selectedPolicyPartyRoles?: PolicyPartyRoles[];
}

export interface AllocationPercentageProps {
    allocation?: number;
}

export interface AllocationAmountProps {
    allocation?: number;
    deathBenefit?: number;
}

export interface RelationshipToInsuredProps {
    relationshipToInsured?: string;
}

const getEstimatedAmount = (
    allocation: number | undefined,
    deathBenefit: number | undefined
) => {
    if (allocation && deathBenefit) {
        return (allocation / 100) * deathBenefit;
    } else {
        return null;
    }
};

export const AllocationPercentage = ({
    allocation,
}: AllocationPercentageProps) => {
    const { t } = useTranslation();

    return (
        <div className="mr-8 flex flex-col items-start ">
            <Label
                variant={LabelVariant.FieldLabel}
                label={t('people.card.allocation.label')}
            />
            <Typography variant={TypographyVariant.Value}>
                {percentFormatify(allocation, { isInteger: true })}
            </Typography>
        </div>
    );
};

const AllocationAmount = ({
    allocation,
    deathBenefit,
}: AllocationAmountProps) => {
    const { t } = useTranslation();
    const estimatedAmount = getEstimatedAmount(allocation, deathBenefit);
    return (
        <div className="flex flex-col items-start">
            <div className="flex">
                <Label
                    variant={LabelVariant.FieldLabel}
                    className="mr-2"
                    label={t('people.card.allocation.amount')}
                />
            </div>
            <Typography variant={TypographyVariant.Value}>
                {numberFormatify(estimatedAmount)}
            </Typography>
        </div>
    );
};

const RelationshipToInsuredInfo = ({
    relationshipToInsured,
}: RelationshipToInsuredProps) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col items-start">
            <Label
                variant={LabelVariant.FieldLabel}
                label={t('people.card.allocation.relationshipToInsured')}
            />
            <Typography variant={TypographyVariant.BodySm}>
                {safeString(relationshipToInsured)}
            </Typography>
        </div>
    );
};

const AllocationCard = ({
    allocation,
    deathBenefit,
    editable = false,
    relationshipToInsured,
    selectedPartyId,
    selectedPartyType,
    selectedPolicyPartyRoles,
}: AllocationCardProps) => {
    const { t } = useTranslation();
    const { policy, refreshPolicy } = useContext(PolicyData);
    const sideSheet = useSideSheetContext();
    const openSidesheet = () => {
        sideSheet.changeSideSheetContent(
            <SideSheetPeopleHeader
                action={NonFinancialTransactionActions.Edit}
                transaction={NonFinancialTransactions.Allocations}
            />,
            <SideSheetAllocations
                policy={policy}
                refreshPolicy={refreshPolicy}
                focusedPartyId={selectedPartyId}
                handleClose={() => sideSheet.handleOpen(false)}
            />
        );
        sideSheet.handleOpen(true);
    };

    const getPartyRoleText = (partyRole: string) => {
        return convertToChipText(partyRole, t);
    };

    const activePolicyPartyRoles = selectedPolicyPartyRoles?.filter(
        (role) => !isEndDated(role.endDate)
    );

    let estimatedValue;
    const isIndividual = selectedPartyType === PartyType.INDIVIDUAL;

    // Estimated amount is currently out of scope which relies on the death benefit amount, this affects breaking point requirements
    if (deathBenefit) {
        estimatedValue = (
            <div className="flex flex-wrap gap-x-4 gap-y-2 font-primary md:max-w-full lg:pl-8">
                <div className="flex flex-nowrap">
                    <AllocationPercentage allocation={allocation} />
                    <AllocationAmount
                        allocation={allocation}
                        deathBenefit={deathBenefit}
                    />
                </div>

                {isIndividual && (
                    <>
                        <hr className="m-0 h-0 border-0 xs:basis-full md:basis-0 " />
                        <RelationshipToInsuredInfo
                            relationshipToInsured={relationshipToInsured}
                        />
                    </>
                )}
            </div>
        );
    } else {
        if (activePolicyPartyRoles?.length) {
            estimatedValue = (
                <>
                    <div className="flex">
                        <Label
                            variant={LabelVariant.FieldLabel}
                            label={t('people.card.allocation.label')}
                        />
                    </div>
                    <div className="flex flex-row">
                        {activePolicyPartyRoles?.map((role) => (
                            <div className="flex flex-col font-primary mr-8">
                                <Typography variant={TypographyVariant.Value}>
                                    {percentFormatify(role.partyPercentage, {
                                        isInteger: true,
                                    })}
                                </Typography>
                                <Typography
                                    variant={TypographyVariant.BodySm}
                                    className="text-gray-300"
                                >
                                    {getPartRoleText(role.partyRole as string)}
                                </Typography>
                                {isIndividual && (
                                    <RelationshipToInsuredInfo
                                        relationshipToInsured={
                                            role.relationshipToInsured
                                        }
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </>
            );
        } else {
            estimatedValue = (
                <div className="flex font-primary lg:pl-8">
                    <AllocationPercentage allocation={allocation} />
                    {isIndividual && (
                        <RelationshipToInsuredInfo
                            relationshipToInsured={relationshipToInsured}
                        />
                    )}
                </div>
            );
        }
    }

    return (
        <CardContainer
            classNames={'flex w-full flex-col items-start text-gray-900'}
        >
            <div className="flex w-full flex-col">
                <div className="mb-4 flex flex-row items-center">
                    <Typography variant={TypographyVariant.H2} className="mr-5">
                        {t('people.card.allocation.label')}
                    </Typography>
                    {editable && (
                        <NavElement
                            type={NavElementType.Button}
                            size={NavElementSize.Small}
                            tabIndex={0}
                            className="flex h-4 items-center [&_svg]:mr-1"
                            onClick={openSidesheet}
                            startIcon={<EditIcon height={16} width={16} />}
                        >
                            {t('people.card.allocation.edit')}
                        </NavElement>
                    )}
                </div>
                {estimatedValue}
            </div>
        </CardContainer>
    );
};

export default AllocationCard;
