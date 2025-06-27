import { Loader } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import React from 'react';

export enum PageLoaderVariant {
    Left = 'left',
    Center = 'center',
    LeftWhiteText = 'left-white-text',
    CenterWhiteText = 'center-white-text',
}

interface PageLoaderProps {
    showText?: boolean;
    variant?: PageLoaderVariant;
    textKey?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
    showText = false,
    variant = PageLoaderVariant.Left,
    textKey,
}) => {
    const { t } = useTranslation();

    return (
        <div
            className={`flex items-center ${
                variant === PageLoaderVariant.Center ? 'justify-center' : 'ml-2'
            }`}
            data-testid="test-loader"
        >
            <Loader />
            {showText && (
                <span
                    className="ml-2 font-primary"
                    style={{
                        color:
                            variant === PageLoaderVariant.LeftWhiteText ||
                            variant === PageLoaderVariant.CenterWhiteText
                                ? 'white'
                                : 'inherit',
                    }}
                >
                    {textKey
                        ? t(textKey)
                        : t('caseManagementDashboard.search.loading.title')}
                </span>
            )}
        </div>
    );
};

export default PageLoader;
