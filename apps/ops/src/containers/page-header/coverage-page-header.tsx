import { useTranslation } from 'next-i18next';

import { PageHeader } from '@deps/components/page-header/page-header';
import Popover, { PopoverPlacement } from '@deps/components/popover/popover';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { toTitleCase } from '@deps/helpers/string.helpers';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

interface CoveragePageHeaderContainerProps {
    breadcrumbText?: string;
    breadcrumbUrl?: string;
    policyDetails?: PolicyDetails;
}

interface CoverageHeaderItemProps {
    title: string;
    body: string;
    value: string;
}
const CoverageHeaderItem = ({ title, body, value }: CoverageHeaderItemProps) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'pageHeader.coverage',
    });

    return (
        <div className="my-0 w-fit xs:mr-4 md:mr-0">
            <div className="flex items-center gap-2">
                <label aria-label={title} htmlFor={title} className="label relative font-primary text-sm font-bold leading-4.5">
                    {title}
                </label>
                <Popover
                    popoverClassName="font-secondary text-md font-normal leading-[22px]"
                    title={title}
                    body={body}
                    placement={PopoverPlacement.TopRight}
                >
                    <span className="relative bottom-[0.5px] block">
                        <CircleInfoIcon
                            aria-label={`${t('ariaLabel.popover')} ${title}`}
                            role="button"
                            id={title}
                            height="16px"
                            width="16px"
                            className="text-primary"
                        />
                    </span>
                </Popover>
            </div>
            <div className="mb-0 ml-0 h-[25px] break-words font-primary text-[22px] font-medium leading-[26px]">{value}</div>
        </div>
    );
};

const CoveragePageHeaderContainer = ({ breadcrumbText, breadcrumbUrl, policyDetails }: CoveragePageHeaderContainerProps) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'pageHeader.coverage',
    });
    const currency = policyDetails?.currency;
    const currencyFormat: Intl.NumberFormatOptions = { style: 'currency', currency };
    const coveragePageHeaderItems = {
        grossDeathBenefit: !(policyDetails?.cumulativeGrossDeathBenefitAmount == null)
            ? numberFormatify(policyDetails?.cumulativeGrossDeathBenefitAmount, currencyFormat)
            : DEFAULT_ERROR_STRING,
        netDeathBenefit: !(policyDetails?.netDeathBenefitAmount == null)
            ? numberFormatify(policyDetails?.netDeathBenefitAmount, currencyFormat)
            : DEFAULT_ERROR_STRING,
        deathBenefitOption: toTitleCase(policyDetails?.deathBenefitOption ?? DEFAULT_ERROR_STRING),
    };

    const belowHeaderTextChildren = (
        <div className="mt-4 flex xs:w-[328px] xs:flex-wrap xs:gap-4 md:w-full md:flex-nowrap md:gap-8">
            {Object.entries(coveragePageHeaderItems).map(([key, value]) => (
                <CoverageHeaderItem
                    key={key}
                    value={value}
                    title={t(`descriptionList.label.${key}`) as string}
                    body={t(`popOver.${key}`)}
                />
            ))}
        </div>
    );

    return (
        <div className="content-divider flex items-center rounded-t bg-white">
            <PageHeader
                headerText={t('headerText') as string}
                breadcrumbText={breadcrumbText}
                breadcrumbUrl={breadcrumbUrl}
                belowHeaderTextChildren={belowHeaderTextChildren}
            />
        </div>
    );
};

export default CoveragePageHeaderContainer;
