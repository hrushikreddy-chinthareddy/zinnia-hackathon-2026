import { useQuery } from '@tanstack/react-query';
import { Icon, IconType } from '@zinnia/bloom/components';
import { TFunction, useTranslation } from 'next-i18next';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import { CaseAdditionalStepData as CaseAdditionalStepDataBase } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-types';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { getTransactionEntityQuery } from '@deps/queries/tanstack/transactions/transactionsQueries';
import { ReactComponent as InProgressIcon } from '@deps/styles/elements/icons/alert/in-progress.svg';

export interface ClaimsFundReleasetProps {
    stepAdditionalData: CaseAdditionalStepDataBase;
}

interface ClaimClosureData {
    caseClose: boolean;
    contractStatus: string;
    date: string;
    reason: string;
    source: string;
}

export enum ClaimClosureReasons {
    DEATH_CLAIM_PAID = 'Death Claim Paid',
    SPOUSAL_CONTINUATION = 'Spousal Continuation',
}

const ClaimsFundRelease = ({ stepAdditionalData }: ClaimsFundReleasetProps) => {
    const { t } = useTranslation();

    const entityId = stepAdditionalData.value;
    const {
        data: transactionEntity,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['claimsTransactions', entityId],
        queryFn: () => getTransactionEntityQuery(entityId),
    });

    const data: ClaimClosureData | null = transactionEntity
        ? transactionEntity?.entity?.claimClosure
        : null;

    const getClaimClosureReason = (data: ClaimClosureData, t: TFunction) => {
        switch (data?.reason) {
            case ClaimClosureReasons.SPOUSAL_CONTINUATION:
                return t(
                    'claimsFundRelease.claimClosureReasons.spousalContinuation',
                    {
                        closureSource: data.source,
                    }
                );
            case ClaimClosureReasons.DEATH_CLAIM_PAID:
                return t(
                    'claimsFundRelease.claimClosureReasons.deathClaimPaid',
                    {
                        closureSource: data.source,
                    }
                );

            default:
                return '';
        }
    };
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
                        {t('claimsFundRelease.loadingTransactions')}
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
                        {t('claimsFundRelease.errorGettingTransactions')}
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
                        text={t('claimsFundRelease.noData')}
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

    if (!data) {
        return displayNoData();
    }

    return (
        <div className="flex w-full flex-col">
            <Typography variant={TypographyVariant.BodySm} className="mb-2">
                {data?.caseClose
                    ? getClaimClosureReason(data, t)
                    : t('claimsFundRelease.settlementInProgress')}
            </Typography>
        </div>
    );
};

export default ClaimsFundRelease;
