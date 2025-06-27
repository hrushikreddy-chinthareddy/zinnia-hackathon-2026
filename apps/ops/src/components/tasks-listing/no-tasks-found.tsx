import clsx from 'clsx';

import { ReactComponent as SparklesIcon } from '@deps/styles/elements/icons/icons_outlined/sparkles.svg';

import { NoTaskFoundLabels } from './task-listing.types';
import CardInfo from '../card/card-info/card-info';

interface NoTasksFoundProps {
    labels: NoTaskFoundLabels;
    className?: string;
    handleCreateNewTask: () => void;
}

const NoTasksFound = ({
    className,
    labels,
    handleCreateNewTask,
}: NoTasksFoundProps) => {
    return (
        <div className="w-full">
            <CardInfo
                className={clsx(
                    'm-auto flex h-[300px] w-full max-w-full items-center justify-center border-2 border-dashed border-semantic-error bg-white shadow-sm',
                    className
                )}
                cta={{
                    action: handleCreateNewTask,
                    text: labels.createNewTask,
                }}
                title={labels.noTasksFoundTitle}
                subtitle={labels.noTasksMessage}
                icon={
                    <SparklesIcon
                        height={75}
                        width={75}
                        className="text-primary"
                    />
                }
            />
        </div>
    );
};

export default NoTasksFound;
