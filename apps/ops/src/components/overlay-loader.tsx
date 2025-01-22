import Image from 'next/image';
import { FC, PropsWithChildren } from 'react';

import loadingImage from '@deps/styles/images/loader.png';

interface BlurOverlayLoaderProps {
    loading: boolean;
}

export const BlurOverlayLoader: FC<PropsWithChildren<BlurOverlayLoaderProps>> = ({ loading, children }) => {
    return (
        <>
            {loading && (
                <div className="absolute left-0 top-0 z-10 flex justify-center backdrop-blur-sm h-full w-full">
                    {' '}
                    <div
                        data-testid="test-loader"
                        className="transform-origin-center  content-center duration-2000 animate-spin ease-linear"
                    >
                        <Image src={loadingImage} alt="loading" height={33.33} width={33.33} />
                    </div>
                </div>
            )}

            {children}
        </>
    );
};
