import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

import { TranslationFiles } from '@deps/config/translations';
import {
    getIllustrationCalculationStatus,
    selectIllustrationForClientCase,
} from '@deps/queries/tanstack/illustrations/clientCasesQueries';
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
};

export default function IllustrationDetailsToolbar({
    isLoading = false,
    status = IllustrationStatuses.ACTIVE,
    clientCaseId,
    illustrationId,
    productType = '',
}: IllustrationDetailsToolbarProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const queryClient = useQueryClient();
    const [isPdfGenerationErrorVisible, setIsPdfGenerationErrorVisible] =
        useState<boolean>(false);
    const [isSavingChanges, setIsSavingChanges] = useState<boolean>(false);

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

    const selectIllustrationMutation = useMutation({
        mutationKey: [
            'selectIllustrationForApplication',
            illustrationId,
            productType,
        ],
        mutationFn: ({
            clientCaseId,
            illustrationId,
        }: {
            clientCaseId: string;
            illustrationId: string;
        }) => selectIllustrationForClientCase(clientCaseId, illustrationId),
        onSuccess: () => {
            setIsSavingChanges(false);
            queryClient.invalidateQueries({
                queryKey: ['illustrationData', illustrationId],
            });
        },
        onMutate: () => {},
        onError: () => {
            setIsSavingChanges(false);
        },
    });
    const handledownloadPdf = async () => {
        const tempLink = document.createElement('a');
        tempLink.href = `/api/illustration/v3/illustration-request/${illustrationId}/results/FORMATTED_ILLUSTRATION_PDF`;
        tempLink.setAttribute('download', `illustration_${illustrationId}.pdf`);

        document.body.appendChild(tempLink);
        tempLink.click();

        document.body.removeChild(tempLink);
    };

    const handleSelectIllustration = () => {
        setIsSavingChanges(true);
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

    return (
        <>
            <div className="flex justify-start items-center gap-4 py-6 pl-6 pr-4 border-border-light border-b-2">
                {productType &&
                    productType === ProductTypes.INDEX_UNIVERSAL_LIFE && (
                        <ToolbarButton
                            disabled={isLoading || !isPdfReportAvailable}
                            icon={IconType.DOCUMENT_REPORT}
                            className={styles.linkButton}
                            onClick={handledownloadPdf}
                        >
                            {t('clientCase.illustrationDetails.viewPdf')}
                        </ToolbarButton>
                    )}
                <ToolbarButton
                    disabled={isLoading}
                    icon={IconType.DOCUMENT_DUPLICATE}
                    className={styles.linkButton}
                >
                    {t('clientCase.illustrationDetails.duplicate')}
                </ToolbarButton>

                {status === IllustrationStatuses.ARCHIVED ? (
                    <ToolbarButton
                        disabled={isLoading}
                        icon={IconType.REFRESH}
                        className={styles.linkButton}
                    >
                        {t('clientCase.illustrationDetails.unArchive')}
                    </ToolbarButton>
                ) : status !== IllustrationStatuses.EXPIRED ? (
                    <ToolbarButton
                        disabled={isLoading}
                        icon={IconType.EDIT_ALT}
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
                    {isLoading || isSavingChanges ? (
                        <>
                            <Text className="" as={BodyVariant.span}>
                                {t(
                                    'clientCase.illustrationDetails.calculating'
                                )}
                            </Text>
                            <Loader />
                        </>
                    ) : status === IllustrationStatuses.ACTIVE ? (
                        <Button
                            mode="primary"
                            size="small"
                            onClick={handleSelectIllustration}
                        >
                            {t(
                                'clientCase.illustrationDetails.selectForApplication'
                            )}
                        </Button>
                    ) : (
                        <span className="relative">
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
