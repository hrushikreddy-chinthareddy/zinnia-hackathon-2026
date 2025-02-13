import clsx from 'clsx';
import Image from 'next/image';
import { FC, PropsWithChildren } from 'react';

import loadingImage from '@deps/styles/images/loader.png';

import styles from './overlay-loader.module.css';
interface BlurOverlayLoaderProps {
    loading: boolean;
}

export const BlurOverlayLoader: FC<PropsWithChildren<BlurOverlayLoaderProps>> = ({ loading, children }) => {
    return (
        <div className="relative w-full h-full">
            {loading && (
                <div className={clsx(styles.overlayLoader, 'absolute left-0 top-0 z-10 flex justify-center h-full w-full')}>
                    <div
                        data-testid="test-loader"
                        className="transform-origin-center  content-center duration-2000 animate-spin ease-linear"
                    >
                        <Image src={loadingImage} alt="loading" height={33.33} width={33.33} />
                    </div>
                </div>
            )}

            {children}
        </div>
    );
};
