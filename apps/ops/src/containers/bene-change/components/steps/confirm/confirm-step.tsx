import { Policy } from '@zinnia/api-types/types/sor';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, {
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import { DocumentData, DocumentType } from '@deps/models/case/document';
import { fetchDocument } from '@deps/operations/documents/documentOperations';
import { addTransaction } from '@deps/queries/api/web-non-financial';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';

import { buildReRegRequestBody } from './confirm-step.helpers';
import { useBeneChange } from '../../../bene-change-provider';

interface ConfirmStepProps {
    policy: Policy;
    document: DocumentData;
    planCode: string;
    clientId: string;
}

const ConfirmStep = ({
    policy,
    document,
    planCode,
    clientId,
}: ConfirmStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'beneChange.confirm',
    });
    const router = useRouter();
    const {
        formData,
        formErrors,
        signatureData,
        beneData,
        ownerInfo,
        peopleSelection,
    } = useBeneChange();

    const [submitFailed, setSubmitFailed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const validationSucceeded = useMemo(
        () => Object.keys(formErrors).length === 0,
        [formErrors]
    );

    const submit = useCallback(async () => {
        let documentResult;

        if (
            !document &&
            formData.businessKey &&
            formData.caseId !== '' &&
            clientId
        ) {
            documentResult = await fetchDocument(
                formData.businessKey,
                DocumentType.ReReg,
                clientId.toUpperCase()
            );

            if (!documentResult.success) {
                console.error(
                    'ConfirmStep:: No documentNumber from getDocument',
                    {
                        documentNumber: formData.businessKey,
                        documentType: DocumentType.ReReg,
                        clientId,
                    }
                );
                setSubmitFailed(true);
            }
        }
        const parties = peopleSelection?.cardActionData?.filteredData || [];
        const requestBody = buildReRegRequestBody({
            formData,
            beneData,
            ownerInfo,
            signatureData,
            document,
            policy,
            selectedDocument: documentResult?.success
                ? documentResult.value
                : null,
            parties,
        });

        const response = await addTransaction(requestBody);
        if (response.status !== 'ACCEPTED') {
            setSubmitFailed(true);
        }

        setIsLoading(false);
    }, [document, formData, clientId, signatureData, planCode, policy]);

    useEffect(() => {
        submit();
    }, [submit]);

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
                leaveRoute={'/create-case'}
                submit={{
                    action: submit,
                    text: t('submitAddress'),
                }}
            />
        );
    }

    return (
        <div className="responsive-padding flex h-full w-full grow flex-col items-center justify-center">
            {validationSucceeded ? (
                <CardInfo
                    icon={
                        <CircleCheckIcon
                            className="text-semantic-success"
                            height={50}
                            width={50}
                        />
                    }
                    cta={{
                        action: () => {
                            router.push(router.asPath);
                            router.reload();
                        },
                        text: t('viewAllPeople'),
                    }}
                    secondaryCta={
                        <NavElement
                            aria-label={t('close') as string}
                            onClick={() => router.push('/create-case')}
                            type={NavElementType.Button}
                            variant={NavElementVariant.Default}
                            className="font-semibold text-secondary"
                        >
                            {t('close')}
                        </NavElement>
                    }
                    subtitle={<span>{t('successMessage')}</span>}
                    title={t('title')}
                />
            ) : null}
        </div>
    );
};

export default ConfirmStep;
