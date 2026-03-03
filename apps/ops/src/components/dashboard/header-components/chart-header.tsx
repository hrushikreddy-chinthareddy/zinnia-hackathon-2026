import { Tooltip } from '@zinnia/bloom/components';
import { FC, ReactNode } from 'react';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';

interface ChartHeaderProps {
    title: string | ReactNode;
    subtitle: string | ReactNode;
    titleToolTip?: ReactNode;
    description?: string | ReactNode;
}

export const ChartHeader: FC<ChartHeaderProps> = ({
    title,
    subtitle,
    titleToolTip,
    description,
}) => {
    return (
        <div>
            <div className="flex items-center gap-2">
                <Typography
                    className="typography-desktop-headline-2-d"
                    variant={TypographyVariant.H2}
                >
                    {title}
                </Typography>
                {titleToolTip && (
                    <Tooltip
                        trigger={
                            <span tabIndex={0}>
                                <CircleInfoIcon
                                    height={'16px'}
                                    width={'16px'}
                                    className="tooltip-primary"
                                />
                            </span>
                        }
                        triggerClassName="w-fit"
                        replaceElement
                    >
                        {titleToolTip}
                    </Tooltip>
                )}
            </div>
            {(description || subtitle) && (
                <div className="flex flex-col gap-2">
                    {typeof subtitle === 'string' ? (
                        <p className={'typography-titles-subtitle'}>
                            {subtitle}
                        </p>
                    ) : (
                        subtitle
                    )}
                    {description && typeof description === 'string' ? (
                        <p className={'typography-content-body'}>
                            {description}
                        </p>
                    ) : (
                        description
                    )}
                </div>
            )}
        </div>
    );
};
