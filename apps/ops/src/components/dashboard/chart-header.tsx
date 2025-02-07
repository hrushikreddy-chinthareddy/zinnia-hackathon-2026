import { Tooltip } from '@zinnia/bloom/components';
import { FC, ReactNode } from 'react';

import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';

import Typography, { TypographyVariant } from '../typography/typography';

interface ChartHeaderProps {
    title: string | ReactNode;
    subtitle: string | ReactNode;
    titleToolTip?: ReactNode;
}

export const ChartHeader: FC<ChartHeaderProps> = ({ title, subtitle, titleToolTip }) => {
    return (
        <div>
            <div className="flex items-center gap-2">
                <Typography className="typography-desktop-headline-2-d" variant={TypographyVariant.H2}>
                    {title}
                </Typography>
                {titleToolTip && (
                    <Tooltip trigger={<CircleInfoIcon height={'16px'} width={'16px'} className="text-primary" />}>{titleToolTip}</Tooltip>
                )}
            </div>
            <p className={'typography-titles-subtitle'}>{subtitle}</p>
        </div>
    );
};
