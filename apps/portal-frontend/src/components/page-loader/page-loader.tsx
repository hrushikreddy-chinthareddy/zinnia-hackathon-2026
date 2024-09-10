import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import React from 'react';

import loadingImage from '@deps/styles/images/loader.png';

export enum PageLoaderVariant {
    Left = 'left',
    Center = 'center',
}

interface PageLoaderProps {
    showText?: boolean;
    variant?: PageLoaderVariant;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ showText = false, variant = PageLoaderVariant.Left }) => {
    const { t } = useTranslation();

    return (
        <div className={`mx-auto flex items-center font-primary ${variant === PageLoaderVariant.Center ? 'justify-center' : 'ml-2'}`}>
            <div data-testid="test-loader" className="transform-origin-center duration-2000 animate-spin ease-linear">
                <Image src={loadingImage} alt={t('site.loader')} height={33.33} width={33.33} />
            </div>
            {showText && <span className="ml-2">{t('caseManagementDashboard.search.loading.title')}</span>}
        </div>
    );
};

export default PageLoader;
