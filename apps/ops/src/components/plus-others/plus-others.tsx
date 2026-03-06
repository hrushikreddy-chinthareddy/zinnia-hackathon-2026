import { Tooltip, TooltipPlacement } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';

import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { TranslationFiles } from '@deps/config/translations';

import Typography, { TypographyVariant } from '../typography/typography';

export interface PlusOthersProps {
    className?: string;
    entities: { name: string; ssn: string }[];
    tooltipTitle: string;
}

const PlusOthers = ({
    className = '',
    entities,
    tooltipTitle,
}: PlusOthersProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);

    const body = (
        <div className="plus-others-container">
            {entities.map((entity) => (
                <div
                    key={`other-${entity.name}`}
                    className="nowrap flex flex-row gap-4"
                >
                    <div className="flex flex-col">
                        <Typography variant={TypographyVariant.FieldLabel}>
                            {tooltipTitle}
                        </Typography>
                        <Typography variant={TypographyVariant.BodySm}>
                            <PiiWrapper>{entity.name}</PiiWrapper>
                        </Typography>
                    </div>
                    <div className="flex flex-col">
                        <Typography variant={TypographyVariant.FieldLabel}>
                            {t('tooltip.ssn')}
                        </Typography>
                        <Typography variant={TypographyVariant.BodySm}>
                            <PiiWrapper>{entity.ssn}</PiiWrapper>
                        </Typography>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <Tooltip
            placement={TooltipPlacement.BottomRight}
            tooltipClassName="px-4 py-4 !w-auto"
            trigger={
                <div
                    className={clsx(
                        `ml-2 whitespace-nowrap font-primary text-md font-semibold text-secondary`,
                        className
                    )}
                >
                    <span data-testid="plus-number">+{entities.length}</span>
                    {` ${t('tooltip.other')}`}
                </div>
            }
            triggerClassName="!z-10 w-fit"
        >
            {body}
        </Tooltip>
    );
};

export default PlusOthers;
