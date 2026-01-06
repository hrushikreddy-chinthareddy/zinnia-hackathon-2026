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

import styles from './policy-test-card.module.css';

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
    <div className={clsx('title', styles.title)}>
        {showIcon && <RewardsIcon width={24} height={24} />}
        <Label
            variant={LabelVariant.LabelLg}
            sentenceCase={false}
            label={title}
            {...tooltipProps}
        />
        {!!label.length && (
            <div className={styles.badgeContainer}>
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
    <div className={styles.valueTableContainer}>
        <div className={styles.valueRow}>
            <div className={styles.labelContainer}>
                {Number(total) > Number(compareValue) && (
                    <hr
                        className={clsx(
                            styles.colorIndicator,
                            styles.colorIndicatorTotal
                        )}
                        role="presentation"
                    />
                )}
                <Label
                    variant={LabelVariant.FieldLabel}
                    sentenceCase={false}
                    {...amountProps}
                />
            </div>
            <div className={styles.valueContainer}>
                <hr className={styles.dottedLine} role="presentation" />
                <Typography variant={TypographyVariant.Value}>
                    {numberFormatify(
                        Math.abs(Number(total) - Number(compareValue))
                    )}
                </Typography>
            </div>
        </div>
        <div className={styles.valueRow}>
            <div className={styles.labelContainer}>
                <hr
                    className={clsx(
                        styles.colorIndicator,
                        styles.colorIndicatorBase
                    )}
                    role="presentation"
                />
                <Label variant={LabelVariant.FieldLabel} {...basisProps} />
            </div>
            <div className={styles.valueContainer}>
                <hr className={styles.dottedLine} role="presentation" />
                <Typography variant={TypographyVariant.BodySm}>
                    {numberFormatify(compareValue)}
                </Typography>
            </div>
        </div>
        <div className={styles.valueRow}>
            <Label variant={LabelVariant.FieldLabel} {...totalProps} />
            <div className={styles.valueContainer}>
                <hr className={styles.dottedLine} role="presentation" />
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
            <div className={styles.dividerContainer}>
                <hr className={styles.divider} role="presentation" />
            </div>
        )}
        <div
            className={clsx('field-data-values', styles.fieldDataValuesWrapper)}
        >
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

    const classes = clsx('progress-bar', styles.progressBar, classNames);

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
                className={clsx(styles.progressRoot, progressRootClasses)}
                max={total}
                value={Math.min(Number(total), Number(compareValue))}
                aria-label={`${t(`ariaLabel.progressIndicator`)} ${title}`}
            >
                <Progress.Indicator
                    className={clsx(
                        styles.progressIndicator,
                        Number(compareValue) > 0
                            ? styles.progressIndicatorActive
                            : styles.progressIndicatorInactive,
                        progressIndicatorClasses
                    )}
                    style={{ width: `${progressValue}%` }}
                />
            </Progress.Root>
            <div
                className={clsx('labels', styles.labelsContainer)}
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
