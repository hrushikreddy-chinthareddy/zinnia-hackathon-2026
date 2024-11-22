import { convertToCamelCase } from '@zinnia/utils';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useContext, useEffect, useState } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import { TaskDataContext } from '@deps/containers/task-container/task-context';
import { TaskType } from '@deps/models/case/task';
import { updateTask } from '@deps/queries/api/v2/task';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';

interface ConfirmStepProps {
    caseId: string;
    taskId: string;
    taskType: TaskType;
}
const ConfirmStep = ({ caseId, taskId, taskType }: ConfirmStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: `${convertToCamelCase(taskType)}.confirmStep` });
    const router = useRouter();
    const formState = useContext(TaskDataContext);

    const [submitFailed, setSubmitFailed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [timer] = useState(performance.now());
    const { task } = formState;

    const submit = useCallback(async () => {
        const response = await updateTask(caseId, taskId, task, timer);
        if (response && response.id) {
            setSubmitFailed(false);
        } else {
            setSubmitFailed(false);
        }
        setIsLoading(false);
    }, [caseId, task, taskId, timer]);

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
                    text: t('submitTask'),
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
                        onClick={() => router.push('/create-case')}
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
