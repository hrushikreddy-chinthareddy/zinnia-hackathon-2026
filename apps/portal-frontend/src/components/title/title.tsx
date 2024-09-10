import clsx from 'clsx';
import { PropsWithChildren } from 'react';

export enum TitleVariant {
    SubTitle = 'subtitle',
    SubTitleAlt = 'subtitle-alt',
}

export interface TitleProps extends PropsWithChildren {
    className?: string;
    variant?: TitleVariant;
}

const Title = ({ children, className, variant = TitleVariant.SubTitle }: TitleProps) => {
    const classes = clsx(
        'font-primary text-[18px] text-gray-900',
        {
            'font-semibold': variant === TitleVariant.SubTitle,
            'font-normal': variant === TitleVariant.SubTitleAlt,
        },
        className
    );

    return <span className={classes}>{children}</span>;
};

export default Title;
