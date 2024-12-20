import { convertToCamelCase } from '@zinnia/utils';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useContext, useState } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import { TaskDataContext } from '@deps/containers/task-container/task-context';
import { updateTask } from '@deps/containers/task-container/task.healpers';
import { TaskType } from '@deps/models/case/task';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';

interface ConfirmStepProps {
    taskType: TaskType;
    taskInfoLink: string;
}
const ConfirmStep = ({ taskType, taskInfoLink }: ConfirmStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: `${convertToCamelCase(taskType)}.confirmStep` });
    const router = useRouter();
    const formState = useContext(TaskDataContext);

    const [isLoading, setIsLoading] = useState(false);

    const { task, submitFailed, setSubmitFailed, correlationId } = formState;

    const submit = useCallback(async () => {
        setIsLoading(true);
        const success = await updateTask(task, correlationId);
        setSubmitFailed(!success);
        setIsLoading(false);
    }, [correlationId, setSubmitFailed, task]);

    if (isLoading) {
        return (
            <div className="responsive-padding flex h-[300px] w-full grow">
                <PageLoader variant={PageLoaderVariant.Center} />
            </div>
        );
    }

    if (!submitFailed) {
        return (
            <ApiErrorCard
                leaveRoute={taskInfoLink}
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
                secondaryCta={
                    <NavElement
                        aria-label={t('secondaryCta') as string}
                        onClick={() => router.push(taskInfoLink)}
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
