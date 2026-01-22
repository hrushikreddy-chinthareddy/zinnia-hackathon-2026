import { Loader } from '@zinnia/bloom/components';
import clsx from 'clsx';
import React from 'react';

import styles from './styles.module.css';
interface CustomLoaderProps {
    size?: 'small' | 'default';
    className?: string;
}

const CustomLoader: React.FC<CustomLoaderProps> = ({
    size = 'small | default',
    className = '',
}) => {
    return (
        <div className={clsx(styles[`${size}-loader`], className)}>
            <Loader />
        </div>
    );
};

export default CustomLoader;
