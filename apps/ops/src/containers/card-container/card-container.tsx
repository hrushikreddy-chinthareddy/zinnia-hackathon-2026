import React, { forwardRef } from 'react';

import styles from './CardContainer.module.css';

interface CardContainerProps {
    children: React.ReactNode;
    classNames?: string;
    containerClassNames?: string;
    fullWidth?: boolean;
    variant?: 'primary' | 'secondary';
}

const CardContainer = forwardRef<HTMLDivElement, CardContainerProps>(function CardContainer(
    { children, classNames = '', containerClassNames = '', fullWidth = true, variant = 'primary' }: CardContainerProps,
    ref
) {
    const variantClass = variant === 'primary' ? styles.primary : styles.secondary;

    return (
        <div ref={ref} className={`${styles.cardContainer} ${variantClass} ${containerClassNames}`} data-testid="card-container">
            <div className={`${styles.cardContent} ${fullWidth ? 'w-full' : ''} ${classNames}`}>{children}</div>
        </div>
    );
});

export default CardContainer;
