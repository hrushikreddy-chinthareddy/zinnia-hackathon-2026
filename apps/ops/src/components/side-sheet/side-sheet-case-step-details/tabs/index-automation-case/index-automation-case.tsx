import { useQuery } from '@tanstack/react-query';
import { Icon, IconType } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import React from 'react';

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
} from './index-automation-case.types';

type FieldConfig = {
    labelKey: string;
    field: string;
    variant?: TypographyVariant;
};

type ClassificationMethodResult = {
    method: string;
    status: string;
    reasonCode: string;
    message: string;
};

type ClassificationResponse = {
    classificationStatus: string;
    classificationMethod: string;
    classificationMethodResults: ClassificationMethodResult[];
};

interface IndexAutomationEntity {
    classificationResponse?: ClassificationResponse | null;
    [key: string]: string | ClassificationResponse | null | undefined;
}

const DATA_TYPE_FIELDS: Record<string, FieldConfig[]> = {
    [DataType.REQUEST_RECEIVED_DATA]: [
        {
            labelKey: 'allFields.indexAutomationRequestReceivedReceivedOn',
            field: 'receivedOn',
            variant: TypographyVariant.BodySm,
        },
        {
            labelKey: 'allFields.indexAutomationRequestReceivedSource',
            field: 'source',
            variant: TypographyVariant.BodySm,
        },
    ],
    [DataType.DOCUMENT_IDENTIFICATION_DATA]: [
        {
            labelKey: 'allFields.documentTypeGroup',
            field: 'docTypeGroup',
        },
        {
            labelKey: 'allFields.documentType',
            field: 'docType',
        },
    ],
    [DataType.DOCUMENT_EXTRACTION_DATA]: [
        {
            labelKey:
                'allFields.indexAutomationDocumentExtractionContractNumber',
            field: 'contractNumber',
        },
        {
            labelKey: 'allFields.indexAutomationDocumentExtractionSsn',
            field: 'ssn',
        },
    ],
    [DataType.DOCUMENT_MANUAL_REVIEW_DATA]: [
        {
            labelKey: 'allFields.indexAutomationDocumentManualReviewReason',
            field: 'reason',
        },
        {
            labelKey:
                'allFields.indexAutomationDocumentManualReviewActionTaken',
            field: 'actionTaken',
        },
        {
            labelKey: 'allFields.indexAutomationDocumentManualReviewQueue',
            field: 'reviewQueue',
        },
    ],
    [DataType.DOCUMENT_INDEXED_DATA]: [
        {
            labelKey: 'allFields.indexAutomationDocumentIndexedDocumentNumber',
            field: 'documentNumber',
        },
        {
            labelKey: 'allFields.indexAutomationDocumentIndexedTransactionType',
            field: 'transactionType',
        },
    ],
};

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

    const displayStatusMessage = (messageKey: string) => {
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
                        {t(messageKey)}
                    </Typography>
                </div>
            </div>
        );
    };

    const displayNoData = () => {
        return (
            <div className={styles.customMarginTop}>
                <Typography
                    variant={TypographyVariant.H3}
                    className={styles.customSectionDivider}
                >
                    {t('allFields.indexAutomationTitle')}
                </Typography>
                <div className={styles.customSectionTitle}>
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

    const renderClassificationDetails = (entity: IndexAutomationEntity) => {
        const classificationResponse = entity?.classificationResponse;
        if (!classificationResponse) return null;

        const {
            classificationStatus,
            classificationMethod,
            classificationMethodResults,
        } = classificationResponse;

        const showClassificationMethod =
            classificationMethod && classificationMethod !== 'NONE';

        if (classificationStatus === 'SUCCESS') {
            return showClassificationMethod ? (
                <React.Fragment>
                    <div className={styles.customColSpan2}>
                        {t('allFields.classificationMethod')}
                    </div>
                    <Typography
                        variant={TypographyVariant.BodySmBold}
                        className={styles.customColSpan3}
                    >
                        {classificationMethod}
                    </Typography>
                </React.Fragment>
            ) : null;
        }

        return (
            <React.Fragment>
                {showClassificationMethod && (
                    <>
                        <div className={styles.customColSpan2}>
                            {t('allFields.classificationMethod')}
                        </div>
                        <Typography
                            variant={TypographyVariant.BodySmBold}
                            className={styles.customColSpan3}
                        >
                            {classificationMethod}
                        </Typography>
                    </>
                )}
                <div className={styles.customColSpan2}>
                    {t('allFields.classificationStatus')}
                </div>
                <Typography
                    variant={TypographyVariant.BodySmBold}
                    className={styles.customColSpan3}
                >
                    {classificationStatus || DEFAULT_ERROR_STRING}
                </Typography>
                {classificationMethodResults?.length > 0 && (
                    <>
                        <div
                            className={`${styles.customColSpan2} ${styles.alignTop}`}
                        >
                            {t('allFields.classificationFailureReasons')}
                        </div>
                        <div className={styles.failureReasons}>
                            {classificationMethodResults.map(
                                (result: ClassificationMethodResult) => (
                                    <Typography
                                        key={result.method}
                                        variant={TypographyVariant.BodySmBold}
                                    >
                                        {result.message}
                                    </Typography>
                                )
                            )}
                        </div>
                    </>
                )}
            </React.Fragment>
        );
    };

    const renderFields = (fields: FieldConfig[]) => {
        const entity = transactionEntity?.entity as IndexAutomationEntity;

        return (
            <div className={styles.flexFullCol}>
                <div className={styles.gridContainer}>
                    {fields.map(({ labelKey, field, variant }) => (
                        <React.Fragment key={field}>
                            <div className={styles.customColSpan2}>
                                {t(labelKey)}
                            </div>
                            <Typography
                                variant={
                                    variant ?? TypographyVariant.BodySmBold
                                }
                                className={styles.customColSpan3}
                            >
                                {(entity?.[field] as string) ||
                                    DEFAULT_ERROR_STRING}
                            </Typography>
                        </React.Fragment>
                    ))}
                    {dataType === DataType.DOCUMENT_IDENTIFICATION_DATA &&
                        renderClassificationDetails(entity)}
                </div>
            </div>
        );
    };

    if (isLoading) {
        return displayStatusMessage('allFields.indexAutomationLoading');
    }

    if (isError) {
        return displayStatusMessage('allFields.indexAutomationErrorGetting');
    }

    if (!transactionEntity) {
        return displayNoData();
    }

    const fields = DATA_TYPE_FIELDS[dataType];

    if (!fields) {
        return null;
    }

    return <div className={styles.flexFullCol}>{renderFields(fields)}</div>;
};

export default IndexAutomationCase;
