import { useQuery } from '@tanstack/react-query';
import {
    IconType,
    BodyVariant,
    Text,
    Loader,
    Button,
    BannerAlert,
    BannerVariant,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import { useIllustrationActions } from '@deps/components/illustrations/helpers/hooks/useIllustrationActions';
import { useSelectedIllustration } from '@deps/components/illustrations/providers/SelectedIllustrationProvider';
import { TranslationFiles } from '@deps/config/translations';
import { getIllustrationCalculationStatus } from '@deps/queries/tanstack/illustrations/clientCasesQueries';
import {
    IllustrationStatus,
    IllustrationStatuses,
} from '@deps/types/illustrations';
import { ProductTypes } from '@deps/types/product';

import ToolbarButton from './illustration-details-toolbar-button';
import styles from './illustration-details-toolbar.module.css';
import StatusBadge from '../../case-details/illustration-item/status-badge';

type IllustrationDetailsToolbarProps = {
    isLoading?: boolean;
    status?: IllustrationStatus;
    clientCaseId: string;
    illustrationId: string;
    productType?: string;
    eAppId?: string;
};

export default function IllustrationDetailsToolbar({
    isLoading = false,
    status = IllustrationStatuses.ACTIVE,
    clientCaseId,
    illustrationId,
    productType = '',
    eAppId,
}: IllustrationDetailsToolbarProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const [isPdfGenerationErrorVisible, setIsPdfGenerationErrorVisible] =
        useState<boolean>(false);
    const { isLoadingSelectForApplication, setIsLoadingSelectForApplication } =
        useSelectedIllustration();
    const { selectIllustrationMutation, unarchiveIllustrationMutation } =
        useIllustrationActions();

    const { data: isPdfReportAvailable, isError } = useQuery({
        queryKey: ['illustrationProcessingStatus', illustrationId],
        queryFn: async () => {
            const result = await getIllustrationCalculationStatus(
                illustrationId
            );

            if (result.status === 200 && result.data !== 'COMPLETE') {
                throw new Error('Pending PDF');
            }

            if (result.status !== 200) {
                throw new Error('Pending PDF');
            }

            return true;
        },
        retry: 3,
        enabled:
            !!productType && productType === ProductTypes.INDEX_UNIVERSAL_LIFE,
    });

    const handleDownloadPdf = async () => {
        try {
            const response = await fetch(
                `/api/illustration-pdf/${illustrationId}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/pdf',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch PDF: ${response.statusText}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `illustration_${illustrationId}.pdf`);

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading PDF:', error);
        }
    };

    const handleSelectIllustration = () => {
        setIsLoadingSelectForApplication(true);
        selectIllustrationMutation.mutateAsync({
            clientCaseId,
            illustrationId,
        });
    };

    useEffect(() => {
        if (isError) {
            setIsPdfGenerationErrorVisible(true);
            const timer = setTimeout(() => {
                setIsPdfGenerationErrorVisible(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isError]);

    const handleUnarchiveIllustration = () => {
        if (isLoadingSelectForApplication || !illustrationId || !clientCaseId)
            return;

        unarchiveIllustrationMutation.mutateAsync({
            clientCaseId,
            illustrationId,
        });
    };

    return (
        <>
            <div className="flex justify-start items-center gap-4 py-6 pl-6 pr-4 border-border-light border-b-2">
                {productType &&
                    productType === ProductTypes.INDEX_UNIVERSAL_LIFE && (
                        <ToolbarButton
                            disabled={isLoading || !isPdfReportAvailable}
                            icon={IconType.DOCUMENT_REPORT}
                            className={styles.linkButton}
                            onClick={handleDownloadPdf}
                        >
                            {t('clientCase.illustrationDetails.viewPdf')}
                        </ToolbarButton>
                    )}
                <ToolbarButton
                    disabled={true}
                    icon={IconType.DOCUMENT_DUPLICATE}
                    className={styles.linkButton}
                >
                    {t('clientCase.illustrationDetails.duplicate')}
                </ToolbarButton>

                {status === IllustrationStatuses.ARCHIVED ? (
                    <ToolbarButton
                        onClick={handleUnarchiveIllustration}
                        icon={IconType.REFRESH}
                        className={styles.linkButton}
                    >
                        {t('clientCase.illustrationDetails.unArchive')}
                    </ToolbarButton>
                ) : status !== IllustrationStatuses.EXPIRED ? (
                    <ToolbarButton
                        disabled={true}
                        icon={IconType.EDIT}
                        className={styles.linkButton}
                    >
                        {t('clientCase.illustrationDetails.edit')}
                    </ToolbarButton>
                ) : null}

                <div
                    className="flex-1 justify-end flex gap-4"
                    style={{ '--loader-size': '24px' } as any}
                    aria-live="polite"
                >
                    {isLoading || isLoadingSelectForApplication ? (
                        <>
                            <Text className="" as={BodyVariant.span}>
                                {t(
                                    'clientCase.illustrationDetails.calculating'
                                )}
                            </Text>
                            <Loader />
                        </>
                    ) : status === IllustrationStatuses.ACTIVE ? (
                        !!eAppId && (
                            <Button
                                mode="primary"
                                size="small"
                                onClick={handleSelectIllustration}
                            >
                                {t(
                                    'clientCase.illustrationDetails.selectForApplication'
                                )}
                            </Button>
                        )
                    ) : (
                        <span className="relative flex">
                            <StatusBadge status={status} />
                        </span>
                    )}
                </div>
            </div>
            {isPdfGenerationErrorVisible && (
                <div className={styles.bannerWrapper}>
                    <BannerAlert
                        bodyText={t('clientCase.illustrationDetails.pdfError')}
                        variant={BannerVariant.Error}
                        canDismiss
                        onDismiss={() => setIsPdfGenerationErrorVisible(false)}
                    />
                </div>
            )}
        </>
    );
}
