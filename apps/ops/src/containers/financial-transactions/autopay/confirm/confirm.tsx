import {
    ArrangementType,
    Policy,
    SystematicProgram,
} from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';

import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import ConfirmCard from '@deps/components/transactions/financial/confirm-card';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import { useAutopay } from '@deps/contexts/transactions/AutopayContext';
import { Statuses } from '@deps/models/case/case';
import {
    TransactionResponseStatus,
    submitSystematicProgramUpdate,
} from '@deps/queries/api/bpm';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';

import {
    buildSystematicProgramUpdateRequestBody,
    buildSystematicWithdrawalProgramUpdateRequestBody,
    getSystematicInfo,
} from '../autopay.helpers';

interface ConfirmProps {
    policy: Policy;
}

const Confirm = ({ policy }: ConfirmProps) => {
    const { autopay } = useAutopay();
    const {
        parentPage,
        translationKeyPrefix,
        paymentAmount,
        caseId,
        payorFullName,
        payeeFullName,
        validationResponse,
        arrangementType,
        isSetUp,
    } = autopay;

    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: `${translationKeyPrefix}.confirm`,
    });
    const { t: defaultT } = useTranslation();

    const [submitFailed, setSubmitFailed] = useState(false);
    const [submitNigo, setSubmitNigo] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { policyNumber, product, systematicPrograms } = policy;
    const [newCaseId, setNewCaseId] = useState<string | undefined>(caseId);

    const validationSucceeded = useMemo(
        () => validationResponse?.status === TransactionResponseStatus.Success,
        [validationResponse]
    );

    let type = '';

    if (parentPage === ParentPage.Withdrawals) {
        type =
            arrangementType == ArrangementType.WITHDRAWAL
                ? 'systematic withdrawal'
                : 'systematic rmd';
    }

    const submit = async () => {
        setIsLoading(true);

        const { systematicProgram, arrangementId } = getSystematicInfo(
            systematicPrograms,
            autopay.systematicProgramReason,
            isSetUp
        );

        const query =
            parentPage === 'withdrawals'
                ? buildSystematicWithdrawalProgramUpdateRequestBody(
                      autopay,
                      systematicProgram as SystematicProgram
                  )
                : buildSystematicProgramUpdateRequestBody(
                      autopay,
                      systematicProgram as SystematicProgram
                  );
        const response = await submitSystematicProgramUpdate(
            product?.planCode,
            policyNumber,
            arrangementId,
            query
        );

        if (response.status !== StatusCode.Accepted) {
            setSubmitFailed(true);
        } else {
            if (response?.data?.caseStatus === Statuses.Exception) {
                setSubmitNigo(true);
            }
            setNewCaseId(response?.data?.caseId);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        submit();
    }, []);

    if (isLoading) {
        return (
            <div className="responsive-padding flex h-[300px] w-full grow">
                <PageLoader variant={PageLoaderVariant.Center} />
            </div>
        );
    }

    if (submitFailed) {
        return (
            <ApiErrorCard
                leaveRoute={`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/${parentPage}`}
                submit={{
                    action: submit,
                    text: defaultT('workflows.apiErrorCard.submitPayment'),
                }}
            />
        );
    }

    return (
        <div className="responsive-padding flex h-full w-full grow flex-col items-center justify-center">
            <ConfirmCard
                caseId={newCaseId}
                isNigo={!validationSucceeded || submitNigo}
                parentPage={`/policies/${policy.product?.planCode}/${policy.policyNumber}/policy/${parentPage}`}
                amount={Number(paymentAmount)}
                payorPayeeName={payeeFullName || payorFullName}
                type={parentPage === 'withdrawals' ? type : t('type')}
            />
        </div>
    );
};

export default Confirm;
