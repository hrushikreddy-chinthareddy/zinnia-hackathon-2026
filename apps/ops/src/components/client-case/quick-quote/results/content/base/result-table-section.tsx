import { Tooltip } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { ReactNode } from 'react';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';

import styles from '../content.module.css';

type QuickQuoteResultTableSectionProps = {
    title: string;
    subtitle?: string;
    hint?: string;
    children: ReactNode;
    headingClass?: string;
};

export const QuickQuoteResultTableSection = ({
    title,
    subtitle,
    hint,
    children,
    headingClass,
}: QuickQuoteResultTableSectionProps) => {
    return (
        <div className={styles.contentTableSection} role="rowgroup">
            <div
                className={clsx(
                    styles.contentTableSectionHeading,
                    headingClass
                )}
            >
                <Typography variant={TypographyVariant.LabelLg}>
                    {title}
                </Typography>
                {subtitle && (
                    <Typography variant={TypographyVariant.BodySm}>
                        {subtitle}
                    </Typography>
                )}
                {hint && (
                    <Tooltip
                        trigger={
                            <CircleInfoIcon
                                height={'16px'}
                                width={'16px'}
                                className="tooltip-primary"
                            />
                        }
                        triggerClassName="w-fit"
                        replaceElement
                    >
                        {hint}
                    </Tooltip>
                )}
            </div>
            {children}
        </div>
    );
};
