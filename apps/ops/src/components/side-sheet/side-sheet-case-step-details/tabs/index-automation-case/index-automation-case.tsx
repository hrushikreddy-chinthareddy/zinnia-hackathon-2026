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
    // eslint-disable-next-line import/no-unresolved
} from './index-automation-case.types';

type FieldConfig = {
    labelKey: string;
    field: string;
    variant?: TypographyVariant;
};

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
            labelKey:
                'allFields.indexAutomationDocumentIdentificationDocTypeGroup',
            field: 'docTypeGroup',
        },
        {
            labelKey: 'allFields.indexAutomationDocumentIdentificationDocType',
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

    const renderFields = (fields: FieldConfig[]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const entity = transactionEntity?.entity as Record<string, any>;

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
                                {entity?.[field] || DEFAULT_ERROR_STRING}
                            </Typography>
                        </React.Fragment>
                    ))}
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
