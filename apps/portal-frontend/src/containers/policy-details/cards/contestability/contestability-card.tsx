import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';

import BadgeWithTooltip from '@deps/components/badge/badge-with-tooltip/badge-with-tooltip';
import { BadgeVariant } from '@deps/components/badge/badge.helper';
import { PopoverPlacement } from '@deps/components/popover/popover';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { ContestabilityCardData } from '@deps/containers/coverage-sub-page/coverage-sub-page.helper';
import { ReactComponent as CalendarIcon } from '@deps/styles/elements/icons/content/calendar.svg';
import {
    DEFAULT_DATE_FORMAT,
    DEFAULT_EXTENDED_DATE_FORMAT,
    DEFAULT_EXTENDED_DAY_DATE_FORMAT,
    DEFAULT_EXTENDED_MONTH_DATE_FORMAT,
} from '@deps/types/constants';

import ContestabilityContent from './contestability-content';

export interface ContestabilityCardProps {
    contestabilityCardData: ContestabilityCardData;
}

export const BASE_KEY = 'policy.detailCards.contestability.';

const ContestabilityCard: React.FC<ContestabilityCardProps> = ({ contestabilityCardData }) => {
    const { t } = useTranslation();
    const { endDate } = contestabilityCardData;
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
                <CalendarIcon className="mr-2 mt-1 flex-none text-primary" height={'24px'} role="presentation" width={'24px'} />
                <div>
                    <Typography variant={TypographyVariant.H2}>{t(`${BASE_KEY}contestability`)}</Typography>
                </div>
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
            <ContestabilityContent contestabilityCardData={contestabilityCardData} />
        </CardContainer>
    );
};

export default ContestabilityCard;
