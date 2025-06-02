import { AccountValues, CostBasis, PolicyFeature, PolicyStatus } from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';

import { PageHeader } from '@deps/components/page-header/page-header';
import Popover, { PopoverPlacement } from '@deps/components/popover/popover';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';
import { DEFAULT_ERROR_STRING, DEFAULT_EXTENDED_DATE_FORMAT } from '@deps/types/constants';

interface PremiumsPageHeaderContainerProps {
    breadcrumbText?: string;
    breadcrumbUrl?: string;
    costBasis?: CostBasis;
    currency?: string;
    policyValues?: AccountValues;
    policyStatus?: PolicyStatus;
    pendingLapse?: PolicyFeature;
}

interface GracePeriodValuesProps {
    values?: PolicyFeature;
}

const GracePeriodValues = ({ values }: GracePeriodValuesProps) => {
    const { t } = useTranslation();

    return (
        <>
            <div className="my-0 w-fit xs:mr-4 md:mr-0">
                <div className="flex items-center gap-2">
                    <span className="label relative font-primary text-sm font-bold leading-4.5">
                        {t('pageHeader.premiums.descriptionList.label.gracePeriodBeforeLapse')}
                    </span>

                    <Popover
                        popoverClassName="font-secondary text-md font-normal leading-[22px]"
                        title={t('pageHeader.premiums.descriptionList.label.gracePeriodBeforeLapse') as string}
                        body={t('pageHeader.premiums.popOver.gracePeriodBeforeLapse') as string}
                        placement={PopoverPlacement.TopRight}
                    >
                        <span className="relative bottom-[0.5px] block">
                            <CircleInfoIcon height={13} width={13} className="text-primary" />
                        </span>
                    </Popover>
                </div>

                <div className="mb-0 ml-0 h-[25px] break-words font-primary text-[22px] font-medium leading-[26px]">
                    {dayjs(values?.startDate).format(DEFAULT_EXTENDED_DATE_FORMAT)} -{' '}
                    {dayjs(values?.endDate).format(DEFAULT_EXTENDED_DATE_FORMAT)}
                </div>
            </div>

            <div className="my-0 w-fit xs:mr-4 md:mr-0">
                <div className="flex items-center gap-2">
                    <span className="label relative font-primary text-sm font-bold leading-4.5">
                        {t('pageHeader.premiums.descriptionList.label.gracePeriodMinPayment')}
                    </span>

                    <Popover
                        popoverClassName="font-secondary text-md font-normal leading-[22px]"
                        title={t('pageHeader.premiums.descriptionList.label.gracePeriodMinPayment') as string}
                        body={t('pageHeader.premiums.popOver.gracePeriodMinPayment') as string}
                        placement={PopoverPlacement.TopRight}
                    >
                        <span className="relative bottom-[0.5px] block">
                            <CircleInfoIcon height={13} width={13} className="text-primary" />
                        </span>
                    </Popover>
                </div>

                <div className="mb-0 ml-0 h-[25px] break-words font-primary text-[22px] font-medium leading-[26px]">
                    {numberFormatify(values?.totalMinimumRequiredAmount || DEFAULT_ERROR_STRING)}
                </div>
            </div>
        </>
    );
};

const PremiumsPageHeaderContainer = ({
    breadcrumbText,
    breadcrumbUrl,
    costBasis,
    currency,
    policyValues,
    policyStatus,
    pendingLapse,
}: PremiumsPageHeaderContainerProps) => {
    const { t } = useTranslation();
    const currencyFormat: Intl.NumberFormatOptions = { style: 'currency', currency };

    const belowHeaderTextChildren = (
        <div className="sm:flex-no-wrap mt-4 flex xs:w-[400px] xs:flex-wrap xs:gap-4 md:w-full md:gap-8">
            {policyStatus === PolicyStatus.PENDINGLAPSE && <GracePeriodValues values={pendingLapse} />}
            <div className="my-0 w-fit xs:mr-4 md:mr-0">
                <div className="flex items-center gap-2">
                    <span className="label relative font-primary text-sm font-bold leading-4.5">
                        {t('pageHeader.premiums.descriptionList.label.ytdPremium')}
                    </span>
                </div>

                <div className="mb-0 ml-0 h-[25px] break-words font-primary text-[22px] font-medium leading-[26px]">
                    {!isNullEmptyOrUndefined(policyValues?.totalYearToDatePremiumAmount)
                        ? numberFormatify(policyValues?.totalYearToDatePremiumAmount, currencyFormat)
                        : '-'}
                </div>
            </div>
            <div className="my-0 w-fit xs:mr-4 xs:w-[187px] md:mr-0 md:w-auto">
                <div className="flex items-center gap-2">
                    <span className={` label relative font-primary text-sm font-bold leading-4.5`}>
                        {t('pageHeader.premiums.descriptionList.label.allTimePremium')}
                    </span>
                </div>

                <div className="mb-0 ml-0 h-[25px] font-primary text-[22px] font-medium leading-[26px]">
                    {!isNullEmptyOrUndefined(policyValues?.cumulativePremiumSinceIssue)
                        ? numberFormatify(policyValues?.cumulativePremiumSinceIssue as number, currencyFormat)
                        : '-'}
                </div>
            </div>
            <div className="my-0 w-fit xs:mr-4 md:mr-0">
                <div className="flex items-center gap-2">
                    <span className="label relative font-primary text-sm font-bold leading-4.5">
                        {t('pageHeader.premiums.descriptionList.label.costBasis')}
                    </span>

                    <Popover
                        popoverClassName="font-secondary text-md font-normal leading-[22px]"
                        title={t('pageHeader.premiums.descriptionList.label.costBasis') as string}
                        body={t('pageHeader.premiums.popOver.costBasis') as string}
                        placement={PopoverPlacement.TopRight}
                    >
                        <span className="relative bottom-[0.5px] block">
                            <CircleInfoIcon height={13} width={13} className="text-primary" />
                        </span>
                    </Popover>
                </div>

                <div className="mb-0 ml-0 h-[25px] break-words font-primary text-[22px] font-medium leading-[26px]">
                    {numberFormatify(costBasis?.costBasis, currencyFormat)}
                </div>
            </div>
        </div>
    );

    return (
        <PageHeader
            headerText={t('pageHeader.premiums.headerText') || ''}
            breadcrumbText={breadcrumbText}
            breadcrumbUrl={breadcrumbUrl}
            belowHeaderTextChildren={belowHeaderTextChildren}
        />
    );
};

export default PremiumsPageHeaderContainer;
