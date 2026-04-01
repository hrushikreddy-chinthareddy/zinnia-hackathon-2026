import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useContext, useState } from 'react';

import CardInfo from '@deps/components/card/card-info/card-info';
import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import ApiErrorCard from '@deps/components/workflows/api-error-card/api-error-card';
import { TranslationFiles } from '@deps/config/translations';
import { TaskDataContext } from '@deps/containers/task-container/task-context';
import { updateTask } from '@deps/containers/task-container/task.helpers';
import { TaskType } from '@deps/models/case/task';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';
import { convertToCamelCase } from '@deps/utils/strings';

interface ConfirmStepProps {
    taskType: TaskType;
    taskInfoLink: string;
    isCta?: boolean;
    ctaLink?: string;
    ctaText?: string;
}
const ConfirmStep = ({
    taskType,
    taskInfoLink,
    isCta = false,
    ctaLink,
    ctaText,
}: ConfirmStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: `${convertToCamelCase(taskType)}.confirmStep`,
    });
    const { t: tTaskForm } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'taskManagement.taskForm',
    });
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

    const confirmPrefix = `${convertToCamelCase(taskType)}.confirmStep.`;
    const resolveConfirmText = (
        key: 'title' | 'subTitle' | 'cta' | 'secondaryCta' | 'submitTask',
        fallback: string
    ) => {
        const value = t(key);
        if (
            typeof value !== 'string' ||
            value === key ||
            value.startsWith(confirmPrefix)
        ) {
            return fallback;
        }
        return value;
    };

    const titleText = resolveConfirmText('title', 'Submitted!');
    const subTitleText = resolveConfirmText(
        'subTitle',
        'Your request has been submitted.'
    );
    const ctaLabel = ctaText || resolveConfirmText('cta', tTaskForm('cases'));
    const secondaryCtaLabel = resolveConfirmText(
        'secondaryCta',
        tTaskForm('cancel')
    );
    const submitTaskLabel = resolveConfirmText(
        'submitTask',
        tTaskForm('submit')
    );

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
                leaveRoute={taskInfoLink}
                submit={{
                    action: submit,
                    text: submitTaskLabel,
                }}
            />
        );
    }

    return (
        <div className="responsive-padding flex h-full w-full grow flex-col items-center justify-center">
            <CardInfo
                icon={
                    <CircleCheckIcon
                        className="text-semantic-success"
                        height={50}
                        width={50}
                    />
                }
                subtitle={subTitleText}
                title={titleText}
                cta={
                    isCta
                        ? {
                              action: () => {
                                  router.push(ctaLink || taskInfoLink);
                              },
                              text: ctaLabel,
                          }
                        : undefined
                }
                secondaryCta={
                    <NavElement
                        aria-label={secondaryCtaLabel}
                        onClick={() => router.push(taskInfoLink)}
                        size={NavElementSize.Small}
                        type={NavElementType.Button}
                        variant={NavElementVariant.Default}
                    >
                        {secondaryCtaLabel}
                    </NavElement>
                }
            />
        </div>
    );
};

export default ConfirmStep;
