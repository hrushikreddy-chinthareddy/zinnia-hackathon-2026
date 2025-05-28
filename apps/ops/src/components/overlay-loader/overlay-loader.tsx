import { Loader } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { FC, PropsWithChildren } from 'react';

import styles from './overlay-loader.module.css';
interface BlurOverlayLoaderProps {
    loading: boolean;
}

export const BlurOverlayLoader: FC<PropsWithChildren<BlurOverlayLoaderProps>> = ({ loading, children }) => {
    return (
        <div className={clsx(styles.overlayContainer, loading && styles.isLoading)} data-testid="test-loader">
            {loading && (
                <div className={styles.overlayLoader}>
                    <Loader />
                </div>
            )}
            {children}
        </div>
    );
};
