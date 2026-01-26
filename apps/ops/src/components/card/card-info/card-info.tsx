import { ReactNode } from 'react';

import Button, { ButtonSize, ButtonType } from '@deps/components/button/button';
import { JestProps } from '@deps/types/props';

import { default as styles } from './card-info.module.css';

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

console.log('test');

const CardInfo = ({
    className,
    cta,
    icon,
    secondaryCta,
    subtitle,
    title,
    'data-testid': testId,
}: CardInfoProps) => {
    return (
        <article
            className={`${styles.cardInfo} ${className}`}
            data-testid={testId}
        >
            {icon}
            <h3 className="typography-desktop-headline-3-d">{title}</h3>
            <p>{subtitle}</p>
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
