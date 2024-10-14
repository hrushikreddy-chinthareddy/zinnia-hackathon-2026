import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useContext, useEffect, useState } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import { buildFormV2 } from '@deps/containers/otp/withdrawal-forms/utils/withdrawal-form-helper';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { DocumentData } from '@deps/models/case/document';
import { TaskStatus } from '@deps/models/case/task-instance';
import { updateTask } from '@deps/queries/api/v2/task';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';

interface ConfirmStepProps {
    documentNumber?: string;
    docType?: string; 
    clientCode?: string;
    document: DocumentData
}
const ConfirmStep = ({ document}: ConfirmStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'nigoEntry.confirmStep' });
    const router = useRouter();
    const formState = useContext(FormDataContext);
    const [submitFailed, setSubmitFailed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [timer] = useState(performance.now());   
    
    const submit = useCallback(async () => {
        const response = await updateTask(
            formState.initialForm.caseId,
            formState.initialForm.taskId,
            buildFormV2(TaskStatus.Completed, document, formState),
            timer
        );

        if (response && response.id) {
            setSubmitFailed(false);
        } else {
            setSubmitFailed(true);
        }
        
        setIsLoading(false);
    }, [document, formState, timer]);

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
                    text: t('submitNigo'),
                }}
            />
        );
    }

    return (
        <div className="responsive-padding flex h-full w-full grow flex-col items-center justify-center">
            <CardInfo
                icon={<CircleCheckIcon className="text-semantic-success" height={50} width={50} />}
                subtitle={t('subTitle')}
                title={t('title')}
                cta={{
                    action: () => {
                        router.push('/create-case');
                    },
                    text: t('cta'),
                }}
                secondaryCta={
                    <NavElement
                        aria-label={t('secondaryCta') as string}
                        onClick={() =>
                            router.push('/create-case')
                        }
                        size={NavElementSize.Small}
                        type={NavElementType.Button}
                        variant={NavElementVariant.Default}
                    >
                        {t('secondaryCta')}
                    </NavElement>
                }

            />
        </div>
    );
};

export default ConfirmStep;
