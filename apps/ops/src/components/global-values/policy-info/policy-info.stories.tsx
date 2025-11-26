import { Meta } from '@storybook/react';
import { t } from 'i18next';

import {
    BadgeVariant,
    getBadgeStatus,
    getBadgeStatusVariant,
} from '@deps/components/badge/badge.helpers';
import { getPolicyBadgeStatusTooltip } from '@deps/components/global-values/global-values-bar/global-values-helpers';
import { formatDate } from '@deps/helpers/string.helpers';
import { PolicyStatus, ProductType } from '@zinnia/api-types/types/sor';

import PolicyInfo, {
    PolicyBadgeStatus as PolicyBadgeStatusComponent,
    PolicyNumber as PolicyNumberComponent,
    PolicyProductMarketingName as PolicyProductMarketingNameComponent,
    PolicyProductType as PolicyProductTypeComponent,
} from './policy-info';

export default {
    title: 'Components/GlobalValues/PolicyInfo',
    component: PolicyInfo,
    decorators: [
        (Story) => (
            <div className="bg-white">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof PolicyInfo>;

export const PolicyNumber = () => (
    <PolicyNumberComponent policyNumber="AU22029654" />
);

export const PolicyBadgeStatus = () => (
    <PolicyBadgeStatusComponent
        status={PolicyStatus.ACTIVE}
        tooltip={'This will display policy badge status\ntool tip helper copy'}
        variant={BadgeVariant.Positive}
    />
);

export const PolicyProductType = () => (
    <PolicyProductTypeComponent productType={ProductType.UNIVERSALLIFE} />
);

export const PolicyProductMarketingName = () => (
    <PolicyProductMarketingNameComponent marketingName="Everly Life" />
);

export const PolicyNotIssuedInformation = () => {
    const policyBadgeStatus = PolicyStatus.NOTISSUED;
    const date = '2023/04/20';

    return (
        <PolicyInfo
            carrierId="ELIC"
            marketingName="Everly Life"
            productType={ProductType.UNIVERSALLIFE}
            policyNumber="AU08675309"
            status={t(getBadgeStatus(policyBadgeStatus))}
            tooltip={
                t(getPolicyBadgeStatusTooltip(policyBadgeStatus), {
                    tooltipDate: formatDate(date),
                }) ?? ''
            }
            variant={getBadgeStatusVariant(policyBadgeStatus)}
        />
    );
};

export const PolicyPendingIssuedInformation = () => {
    const policyBadgeStatus = PolicyStatus.PENDINGISSUED;
    const date = '2023/05/12';

    return (
        <PolicyInfo
            marketingName="Everly Life"
            productType={ProductType.UNIVERSALLIFE}
            policyNumber="AU31090210"
            status={t(getBadgeStatus(policyBadgeStatus))}
            tooltip={
                t(getPolicyBadgeStatusTooltip(policyBadgeStatus), {
                    tooltipDate: formatDate(date),
                }) ?? ''
            }
            variant={getBadgeStatusVariant(policyBadgeStatus)}
        />
    );
};

export const PolicyActiveInformation = () => {
    const policyBadgeStatus = PolicyStatus.ACTIVE;
    const date = '2023/03/17';

    return (
        <PolicyInfo
            marketingName="Everly Life"
            productType={ProductType.VARIABLEUNIVERSALLIFE}
            policyNumber="AU90432084"
            status={t(getBadgeStatus(policyBadgeStatus))}
            tooltip={
                t(getPolicyBadgeStatusTooltip(policyBadgeStatus), {
                    tooltipDate: formatDate(date),
                }) ?? ''
            }
            variant={getBadgeStatusVariant(policyBadgeStatus)}
        />
    );
};

export const PolicyPendingLapseInformation = () => {
    const policyBadgeStatus = PolicyStatus.PENDINGLAPSE;
    const date = '2023/05/05';
    const amount = '$19.99';

    return (
        <PolicyInfo
            marketingName="Everly Life"
            productType={ProductType.VARIABLEUNIVERSALLIFE}
            policyNumber="AU97307101"
            status={t(getBadgeStatus(policyBadgeStatus))}
            tooltip={
                t(getPolicyBadgeStatusTooltip(policyBadgeStatus), {
                    tooltipDate: formatDate(date),
                    tooltipAmount: amount,
                }) ?? ''
            }
            variant={getBadgeStatusVariant(policyBadgeStatus)}
        />
    );
};

export const PolicyLapseInformation = () => {
    const policyBadgeStatus = PolicyStatus.LAPSE;
    const date = '2023/11/11';

    return (
        <PolicyInfo
            marketingName="Everly Life"
            productType={ProductType.VARIABLEUNIVERSALLIFE}
            policyNumber="AU12345678"
            status={t(getBadgeStatus(policyBadgeStatus))}
            tooltip={
                t(getPolicyBadgeStatusTooltip(policyBadgeStatus), {
                    tooltipDate: formatDate(date),
                }) ?? ''
            }
            variant={getBadgeStatusVariant(policyBadgeStatus)}
        />
    );
};

export const PolicyNoMarketingName = () => {
    const policyBadgeStatus = PolicyStatus.ACTIVE;
    const date = '2023/11/11';

    return (
        <PolicyInfo
            marketingName=""
            productType={ProductType.VARIABLEUNIVERSALLIFE}
            policyNumber="AU12345678"
            status={t(getBadgeStatus(policyBadgeStatus))}
            tooltip={
                t(getPolicyBadgeStatusTooltip(policyBadgeStatus), {
                    tooltipDate: formatDate(date),
                }) ?? ''
            }
            variant={getBadgeStatusVariant(policyBadgeStatus)}
        />
    );
};
