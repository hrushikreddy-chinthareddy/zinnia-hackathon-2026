import clsx from 'clsx';
import { ReactNode } from 'react';

import Button, { ButtonSize, ButtonType } from '@deps/components/button/button';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { JestProps } from '@deps/types/props';

export interface CardInfoProps extends JestProps {
    className?: string;
    cta?: {
        action: () => void;
        text: string;
    };
    icon?: ReactNode;
    secondaryCta?: ReactNode;
    subtitle?: ReactNode;
    title: string;
}

const CardInfo = ({ className, cta, icon, secondaryCta, subtitle, title, 'data-testid': testId }: CardInfoProps) => {
    return (
        <article className={clsx('flex max-w-[600px] flex-col items-center px-8', className)} data-testid={testId}>
            {icon}
            <Typography variant={TypographyVariant.H3} className="mt-1 text-center">
                {title}
            </Typography>
            <p className="mt-1 text-center font-secondary text-base font-normal">{subtitle}</p>
            {cta && (
                <Button
                    aria-label={cta.text}
                    role="link"
                    className="mt-10 [&:not(:last-child)]:mb-4"
                    onClick={cta.action}
                    size={ButtonSize.Small}
                    type={ButtonType.Primary}
                >
                    {cta.text}
                </Button>
            )}
            {secondaryCta}
        </article>
    );
};

export default CardInfo;
