import { PropsWithChildren } from 'react';

export interface ClickContainerProps extends PropsWithChildren {
    ariaLabel: string;
    children: React.ReactNode;
    onClick?: () => void;
    divRef?: React.RefObject<HTMLDivElement>;
    classes?: string;
    role?: 'button' | 'link';
    isSelected?: boolean;
    testId?: string;
}
