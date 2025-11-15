import { useQuery } from '@tanstack/react-query';
import { BannerAlert, BannerVariant } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { getIllustrationQueryOptions } from '@deps/queries/tanstack/illustrations/clientCasesQueries';
import { ProductTypes } from '@deps/types/product';

import SelectForApplicationFooter from './illustration-select-for-application-footer';
import SelectForApplicationSummary from './illustration-select-for-application-summary';
import styles from './illustration-select-for-application.module.css';
import { IllustrationDetailProvider } from '../../providers/IllustrationDetailProvider';
import { useSelectedIllustration } from '../../providers/SelectedIllustrationProvider';

export default function IllustrationSelectForApplication() {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const { selectedIllustration, clientCase } = useSelectedIllustration();
    const { product, illustration: illustrationSummary } =
        selectedIllustration ?? {};

    const { isLoading, data: illustration } = useQuery(
        getIllustrationQueryOptions(
            illustrationSummary?.id ?? null,
            product?.productType ?? ProductTypes.TERM
        )
    );

    if (
        isLoading ||
        !product ||
        !illustrationSummary ||
        !illustration ||
        !clientCase
    ) {
        return;
    }

    const { title, id: illustrationId } = illustrationSummary;

    return (
        <IllustrationDetailProvider value={illustration}>
            <div className={styles.content}>
                <p>
                    {t('clientCase.illustrationSelectForApplication.subtitle')}
                </p>

                <SelectForApplicationSummary
                    {...{ clientCase, product, title }}
                />

                <div className="flex-1 flex flex-col">
                    <div className="flex-1" />
                    <BannerAlert
                        variant={BannerVariant.Warning}
                        bodyText={t(
                            'clientCase.illustrationSelectForApplication.warning'
                        )}
                    />
                </div>

                <SelectForApplicationFooter {...{ illustrationId }} />
            </div>
        </IllustrationDetailProvider>
    );
}
