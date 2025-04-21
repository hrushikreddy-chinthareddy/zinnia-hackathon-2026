import clsx from 'clsx';
import { PropsWithChildren } from 'react';

export enum TitleVariant {
    Title = 'title',
    SubTitle = 'subtitle',
    SubTitleAlt = 'subtitle-alt',
}

export interface TitleProps extends PropsWithChildren {
    className?: string;
    variant?: TitleVariant;
}

const Title = ({ children, className, variant = TitleVariant.SubTitle }: TitleProps) => {
    const classes = clsx(variant, className);

    return <span className={classes}>{children}</span>;
};

export default Title;
