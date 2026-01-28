import { useQuery } from '@tanstack/react-query';
import { Icon, IconType } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash';
import { useTranslation } from 'next-i18next';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import { CaseAdditionalStepData as CaseAdditionalStepDataBase } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-types';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { formatSSN } from '@deps/helpers/string.helpers';
import { getTransactionEntityQuery } from '@deps/queries/tanstack/transactions/transactionsQueries';
import { ReactComponent as InProgressIcon } from '@deps/styles/elements/icons/alert/in-progress.svg';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';

export interface ReceiveNewDocumentProps {
    stepAdditionalData: CaseAdditionalStepDataBase;
}

const ReceiveNewDocument = ({
    stepAdditionalData,
}: ReceiveNewDocumentProps) => {
    const { t } = useTranslation();

    const entityId = stepAdditionalData.value;
    const {
        data: transactionEntity,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['receiveNewDocument', entityId],
        queryFn: () => getTransactionEntityQuery(entityId),
    });

    const owner = transactionEntity?.entity?.owners?.[0] ?? {};
    const source = transactionEntity?.entity?.fileRowData?.[0]?.source ?? null;

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
                        {t('receiveNewDocument.loadingTransactions')}
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
                        {t('receiveNewDocument.errorGettingTransactions')}
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
                        text={t('receiveNewDocument.noData')}
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

    if (isEmpty(owner)) {
        return displayNoData();
    }

    return (
        <div className="flex w-full flex-col">
            <Typography variant={TypographyVariant.H3} className="mb-2">
                {t('receiveNewDocument.title')}
            </Typography>

            <div className="flex flex-col w-full mt-2">
                <div className="grid grid-cols-5 gap-2 text-md align-center mb-4">
                    <div className="col-span-2 text-[--color-base-text-secondary]">
                        {t('receiveNewDocument.source')}
                    </div>
                    <div className="col-span-3" data-testid="document-source">
                        {source ?? DEFAULT_ERROR_STRING}
                    </div>
                </div>
                <div className="grid grid-cols-5 gap-2 text-md align-center mb-4">
                    <div className="col-span-2 text-[--color-base-text-secondary]">
                        {t('receiveNewDocument.deceasedSsn')}
                    </div>
                    <div className="col-span-3" data-testid="document-ssn">
                        <PiiWrapper>{formatSSN(owner?.party?.ssn)}</PiiWrapper>
                    </div>
                </div>
                <div className="grid grid-cols-5 gap-2 text-md align-center mb-4">
                    <div className="col-span-2 text-[--color-base-text-secondary]">
                        {t('receiveNewDocument.deceasedFirstName')}
                    </div>
                    <div
                        className="col-span-3"
                        data-testid="document-deceased-first-name"
                    >
                        <PiiWrapper>
                            {owner?.party?.firstName ?? DEFAULT_ERROR_STRING}
                        </PiiWrapper>
                    </div>
                </div>
                <div className="grid grid-cols-5 gap-2 text-md align-center mb-4">
                    <div className="col-span-2 text-[--color-base-text-secondary]">
                        {t('receiveNewDocument.deceasedLastName')}
                    </div>
                    <div
                        className="col-span-3"
                        data-testid="document-deceased-last-name"
                    >
                        <PiiWrapper>
                            {owner?.party?.lastName ?? DEFAULT_ERROR_STRING}
                        </PiiWrapper>
                    </div>
                </div>
                <div className="grid grid-cols-5 gap-2 text-md align-center mb-4">
                    <div className="col-span-2 text-[--color-base-text-secondary]">
                        {t('receiveNewDocument.deceasedDob')}
                    </div>
                    <div
                        className="col-span-3"
                        data-testid="document-deceased-dob"
                    >
                        {owner?.party?.dateOfBirth
                            ? dayjs(owner?.party?.dateOfBirth).format(
                                  'MM-DD-YYYY'
                              )
                            : DEFAULT_ERROR_STRING}
                    </div>
                </div>
                <div className="grid grid-cols-5 gap-2 text-md align-center mb-4">
                    <div className="col-span-2 text-[--color-base-text-secondary]">
                        {t('receiveNewDocument.deceasedDod')}
                    </div>
                    <div
                        className="col-span-3"
                        data-testid="document-deceased-dod"
                    >
                        {owner?.dateOfDeath
                            ? dayjs(owner?.dateOfDeath).format('MM-DD-YYYY')
                            : DEFAULT_ERROR_STRING}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReceiveNewDocument;
