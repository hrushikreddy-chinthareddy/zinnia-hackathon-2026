import React from 'react';

import styles from '../pagination.module.css';

const Truncate: React.FC = () => {
    return (
        <div data-testid="truncate" aria-label="truncation ellipsis" className={`${styles.truncation} ${styles.paginationItem}`}>
            ...
        </div>
    );
};

export default Truncate;
