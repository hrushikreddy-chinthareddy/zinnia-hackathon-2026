import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { TFunction, useTranslation } from 'next-i18next';
import React from 'react';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { getTransactionEntityQuery } from '@deps/queries/tanstack/transactions/transactionsQueries';
import { ReactComponent as InProgressIcon } from '@deps/styles/elements/icons/alert/in-progress.svg';
import { DEFAULT_DATE_DISPLAY_FORMAT } from '@deps/types/constants';

import DeathAuditFile from './death-audit-file';
import { getDetails, getFileSection } from './death-audit-files.helpers';
import {
    DeathAuditFileProcessingProps,
    AuditSummaryItem,
} from './death-audit-files.types';

const DeathAuditFiles = ({
    stepAdditionalData,
    prop,
    title = '',
    objectKey = '',
}: DeathAuditFileProcessingProps) => {
    const { t } = useTranslation();
    const entityId = stepAdditionalData.value;
    const {
        data: transactionEntity,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['deathAuditFileRecord', entityId],
        queryFn: () => getTransactionEntityQuery(entityId),
    });

    const { files, summary } = getDetails(transactionEntity, prop, objectKey);
    const carrier = transactionEntity?.carrier || '';

    const displayIsLoading = () => {
        return (
            <div className="flex w-full flex-col">
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
                        {t('deathAuditFiles.loadingTransactions')}
                    </Typography>
                </div>
            </div>
        );
    };

    const displayError = () => {
        return (
            <div className="flex w-full flex-col">
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
                        {t('deathAuditFiles.errorGettingTransactions')}
                    </Typography>
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

    const displaySummarySection = (
        summaryData: AuditSummaryItem[],
        t: TFunction
    ) => {
        return (
            <div className="grid grid-cols-2 my-4 gap-y-2">
                {summaryData?.map((summaryItem: AuditSummaryItem, index) => {
                    return (
                        <React.Fragment key={`summary-item-${index}`}>
                            <Typography
                                variant={TypographyVariant.BodySm}
                                className="text-[--color-base-text-text-secondary]"
                            >
                                {t(summaryItem.label)}
                            </Typography>
                            <Typography variant={TypographyVariant.BodySm}>
                                {summaryItem.value}
                            </Typography>
                        </React.Fragment>
                    );
                })}
            </div>
        );
    };

    return (
        <div>
            <Typography variant={TypographyVariant.BodyBold}>
                {t(title)}
            </Typography>
            {displaySummarySection(summary, t)}
            <hr className="my-4 h-0.5 border-none bg-gray-100" />
            <div className="mt-2">
                {files?.map((fileItem, key) => {
                    const file = getFileSection(fileItem, prop, objectKey);
                    if (!file) {
                        return;
                    }
                    const fileDate =
                        file?.receivedTimestamp ?? file?.createdTimestamp;

                    return (
                        <React.Fragment key={key}>
                            <div>
                                <Typography variant={TypographyVariant.BodySm}>
                                    {fileDate &&
                                        dayjs(fileDate).format(
                                            DEFAULT_DATE_DISPLAY_FORMAT
                                        )}
                                </Typography>
                            </div>
                            <DeathAuditFile
                                key={`file-${prop}-${file?.documentId}`}
                                file={file}
                                carrier={carrier}
                            />
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default DeathAuditFiles;
