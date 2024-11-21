import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useContext, useState } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import { buildFormV2 } from '@deps/containers/otp/withdrawal-forms/utils/withdrawal-form-helper';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
//import { useIsMounted } from '@deps/hooks/useIsMounted';
import { DocumentData } from '@deps/models/case/document';
import { ApiVersion } from '@deps/models/case/enums';
import { TaskApiVersionMapper } from '@deps/models/case/helpers';
import { TaskStatus } from '@deps/models/case/task-instance';
import { updateTask } from '@deps/queries/api/v2/task';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';

import { useNigoEntry } from '../../nigo-entry-provider';
import { selOptionType } from '../service-form-review/service-form-review';
interface ConfirmStepProps {
    documentNumber?: string;
    docType?: string;
    clientCode?: string;
    document: DocumentData
}

const ConfirmStep = ({ document}: ConfirmStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'nigoEntry.confirmStep' });
    const router = useRouter();
    const { submitFailed, setSubmitFailed, sectionOption } = useNigoEntry();
    const formState = useContext(FormDataContext);
    const [isLoading, setIsLoading] = useState(false);
    const [timer] = useState(performance.now());

    const getSubmitLabel = () => {
        switch(sectionOption) {
            case selOptionType.DATA_ENTRY: return t('submitTask');
            case selOptionType.NIGO_ENTRY: return t('submitNigo');
            case selOptionType.DOC_INDEXING: return t('submitDocIndexing');
            default: return t('submit');
        }
    }
    const submit = useCallback(async () => {
        setIsLoading(true);
        if (TaskApiVersionMapper[formState.initialForm.taskType] === ApiVersion.v2 && formState.initialForm.status !== TaskStatus.Completed) {
            const successfulCaseUpdate = await updateTask(
                formState.initialForm.caseId,
                formState.initialForm.taskId,
                buildFormV2(TaskStatus.Completed, document, formState),
                timer
            );

            if (successfulCaseUpdate && successfulCaseUpdate.id) {
                setSubmitFailed(false);
            } else {
                setSubmitFailed(true);
            }
        } else {
            setSubmitFailed(false);
        }

        setIsLoading(false);
    }, [document, formState, setSubmitFailed, timer]);

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
                    text: getSubmitLabel(),
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
