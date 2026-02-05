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
                <div className="mt-0.5">
                    <InProgressIcon
                        height={18}
                        width={18}
                        role="presentation"
                        className="shrink-0 text-gray-600 transform-origin-center duration-5000 animate-spin ease-linear"
                        aria-hidden={true}
                    />
                </div>
                <div>
                    <Typography
                        variant={TypographyVariant.BodySmBold}
                        className="text-gray-600"
                    >
                        {t('indexAutomation.loading')}
                    </Typography>
                </div>
            </div>
        );
    };

    const displayError = () => {
        return (
            <div className={styles.flexFullCol}>
                <div className="mt-0.5">
                    <InProgressIcon
                        height={18}
                        width={18}
                        role="presentation"
                        aria-hidden={true}
                        className="shrink-0 text-gray-600"
                    />
                </div>
                <div>
                    <Typography
                        variant={TypographyVariant.BodySmBold}
                        className="text-gray-600"
                    >
                        {t('indexAutomation.errorGetting')}
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
                    {t('indexAutomation.title')}
                </Typography>
                <div className="text-sm font-bold">
                    <AssistiveText
                        text={t('indexAutomation.noData')}
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
                        <div className="col-span-2 text-[--color-base-text-text-secondary]">
                            {t('indexAutomation.requestReceived.receivedOn')}
                        </div>
                        <Typography
                            variant={TypographyVariant.BodySm}
                            className="col-span-3"
                        >
                            {transactionEntity?.entity?.receivedOn ||
                                DEFAULT_ERROR_STRING}
                        </Typography>
                        <div className="col-span-2 text-[--color-base-text-text-secondary]">
                            {t('indexAutomation.requestReceived.source')}
                        </div>
                        <Typography
                            variant={TypographyVariant.BodySm}
                            className="col-span-3"
                        >
                            {transactionEntity?.entity?.source ||
                                DEFAULT_ERROR_STRING}
                        </Typography>
                    </div>
                </div>
            )}

            {dataType === DataType.DOCUMENT_IDENTIFICATION_DATA && (
                <div className={styles.flexFullCol}>
                    <div className="grid grid-cols-5 gap-2 text-md align-center mb-4">
                        <div className="col-span-2 text-[--color-base-text-text-secondary]">
                            {t(
                                'indexAutomation.documentIdentification.docTypeGroup'
                            )}
                        </div>
                        <Typography
                            variant={TypographyVariant.BodySmBold}
                            className="col-span-3"
                        >
                            {transactionEntity?.entity?.docTypeGroup ||
                                DEFAULT_ERROR_STRING}
                        </Typography>
                        <div className="col-span-2 text-[--color-base-text-text-secondary]">
                            {t(
                                'indexAutomation.documentIdentification.docType'
                            )}
                        </div>
                        <Typography
                            variant={TypographyVariant.BodySmBold}
                            className="col-span-3"
                        >
                            {transactionEntity?.entity?.docType ||
                                DEFAULT_ERROR_STRING}
                        </Typography>
                    </div>
                </div>
            )}

            {dataType === DataType.DOCUMENT_EXTRACTION_DATA && (
                <div className={styles.flexFullCol}>
                    <div className="grid grid-cols-5 gap-2 text-md align-center mb-4">
                        <div className="col-span-2 text-[--color-base-text-text-secondary]">
                            {t(
                                'indexAutomation.documentExtraction.contractNumber'
                            )}
                        </div>
                        <Typography
                            variant={TypographyVariant.BodySmBold}
                            className="col-span-3"
                        >
                            {transactionEntity?.entity?.contractNumber ||
                                DEFAULT_ERROR_STRING}
                        </Typography>
                        <div className="col-span-2 text-[--color-base-text-text-secondary]">
                            {t('indexAutomation.documentExtraction.ownerName')}
                        </div>
                        <Typography
                            variant={TypographyVariant.BodySmBold}
                            className="col-span-3"
                        >
                            {transactionEntity?.entity?.ownerName ||
                                DEFAULT_ERROR_STRING}
                        </Typography>
                        <div className="col-span-2 text-[--color-base-text-text-secondary]">
                            {t('indexAutomation.documentExtraction.ssn')}
                        </div>
                        <Typography
                            variant={TypographyVariant.BodySmBold}
                            className="col-span-3"
                        >
                            {transactionEntity?.entity?.ssn ||
                                DEFAULT_ERROR_STRING}
                        </Typography>
                    </div>
                </div>
            )}

            {dataType === DataType.DOCUMENT_INDEXED_DATA && (
                <div className={styles.flexFullCol}>
                    <div className="grid grid-cols-5 gap-2 text-md align-center mb-4">
                        <div className="col-span-2 text-[--color-base-text-text-secondary]">
                            {t(
                                'indexAutomation.documentExtraction.documentNumber'
                            )}
                        </div>
                        <Typography
                            variant={TypographyVariant.BodySmBold}
                            className="col-span-3"
                        >
                            {transactionEntity?.entity?.documentNumber ||
                                DEFAULT_ERROR_STRING}
                        </Typography>
                        <div className="col-span-2 text-[--color-base-text-text-secondary]">
                            {t(
                                'indexAutomation.documentExtraction.transactionType'
                            )}
                        </div>
                        <Typography
                            variant={TypographyVariant.BodySmBold}
                            className="col-span-3"
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
