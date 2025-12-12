import * as Progress from '@radix-ui/react-progress';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { CSSProperties, useRef } from 'react';

import Badge from '@deps/components/badge/badge';
import { BadgeVariant } from '@deps/components/badge/badge.helpers';
import FieldData, {
    FieldDataProps,
} from '@deps/components/fields/field-data/field-data';
import Label, {
    LabelVariant,
    TooltipProps,
} from '@deps/components/label/label';
import Tooltip, { PopoverPlacement } from '@deps/components/tooltip/tooltip';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { filterTruthyProps } from '@deps/helpers/data-transform.helpers';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { PremiumCardTest } from '@deps/jest/constants/test-id-constants';
import { ReactComponent as RewardsIcon } from '@deps/styles/elements/icons/navigation/rewards-portal.svg';

type BadgeProps = {
    label?: string;
    tooltipBody?: string;
    variant?: BadgeVariant;
} & TooltipProps;

type LineItemProps = {
    label: string;
} & TooltipProps;

type TitleProps = {
    showIcon?: boolean;
    title: string;
    badgeProps: BadgeProps;
};

type ValueTableProps = {
    amountProps: LineItemProps;
    basisProps: LineItemProps;
    totalProps: LineItemProps;
    total?: number;
    compareValue?: number;
};

export interface PolicyTestCardProps extends ValueTableProps {
    title: string;
    classNames?: string;
    showIcon?: boolean;
    badgeProps?: BadgeProps;
    progressRootClasses?: string;
    progressIndicatorClasses?: string;
    progressTotalColor?: string;
    progressIndicatorColor?: string;
    progressBorderColor?: string;
    fieldDataValues?: (FieldDataProps & {
        value: string;
    })[];
}

const Title = ({
    badgeProps: {
        label = '',
        tooltipBody = '',
        variant = BadgeVariant.Success,
    },
    showIcon,
    title,
    ...tooltipProps
}: TitleProps) => (
    <div className="title flex flex-row gap-4">
        {showIcon && <RewardsIcon width={24} height={24} />}
        <Label
            variant={LabelVariant.LabelLg}
            sentenceCase={false}
            label={title}
            {...tooltipProps}
        />
        {!!label.length && (
            <div className="flex">
                <Tooltip
                    placement={PopoverPlacement.TopRight}
                    body={tooltipBody}
                >
                    <Badge label={label} variant={variant} rounded />
                </Tooltip>
            </div>
        )}
    </div>
);

const ValueTable = ({
    amountProps = {
        label: 'dots.remaining.label',
        tooltipTitle: 'dots.remaining.tooltip.title',
        tooltipBody: 'dots.remaining.tooltip.body',
    },
    basisProps = {
        label: 'dots.basis.label',
        tooltipTitle: 'dots.basis.tooltip.title',
        tooltipBody: 'dots.basis.tooltip.body',
    },
    totalProps = {
        label: 'dots.total.label',
        tooltipTitle: 'dots.total.tooltip.title',
        tooltipBody: 'dots.total.tooltip.body',
    },
    total,
    compareValue,
}: ValueTableProps) => (
    <div className="flex basis-3/4 flex-col gap-4 self-stretch lg:mr-8 lg:self-center">
        <div className="flex grow flex-row flex-wrap items-baseline gap-2 align-baseline">
            <div className="flex flex-row items-baseline gap-2 align-middle">
                {Number(total) > Number(compareValue) && (
                    <hr className="h-4 w-4 flex-none self-center rounded border-none bg-[--color-progress-total]" />
                )}
                <Label
                    variant={LabelVariant.FieldLabel}
                    sentenceCase={false}
                    {...amountProps}
                />
            </div>
            <div className="flex grow items-baseline gap-2">
                <hr className="grow border-0 border-b-2 border-dotted border-gray-300" />
                <Typography variant={TypographyVariant.Value}>
                    {numberFormatify(
                        Math.abs(Number(total) - Number(compareValue))
                    )}
                </Typography>
            </div>
        </div>
        <div className="flex grow flex-row flex-wrap items-baseline gap-2 align-baseline">
            <div className="flex flex-row items-center gap-2 align-middle">
                <hr className="h-4 w-4 flex-none self-center rounded border-none bg-[--color-progress-indicator]" />
                <Label variant={LabelVariant.FieldLabel} {...basisProps} />
            </div>
            <div className="flex grow items-baseline gap-2">
                <hr className="grow border-0 border-b-2 border-dotted border-gray-300" />
                <Typography variant={TypographyVariant.BodySm}>
                    {numberFormatify(compareValue)}
                </Typography>
            </div>
        </div>
        <div className="flex flex-row flex-wrap items-baseline gap-2 align-baseline">
            <Label variant={LabelVariant.FieldLabel} {...totalProps} />
            <div className="flex grow items-baseline gap-2">
                <hr className="grow border-0 border-b-2 border-dotted border-gray-300" />
                <Typography variant={TypographyVariant.BodySm}>
                    {numberFormatify(total)}
                </Typography>
            </div>
        </div>
    </div>
);

