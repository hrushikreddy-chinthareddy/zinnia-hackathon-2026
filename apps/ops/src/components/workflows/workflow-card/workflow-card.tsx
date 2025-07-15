import clsx from 'clsx';
import { PropsWithChildren } from 'react';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';

interface WorkflowCardProps extends PropsWithChildren {
    className?: string;
    title: string;
    subtitle?: string;
    footerContent?: JSX.Element;
    footerClassName?: string;
}

const WorkflowCard = ({
    children,
    title,
    subtitle,
    footerContent,
    className,
    footerClassName,
}: WorkflowCardProps) => (
    <div
        className={clsx(
            'responsive-padding flex grow flex-col gap-6',
            className
        )}
    >
        <div className="flex flex-col gap-2" data-testid="workflow-card-header">
            <Typography
                data-testid="workflow-card-title"
                variant={TypographyVariant.H1}
            >
                {/* TODO MG: why are we using autopay.summary.label here? */}
                {title || 'autopay.summary.label'}
            </Typography>
            {!!subtitle && (
                <Typography variant={TypographyVariant.Body}>
                    {subtitle}
                </Typography>
            )}
        </div>
        <div>{children}</div>
        {/* TODO MG: remove this padding top */}
        {!!footerContent && (
            <div className={footerClassName ? footerClassName : 'pt-4'}>
                {footerContent}
            </div>
        )}
    </div>
);

export default WorkflowCard;
