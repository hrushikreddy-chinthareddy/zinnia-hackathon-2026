import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';

import { CaseAdditionalStepData as CaseAdditionalStepDataBase } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-types';
import NavElement, {
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { getTransactionEntityQuery } from '@deps/queries/tanstack/transactions/transactionsQueries';
import { ReactComponent as InProgressIcon } from '@deps/styles/elements/icons/alert/in-progress.svg';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

export interface DeathAuditQualificationProps {
    stepAdditionalData: CaseAdditionalStepDataBase;
}

const DeathAuditQualification = ({
    stepAdditionalData,
}: DeathAuditQualificationProps) => {
    const { t } = useTranslation();

    const entityId = stepAdditionalData.value;
    const {
        data: transactionEntity,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['deathAuditQualification', entityId],
        queryFn: () => getTransactionEntityQuery(entityId),
    });

    const zlCaseId: string | null = transactionEntity
        ? transactionEntity?.entity?.zlCaseId
        : null;

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
                        {t('deathAuditQualification.loadingTransactions')}
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
                        {t('deathAuditQualification.errorGettingTransactions')}
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

    return (
        <div className="flex w-full flex-col">
            <Typography variant={TypographyVariant.H3} className="mb-2">
                {t('deathAuditQualification.title')}
            </Typography>

            <div className="flex flex-col w-full">
                <div className="grid grid-cols-5 gap-2 text-md align-center mb-4">
                    <div className="col-span-2 text-[--color-base-text-text-secondary]">
                        {t('deathAuditQualification.idnCaseId')}
                    </div>
                    {zlCaseId ? (
                        <NavElement
                            type={NavElementType.Link}
                            className="underline"
                            target="_blank"
                            href={`/cases/${zlCaseId}/progress`}
                            rel="noreferrer"
                        >
                            {zlCaseId}
                        </NavElement>
                    ) : (
                        <Typography
                            variant={TypographyVariant.BodySm}
                            className="col-span-3"
                        >
                            {DEFAULT_ERROR_STRING}
                        </Typography>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeathAuditQualification;
