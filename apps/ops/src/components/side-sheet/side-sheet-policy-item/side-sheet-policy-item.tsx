import { Policy, PolicyStatus, ProductType } from '@zinnia/api-types/types/sor';
import { ValueGetterParams } from 'ag-grid-community';
import { TFunction, useTranslation } from 'next-i18next';

import {
    getBadgeStatus,
    getBadgeStatusVariant,
} from '@deps/components/badge/badge.helpers';
import CardColumns, {
    CardColumnsVariant,
} from '@deps/components/card/card-columns/card-columns';
import DescriptionLists from '@deps/components/description-list/description-lists';
import { getPolicyBadgeStatusTooltip } from '@deps/components/global-values/global-values-bar/global-values-helpers';
import PolicyInfo from '@deps/components/global-values/policy-info/policy-info';
import DepTable from '@deps/components/table/table';
import { TranslationFiles } from '@deps/config/translations';
import { PolicyOwnerDto, toPolicyOwnerDto } from '@deps/data/policy-owner';
import {
    PolicySummaryColDto,
    getPolicySummaryColDefs,
    toPolicySummaryColDto,
} from '@deps/data/policy-summary';
import { fillColDefs } from '@deps/helpers/data-transform.helpers';
import { getTotalMinRequiredAmount } from '@deps/helpers/global-values';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { formatDate } from '@deps/helpers/string.helpers';
import { ReactComponent as CirclePlusIcon } from '@deps/styles/elements/icons/circles/circle-plus.svg';

export interface SideSheetPolicyItemProps {
    policy: Policy;
}

export const policyPartyColumns = [
    {
        field: 'Name',
        valueGetter: (params: ValueGetterParams) => params.data.fullName,
    },
    {
        field: 'Role',
        valueGetter: () => 'Owner',
    },
    {
        field: 'SSN',
        valueGetter: (params: ValueGetterParams) => params.data.ssn,
    },
];

function PolicyHeader(
    { t }: { t: TFunction },
    { policy }: SideSheetPolicyItemProps
) {
    // ToDo: BPB - move on up
    const totalMinRequiredAmount = getTotalMinRequiredAmount(
        new PolicyDetails(policy)
    );

    return (
        <div className="border-b-solid flex-start flex border-b-2 border-b-gray-100 pb-4 pt-6">
            <PolicyInfo
                carrierId={policy.carrierId}
                marketingName="Everly Life"
                productType={ProductType.UNIVERSALLIFE}
                policyNumber="AU22029654"
                status={t(getBadgeStatus(PolicyStatus.ACTIVE))}
                tooltip={
                    t(getPolicyBadgeStatusTooltip(PolicyStatus.ACTIVE), {
                        tooltipDate: formatDate('2023/04/20'),
                        tooltipAmount: numberFormatify(totalMinRequiredAmount),
                    }) ?? ''
                }
                variant={getBadgeStatusVariant(PolicyStatus.ACTIVE)}
            />
        </div>
    );
}

function PolicySummary({
    policySummaryLists,
    titles,
}: {
    policySummaryLists: JSX.Element;
    titles: string[];
}) {
    return (
        <div className="pt-6">
            <CardColumns
                items={[policySummaryLists]}
                titles={titles}
                variant={CardColumnsVariant.SIDE_SHEET}
            />
        </div>
    );
}

function PolicyPeople({
    policyOwnerDto,
}: {
    policyOwnerDto: PolicyOwnerDto[];
}) {
    return (
        <div className="pb-6 pt-12">
            <p className="leading-7.5 mb-4 font-primary text-xl font-medium text-gray-900">
                People
            </p>
            <DepTable
                cols={policyPartyColumns}
                rowData={policyOwnerDto}
                automaticHeight={true}
            />
        </div>
    );
}

function PolicyAction() {
    return (
        <div className="border-t-solid flex items-center justify-center gap-1.5 border-t-2 border-t-gray-100 px-[133.5px] py-4">
            <CirclePlusIcon
                width={24}
                height={24}
                className="shrink-0 text-secondary"
            />
            <p className="whitespace-nowrap font-primary text-base font-semibold leading-6 text-secondary">
                Add a contingent beneficiary
            </p>
        </div>
    );
}

export default function SideSheetPolicyItemForStoryBook({
    policy,
}: SideSheetPolicyItemProps) {
    const { t } = useTranslation([
        TranslationFiles.COMMON,
        TranslationFiles.COLDEFS,
    ]);

    const policySummaryDto = toPolicySummaryColDto(policy);
    const policySummaryInfo = fillColDefs<PolicySummaryColDto>(
        policySummaryDto,
        getPolicySummaryColDefs(t),
        t,
        'colDefs:policySummary'
    );
    const policySummaryLists = (
        <DescriptionLists
            data={policySummaryInfo}
            labelClassName="text-gray-900"
            valueClassName="text-gray-900"
            gap="2.5"
        />
    );

    const { parties } = policy;
    const policyOwnerDto =
        parties?.map((party) => toPolicyOwnerDto(party)) ||
        ([] as PolicyOwnerDto[]);

    const titles = [t('dashboard.search.results.policySummaryCard.header2')];

    return (
        <div className="rounded bg-white shadow-elevation-light-04">
            <div className="px-6">
                <PolicyHeader t={t} />
                <PolicySummary
                    policySummaryLists={policySummaryLists}
                    titles={titles}
                />
                <PolicyPeople policyOwnerDto={policyOwnerDto} />
            </div>
            <PolicyAction />
        </div>
    );
}
