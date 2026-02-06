import { Button } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import CustomLoader from '@deps/components/loader/customLoader';
import Tooltip, { PopoverPlacement } from '@deps/components/tooltip/tooltip';
import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';
import { browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

import styles from './styles.module.css';

interface ButtonContentProps {
    isLoading: boolean;
    text: string;
}

interface ViewTaskButtonProps {
    task: ManagementTask;
    isStartTaskLoading: boolean;
    handleViewTask: (taskId: string) => void;
    btnSize: 'small' | 'large';
    disabled: boolean;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
}

interface SidesheetButtonsProps {
    isGoToCaseButtonVisible: boolean;
    isViewTaskButtonVisible: boolean;
    className: string;
    task: ManagementTask;
    startLoader: boolean;
    goToCaseLoader: boolean;
    isViewTaskButtonDisabled: boolean;
    isStartButtonVisible: boolean;
    isStartButtonDisabled: boolean;
    handleGoToCase: (caseId: string) => void;
    handleStart: (taskId: string, taskStatus: TaskStatus) => void;
    handleViewTask: (taskId: string) => void;
    ciamcheck?: boolean;
}

const ButtonContent = ({ isLoading, text }: ButtonContentProps) => {
    return (
        <>
            {isLoading && (
                <CustomLoader className={styles.customLoader} size="small" />
            )}
            {text}
        </>
    );
};

const ViewTaskButton = ({
    isLoading,
    isStartTaskLoading,
    setIsLoading,
    task,
    handleViewTask,
    btnSize,
    disabled,
    ciamcheck,
}: ViewTaskButtonProps & { ciamcheck?: boolean | undefined }) => {
    const { t } = useTranslation();

    const onClick = async () => {
        if (isLoading) return;

        try {
            setIsLoading(true);
            await handleViewTask(task.id);
        } catch (error) {
            browserLogError('ViewTaskButton::Error viewing task', {
                ...parseErrorInformation(error),
                taskId: task.id,
                fileName: 'ViewTaskButton',
            });
        } finally {
            setIsLoading(false);
        }
    };
    console.log('checkCiam', ciamcheck);
    const isViewTaskDisabled = disabled || isLoading || isStartTaskLoading;
    const viewTaskText =
        ciamcheck === false
            ? (t('sideSheet.task.noAccessToTask') as string)
            : (t('sideSheet.task.viewTask') as string);

    const button = (
        <Button
            mode="primary"
            disabled={isViewTaskDisabled}
            onClick={onClick}
            data-testid="view-task-btn"
            aria-label={viewTaskText}
            type="submit"
            size={btnSize}
        >
            <ButtonContent isLoading={isLoading} text={viewTaskText} />
        </Button>
    );

    return disabled ? (
        <Tooltip
            placement={PopoverPlacement.BottomRight}
            body={t('sideSheet.task.noPermissionToViewTask')}
            key={`view-task-tooltip`}
        >
            {button}
        </Tooltip>
    ) : (
        button
    );
};

export default function SidesheetButtons({
    isGoToCaseButtonVisible,
    goToCaseLoader,
    handleGoToCase,
    isViewTaskButtonVisible,
    className,
    task,
    startLoader,
    isViewTaskButtonDisabled,
    isStartButtonDisabled,
    isStartButtonVisible,
    handleStart,
    handleViewTask,
}: SidesheetButtonsProps) {
    const { t } = useTranslation();
    const [isViewTaskLoading, setIsViewTaskLoading] = useState(false);

    const btnSize = 'small';
    const goToCaseText = t('sideSheet.task.goToCase') as string;
    const startTaskText = t('sideSheet.task.startTask') as string;

    return (
        <div className={clsx(styles.sidesheetButtons, className)}>
            {isGoToCaseButtonVisible && (
                <Button
                    mode="primary"
                    disabled={goToCaseLoader}
                    onClick={() => handleGoToCase(task?.caseId)}
                    data-testid="go-to-case-btn"
                    aria-label={goToCaseText}
                    type="submit"
                    size={btnSize}
                >
                    <ButtonContent
                        isLoading={goToCaseLoader}
                        text={goToCaseText}
                    />
                </Button>
            )}

            {isStartButtonVisible && (
                <Button
                    mode="primary"
                    disabled={isStartButtonDisabled || isViewTaskLoading}
                    onClick={() => handleStart(task.id, task.status)}
                    data-testid="start-task-btn"
                    aria-label={startTaskText}
                    type="submit"
                    size={btnSize}
                >
                    <ButtonContent
                        isLoading={startLoader}
                        text={startTaskText}
                    />
                </Button>
            )}

            {isViewTaskButtonVisible && (
                <ViewTaskButton
                    isLoading={isViewTaskLoading}
                    setIsLoading={setIsViewTaskLoading}
                    task={task}
                    handleViewTask={handleViewTask}
                    btnSize={btnSize}
                    isStartTaskLoading={startLoader}
                    disabled={isViewTaskButtonDisabled}
                />
            )}
        </div>
    );
}
