import React from 'react';

interface CardContainerProps {
    children: React.ReactNode;
    classNames?: string;
    containerClassNames?: string;
    fullWidth?: boolean;
}

const CardContainer = ({ children, classNames = '', containerClassNames = '', fullWidth = true }: CardContainerProps) => {
    return (
        <div className={`flex w-full bg-white ${containerClassNames}`} data-testid="card-container">
            <div className={`p-4 ${fullWidth ? 'w-full' : ''} md:p-6 lg:p-8 ${classNames}`}>{children}</div>
        </div>
    );
};

export default CardContainer;
