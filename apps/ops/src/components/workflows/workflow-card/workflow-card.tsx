import { PropsWithChildren } from 'react';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';

interface WorkflowCardProps extends PropsWithChildren {
    title: string;
    subtitle?: string;
    footerContent?: JSX.Element;
    transactionNavigationButtonsClassname?: string;
}

const WorkflowCard = ({ children, title, subtitle, footerContent }: WorkflowCardProps) => (
    <div className="responsive-padding flex grow flex-col gap-6">
        <div className="flex flex-col gap-6" data-testid="workflow-card-header">
            <Typography data-testid="workflow-card-title" variant={TypographyVariant.H1}>{title || 'autopay.summary.label'}</Typography>
            {!!subtitle && <Typography variant={TypographyVariant.Body}>{subtitle}</Typography>}
        </div>
        <div>{children}</div>
        {!!footerContent && <div className="pt-4">{footerContent}</div>}
    </div>
);

export default WorkflowCard;
