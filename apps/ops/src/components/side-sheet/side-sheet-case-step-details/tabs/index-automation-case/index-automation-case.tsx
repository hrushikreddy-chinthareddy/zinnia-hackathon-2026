import { useQuery } from '@tanstack/react-query';
import { Icon, IconType } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { getTransactionEntityQuery } from '@deps/queries/tanstack/transactions/transactionsQueries';
import { ReactComponent as InProgressIcon } from '@deps/styles/elements/icons/alert/in-progress.svg';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';

import styles from './index-automation-case.module.css';
import {
    DataType,
    IndexAutomationCaseProps,
    // eslint-disable-next-line import/no-unresolved
} from './index-automation-case.types';

const IndexAutomationCase = ({
    stepAdditionalData,
    dataType,
}: IndexAutomationCaseProps) => {
    const { t } = useTranslation();

    const entityId = stepAdditionalData.value;
    const {
        data: transactionEntity,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['indexing', entityId],
        queryFn: () => getTransactionEntityQuery(entityId),
    });

    const displayIsLoading = () => {
        return (
            <div className={styles.flexFullCol}>
                <div className={styles.customMarginTop}>
                    <InProgressIcon
                        height={18}
                        width={18}
                        role="presentation"
                        className={styles.customIconStyle}
                        aria-hidden={true}
                    />
                </div>
                <div>
                    <Typography
                        variant={TypographyVariant.BodySmBold}
                        className={styles.customTextColor}
                    >
                        {t('allFields.indexAutomationLoading')}
                    </Typography>
                </div>
            </div>
        );
    };

    const displayError = () => {
        return (
            <div className={styles.flexFullCol}>
                <div className={styles.customMarginTop}>
                    <InProgressIcon
                        height={18}
                        width={18}
                        role="presentation"
                        aria-hidden={true}
                        className={styles.customIconStyle}
                    />
                </div>
                <div>
                    <Typography
                        variant={TypographyVariant.BodySmBold}
                        className={styles.customTextColor}
                    >
                        {t('allFields.indexAutomationErrorGetting')}
                    </Typography>
                </div>
            </div>
        );
    };

    const displayNoData = () => {
        return (
            <div className="mt-0.5">
                <Typography
                    variant={TypographyVariant.H3}
                    className="mb-4 border-b pb-2"
                >
                    {t('allFields.indexAutomationTitle')}
                </Typography>
                <div className="text-sm font-bold">
                    <AssistiveText
                        text={t('allFields.indexAutomationNoData')}
                        variant={AssistiveTextVariant.Default}
                        iconOverride={
                            <Icon
                                width={16}
                                height={16}
                                type={IconType.DOCUMENT_TEXT}
                            />
                        }
                    />
                </div>
            </div>
        );
    };

    if (isLoading) {
        return displayIsLoading();
    }

    if (isError) {
        return displayError();
    }

    if (!transactionEntity) {
        return displayNoData();
    }

    return (
        <div className={styles.flexFullCol}>
            {dataType === DataType.REQUEST_RECEIVED_DATA && (
                <div className={styles.flexFullCol}>
                    <div className={styles.gridContainer}>
                        <div className={styles.customColSpan2}>
                            {t(
                                'allFields.indexAutomationRequestReceivedReceivedOn'
                            )}
                        </div>
                        <Typography
                            variant={TypographyVariant.BodySm}
                            className={styles.customColSpan3}
                        >
                            {transactionEntity?.entity?.receivedOn ||
                                DEFAULT_ERROR_STRING}
                        </Typography>
                        <div className={styles.customColSpan2}>
                            {t(
                                'allFields.indexAutomationRequestReceivedSource'
                            )}
                        </div>
                        <Typography
                            variant={TypographyVariant.BodySm}
                            className={styles.customColSpan3}
                        >
                            {transactionEntity?.entity?.source ||
                                DEFAULT_ERROR_STRING}
                        </Typography>
                    </div>
                </div>
            )}

            {dataType === DataType.DOCUMENT_IDENTIFICATION_DATA && (
                <div className={styles.flexFullCol}>
                    <div className={styles.gridContainer}>
                        <div className={styles.customColSpan2}>
                            {t(
                                'allFields.indexAutomationDocumentIdentificationDocTypeGroup'
                            )}
                        </div>
                        <Typography
                            variant={TypographyVariant.BodySmBold}
                            className={styles.customColSpan3}
                        >
                            {transactionEntity?.entity?.docTypeGroup ||
                                DEFAULT_ERROR_STRING}
                        </Typography>
                        <div className={styles.customColSpan2}>
                            {t(
                                'allFields.indexAutomationDocumentIdentificationDocType'
                            )}
                        </div>
                        <Typography
                            variant={TypographyVariant.BodySmBold}
                            className={styles.customColSpan3}
                        >
                            {transactionEntity?.entity?.docType ||
                                DEFAULT_ERROR_STRING}
                        </Typography>
                    </div>
                </div>
            )}

            {dataType === DataType.DOCUMENT_EXTRACTION_DATA && (
                <div className={styles.flexFullCol}>
                    <div className={styles.gridContainer}>
                        <div className={styles.customColSpan2}>
                            {t(
                                'allFields.indexAutomationDocumentExtractionContractNumber'
                            )}
                        </div>
                        <Typography
                            variant={TypographyVariant.BodySmBold}
                            className={styles.customColSpan3}
                        >
                            {transactionEntity?.entity?.contractNumber ||
                                DEFAULT_ERROR_STRING}
                        </Typography>
                        <div className={styles.customColSpan2}>
                            {t(
                                'allFields.indexAutomationDocumentExtractionOwnerName'
                            )}
                        </div>
                        <Typography
                            variant={TypographyVariant.BodySmBold}
                            className={styles.customColSpan3}
                        >
                            {transactionEntity?.entity?.ownerName ||
                                DEFAULT_ERROR_STRING}
                        </Typography>
                        <div className={styles.customColSpan2}>
                            {t(
                                'allFields.indexAutomationDocumentExtractionSsn'
                            )}
                        </div>
                        <Typography
                            variant={TypographyVariant.BodySmBold}
                            className={styles.customColSpan3}
                        >
                            {transactionEntity?.entity?.ssn ||
                                DEFAULT_ERROR_STRING}
                        </Typography>
                    </div>
                </div>
            )}

            {dataType === DataType.DOCUMENT_INDEXED_DATA && (
                <div className={styles.flexFullCol}>
                    <div className={styles.gridContainer}>
                        <div className={styles.customColSpan2}>
                            {t(
                                'allFields.indexAutomationDocumentIndexedDocumentNumber'
                            )}
                        </div>
                        <Typography
                            variant={TypographyVariant.BodySmBold}
                            className={styles.customColSpan3}
                        >
                            {transactionEntity?.entity?.documentNumber ||
                                DEFAULT_ERROR_STRING}
                        </Typography>
                        <div className={styles.customColSpan2}>
                            {t(
                                'allFields.indexAutomationDocumentIndexedTransactionType'
                            )}
                        </div>
                        <Typography
                            variant={TypographyVariant.BodySmBold}
                            className={styles.customColSpan3}
                        >
                            {transactionEntity?.entity?.transactionType ||
                                DEFAULT_ERROR_STRING}
                        </Typography>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IndexAutomationCase;
