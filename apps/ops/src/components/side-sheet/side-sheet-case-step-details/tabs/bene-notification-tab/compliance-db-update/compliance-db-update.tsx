import { useQuery } from '@tanstack/react-query';
import { Icon, IconType } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import { CaseAdditionalStepData as CaseAdditionalStepDataBase } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-types';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { getTransactionEntityQuery } from '@deps/queries/tanstack/transactions/transactionsQueries';
import { ReactComponent as InProgressIcon } from '@deps/styles/elements/icons/alert/in-progress.svg';
import { ReactComponent as DOCUMENT_TEXT_ICON } from '@deps/styles/elements/icons/icons_outlined/document-text-2.svg';
import { DEFAULT_DATE_DISPLAY_FORMAT } from '@deps/types/constants';

import { AuditFileItem } from '../../death-audit-files/death-audit-files.types';

export interface ComplianceDBUpdateProps {
    stepAdditionalData: CaseAdditionalStepDataBase;
}

const ComplianceDBUpdate = ({
    stepAdditionalData,
}: ComplianceDBUpdateProps) => {
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

    const files: AuditFileItem[] =
        transactionEntity?.entity?.inbound.files ?? [];

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
                        {t('complianceDBUpdate.loadingTransactions')}
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
                        {t('complianceDBUpdate.errorGettingTransactions')}
                    </Typography>
                </div>
            </div>
        );
    };

    const displayNoData = () => {
        return (
            <div className="mt-0.5">
                <div className="text-sm font-bold">
                    <AssistiveText
                        text={t('complianceDBUpdate.noData')}
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

    if (files?.length === 0) {
        return displayNoData();
    }

    return (
        <div>
            <Typography
                variant={TypographyVariant.BodyBold}
                data-testid={'compliance-db-update-title'}
            >
                {t('complianceDBUpdate.details')}
            </Typography>

            <ul className="mt-2" data-testid={'compliance-db-files'}>
                {files?.map((fileItem, index) => {
                    const file = fileItem?.inboundFileComplianceData;
                    if (!file) {
                        return;
                    }
                    const { fileReceivedDate, fileName } = file;

                    return (
                        <li key={`compliance-data-${index}`} className="mt-4">
                            <Typography
                                variant={TypographyVariant.BodySm}
                                data-testid={`compliance-data-${index}-date`}
                            >
                                {fileReceivedDate &&
                                    dayjs(fileReceivedDate).format(
                                        DEFAULT_DATE_DISPLAY_FORMAT
                                    )}
                            </Typography>
                            <div
                                className={`flex rounded border border-gray-100 p-[12px] cardClass="mt-2 mb-4"
                                        }`}
                                data-testid={`compliance-data-${index}-file-item`}
                            >
                                <div className="px-2">
                                    <DOCUMENT_TEXT_ICON
                                        width={25}
                                        height={25}
                                    />
                                </div>
                                <div className="grow">
                                    {fileName && (
                                        <div className="text-sm font-bold break-all">
                                            <PiiWrapper>{fileName}</PiiWrapper>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default ComplianceDBUpdate;
