import React from 'react';

const Truncate: React.FC = () => {
    return (
        <span data-testid="truncate" aria-label="truncation ellipsis" className="mx-4 select-none text-lg font-normal text-secondary">
            ...
        </span>
    );
};

export default Truncate;
