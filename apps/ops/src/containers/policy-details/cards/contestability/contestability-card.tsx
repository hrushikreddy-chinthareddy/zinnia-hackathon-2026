import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';

import BadgeWithTooltip from '@deps/components/badge/badge-with-tooltip/badge-with-tooltip';
import { BadgeVariant } from '@deps/components/badge/badge.helper';
import { PopoverPlacement } from '@deps/components/popover/popover';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { convertKebabedDateString } from '@deps/helpers/string.helper';
import {
    DEFAULT_DATE_FORMAT,
    DEFAULT_EXTENDED_DATE_FORMAT,
    DEFAULT_EXTENDED_DAY_DATE_FORMAT,
    DEFAULT_EXTENDED_MONTH_DATE_FORMAT,
} from '@deps/types/constants';

export interface ContestabilityCardProps {
    policyDetails: PolicyDetails;
}

import ContestabilityContent from './contestability-content';

export const BASE_KEY = 'policy.detailCards.contestability.';

const ContestabilityCard: React.FC<ContestabilityCardProps> = ({ policyDetails }) => {
    const { t } = useTranslation();
    const endDate = convertKebabedDateString(policyDetails.contestabilityEndDate);
    const startDate = convertKebabedDateString(policyDetails.contestabilityStartDate);
    const inactive =
        dayjs() >=
        dayjs(endDate, [
            DEFAULT_DATE_FORMAT,
            DEFAULT_EXTENDED_DAY_DATE_FORMAT,
            DEFAULT_EXTENDED_MONTH_DATE_FORMAT,
            DEFAULT_EXTENDED_DATE_FORMAT,
        ]);
    const tooltip = inactive ? t(`${BASE_KEY}inactiveBadgeTooltip`) : t(`${BASE_KEY}activeBadgeTooltip`);
    const label = inactive ? t(`${BASE_KEY}inactiveBadgeLabel`) : t(`${BASE_KEY}activeBadgeLabel`);

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100">
            <div className="flex">
                <Typography variant={TypographyVariant.H2}>{t(`${BASE_KEY}contestability`)}</Typography>
                {endDate && (
                    <BadgeWithTooltip
                        className="ml-4 mt-0.5"
                        label={label}
                        tooltip={tooltip}
                        tooltipPlacement={PopoverPlacement.TopLeft}
                        variant={BadgeVariant.Info}
                    />
                )}
            </div>
            <ContestabilityContent contestabilityStartDate={startDate} contestabilityEndDate={endDate} />
        </CardContainer>
    );
};

export default ContestabilityCard;
