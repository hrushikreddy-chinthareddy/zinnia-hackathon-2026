import { Meta } from '@storybook/react';
import { t } from 'i18next';

import { getBadgeStatus, getBadgeStatusVariant } from '@deps/components/badge/badge.helper';
import { FindKeyValueSearch } from '@deps/components/global-values/find-key-value-search/find-key-value-search';
import GlobalValuesBar from '@deps/components/global-values/global-values-bar/global-values-bar';
import { getPolicyBadgeStatusTooltip } from '@deps/components/global-values/global-values-bar/global-values-helper';
import { WithdrawalInfo } from '@deps/components/global-values/withdrawal-info/withdrawal-info';
import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import { formatDate } from '@deps/helpers/string.helper';
import { PolicyStatus, ProductType } from '@deps/models/policy/sor-policy';
import { generateParty } from '@deps/utils/mock/mockParty';

export default {
    title: 'Components/GlobalValues/GlobalValuesBar',
    container: GlobalValuesBar,
    decorators: [
        Story => (
            <div className="h-screen bg-white">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof GlobalValuesBar>;

const amount = '$30.00';
const date = '2023/04/20';
const marketingName = 'Everly Life';
const owner = generateParty('123456');
const planCode = 'SBFIXUL1';
const policyBadgeStatus = PolicyStatus.ACTIVE;
const policyNumber = 'AU22029654';

export const GlobalValuesBarDefault = () => {
    return (
        <GlobalValuesBar
            marketingName={marketingName}
            owner={owner}
            planCode={planCode}
            policyNumber={policyNumber}
            productType={ProductType.UNIVERSALLIFE}
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

export const GlobalValuesBarFindKeyValueSearch = () => {
    return (
        <GlobalValuesBar
            marketingName={marketingName}
            owner={owner}
            planCode={planCode}
            policyNumber={policyNumber}
            productType={ProductType.UNIVERSALLIFE}
            status={t(getBadgeStatus(policyBadgeStatus))}
            tooltip={
                t(getPolicyBadgeStatusTooltip(policyBadgeStatus), {
                    tooltipDate: formatDate(date),
                }) ?? ''
            }
            variant={getBadgeStatusVariant(policyBadgeStatus)}
        >
            <FindKeyValueSearch planCode={planCode} policyNumber={policyNumber} />
        </GlobalValuesBar>
    );
};

export const GlobalValuesBarWithdrawal = () => {
    return (
        <GlobalValuesBar
            marketingName={marketingName}
            owner={owner}
            planCode={planCode}
            policyNumber={policyNumber}
            productType={ProductType.UNIVERSALLIFE}
            status={t(getBadgeStatus(policyBadgeStatus))}
            tooltip={
                t(getPolicyBadgeStatusTooltip(policyBadgeStatus), {
                    tooltipDate: formatDate(date),
                }) ?? ''
            }
            variant={getBadgeStatusVariant(policyBadgeStatus)}
        >
            <div className="ml-8 mr-8 flex w-[2px] border-l-2 border-l-gray-200" />
            <WithdrawalInfo amount={100} />
            <div className="flex flex-shrink-0 lg:flex-grow lg:justify-end">
                <NavElement
                    tabIndex={0}
                    size={NavElementSize.Small}
                    type={NavElementType.Button}
                    aria-label={t('ariaLabel.viewTransactionFees') as string}
                    onClick={() => {
                        // do nothing
                    }}
                    onKeyDown={() => {
                        // do nothing
                    }}
                >
                    {t('withdrawals.viewTransactionFees')}
                </NavElement>
            </div>
        </GlobalValuesBar>
    );
};