const FieldDataValues = ({
    fieldDataValues,
}: Pick<PolicyTestCardProps, 'fieldDataValues'>) => (
    <>
        {fieldDataValues && (
            <div className="my-4 self-stretch lg:my-0">
                <hr className="hidden h-full w-full bg-gray-100 lg:block lg:w-0.5" />
            </div>
        )}
        <div className="field-data-values flex basis-1/4 flex-col gap-4 lg:ml-8">
            {fieldDataValues &&
                fieldDataValues.map(({ value, label, ...props }) => (
                    <FieldData
                        key={label}
                        label={label}
                        {...filterTruthyProps(props)}
                    >
                        {value}
                    </FieldData>
                ))}
        </div>
    </>
);

const PolicyTestCard = ({
    title,
    compareValue,
    total,
    classNames,
    showIcon = false,
    amountProps,
    basisProps,
    totalProps,
    badgeProps = {
        variant: BadgeVariant.Success,
    },
    fieldDataValues,
    progressIndicatorClasses,
    progressRootClasses,
    progressTotalColor,
    progressIndicatorColor,
    progressBorderColor,
}: PolicyTestCardProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    const classes = clsx(
        'progress-bar flex max-w-5xl flex-col gap-6 rounded border-2 border-gray-100 p-4 md:p-6 lg:p-8',
        classNames
    );

    const progressValue = Math.round(
        (Number(compareValue) / Number(total)) * 100
    );
    return (
        <article
            className={classes}
            data-testid={PremiumCardTest.PREMIUMCARD}
            style={
                filterTruthyProps({
                    '--color-progress-total': progressTotalColor,
                    '--color-progress-indicator': progressIndicatorColor,
                    '--color-progress-border': progressBorderColor,
                }) as CSSProperties
            }
        >
            <Title title={title} showIcon={showIcon} badgeProps={badgeProps} />
            <Progress.Root
                aria-hidden
                className={clsx(
                    'h-3 w-full overflow-hidden rounded-full bg-[--color-progress-total]',
                    progressRootClasses
                )}
                max={total}
                value={Math.min(Number(total), Number(compareValue))}
                aria-label={`${t(`ariaLabel.progressIndicator`)} ${title}`}
            >
                <Progress.Indicator
                    className={clsx(
                        Number(compareValue) > 0
                            ? 'min-w-[10px] border-[--color-progress-border]'
                            : 'border-[--color-progress-total]',
                        'h-full border-r-2  bg-[--color-progress-indicator]',
                        progressIndicatorClasses
                    )}
                    style={{ width: `${progressValue}%` }}
                />
            </Progress.Root>
            <div
                className="labels flex flex-col items-start lg:flex-row lg:items-center"
                data-testid={PremiumCardTest.FOOTER}
                ref={ref}
            >
                <ValueTable
                    compareValue={compareValue}
                    amountProps={amountProps}
                    basisProps={basisProps}
                    totalProps={totalProps}
                    total={total}
                />
                <FieldDataValues fieldDataValues={fieldDataValues} />
            </div>
        </article>
    );
};

export default PolicyTestCard;
