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

import { useSelectIllustrationForApplication } from '@deps/components/illustrations/helpers/hooks/use-select-illustration-for-application';
import { useIllustrationActions } from '@deps/components/illustrations/helpers/hooks/useIllustrationActions';
import { useSelectedIllustration } from '@deps/components/illustrations/providers/SelectedIllustrationProvider';
import { TranslationFiles } from '@deps/config/translations';
import { getIllustrationCalculationStatus } from '@deps/queries/tanstack/illustrations/clientCasesQueries';
import {
    IllustrationsClientCase,
    IllustrationStatus,
    IllustrationStatuses,
} from '@deps/types/illustrations';
import { ProductTypes } from '@deps/types/product';

import ToolbarButton from './illustration-details-toolbar-button';
import styles from './illustration-details-toolbar.module.css';
import StatusBadge from '../../case-details/illustration-item/status-badge';
import { EditSidesheet } from '../edit-sidesheet/edit-sidesheet';
import { useSubmit } from '@deps/components/illustrations/providers/SubmitProvider';

type IllustrationDetailsToolbarProps = {
    isLoading?: boolean;
    status?: IllustrationStatus;
    clientCase: IllustrationsClientCase;
    illustrationId: string;
    planCode: string;
    eAppId?: string;
};

export default function IllustrationDetailsToolbar({
    isLoading = false,
    status = IllustrationStatuses.ACTIVE,
    clientCase,
    illustrationId,
    eAppId,
    planCode,
}: IllustrationDetailsToolbarProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const [isPdfGenerationErrorVisible, setIsPdfGenerationErrorVisible] =
        useState<boolean>(false);
    const { isLoadingSelectForApplication, selectedIllustration } =
        useSelectedIllustration();
    const { product } = selectedIllustration ?? {};
    const { unarchiveIllustrationMutation } = useIllustrationActions();

    const handleSelectForApplication = useSelectIllustrationForApplication();
    const { onNewSubmit } = useSubmit();

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
        enabled: product?.productType === ProductTypes.INDEX_UNIVERSAL_LIFE,
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
        if (isLoadingSelectForApplication || !illustrationId || !clientCase.id)
            return;

        unarchiveIllustrationMutation.mutateAsync({
            clientCaseId: clientCase.id,
            illustrationId,
        });
    };

    return (
        <>
            <div className="flex justify-start items-center gap-4 py-6 pl-6 pr-4 border-border-light border-b-2">
                {product?.productType === ProductTypes.INDEX_UNIVERSAL_LIFE && (
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
                    icon={IconType.DOCUMENT_DUPLICATE}
                    className={styles.linkButton}
                    onClick={onNewSubmit}
                >
                    {t('clientCase.illustrationDetails.duplicate')}
                </ToolbarButton>

                {status === IllustrationStatuses.ARCHIVED ? (
                    <ToolbarButton
                        disabled={isLoading}
                        onClick={handleUnarchiveIllustration}
                        icon={IconType.REFRESH}
                        className={styles.linkButton}
                    >
                        {t('clientCase.illustrationDetails.unArchive')}
                    </ToolbarButton>
                ) : status !== IllustrationStatuses.EXPIRED ? (
                    <EditSidesheet planCode={planCode} clientCase={clientCase}>
                        <ToolbarButton
                            icon={IconType.EDIT}
                            className={styles.linkButton}
                        >
                            {t('clientCase.illustrationDetails.edit')}
                        </ToolbarButton>
                    </EditSidesheet>
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
                        selectedIllustration?.illustration?.productType !==
                            ProductTypes.TERM &&
                        !!eAppId && (
                            <Button
                                mode="primary"
                                size="small"
                                onClick={handleSelectForApplication}
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
