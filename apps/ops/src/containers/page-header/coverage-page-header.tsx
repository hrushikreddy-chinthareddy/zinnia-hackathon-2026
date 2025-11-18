import { useTranslation } from 'next-i18next';

import { PageHeader } from '@deps/components/page-header/page-header';
import Popover, { PopoverPlacement } from '@deps/components/popover/popover';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { toTitleCase } from '@deps/helpers/string.helpers';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

interface CoveragePageHeaderContainerProps {
    policyDetails?: PolicyDetails;
}

interface CoverageHeaderItemProps {
    title: string;
    body: string;
    value: string;
}
const CoverageHeaderItem = ({
    title,
    body,
    value,
}: CoverageHeaderItemProps) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'pageHeader.coverage',
    });

    return (
        <div>
            <div className="flex items-center gap-2">
                <Typography
                    variant={TypographyVariant.FieldLabel}
                    htmlFor={title}
                >
                    {title}
                </Typography>
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
                            className="tooltip-primary"
                        />
                    </span>
                </Popover>
            </div>
            <Typography variant={TypographyVariant.Value}>{value}</Typography>
        </div>
    );
};

const CoveragePageHeaderContainer = ({
    policyDetails,
}: CoveragePageHeaderContainerProps) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'pageHeader.coverage',
    });
    const currency = policyDetails?.currency;
    const currencyFormat: Intl.NumberFormatOptions = {
        style: 'currency',
        currency,
    };
    const coveragePageHeaderItems = {
        grossDeathBenefit: !(
            policyDetails?.cumulativeGrossDeathBenefitAmount == null
        )
            ? numberFormatify(
                  policyDetails?.cumulativeGrossDeathBenefitAmount,
                  currencyFormat
              )
            : DEFAULT_ERROR_STRING,
        netDeathBenefit: !(policyDetails?.netDeathBenefitAmount == null)
            ? numberFormatify(
                  policyDetails?.netDeathBenefitAmount,
                  currencyFormat
              )
            : DEFAULT_ERROR_STRING,
        deathBenefitOption: toTitleCase(
            policyDetails?.deathBenefitOption ?? DEFAULT_ERROR_STRING
        ),
    };

    const belowHeaderTextChildren = (
        <div className="mt-4 flex flex-wrap gap-8">
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
                belowHeaderTextChildren={belowHeaderTextChildren}
            />
        </div>
    );
};

export default CoveragePageHeaderContainer;
