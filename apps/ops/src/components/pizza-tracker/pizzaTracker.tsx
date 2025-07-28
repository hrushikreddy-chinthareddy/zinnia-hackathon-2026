import { Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';

import { ReactComponent as NotStartedIcon } from '@deps/styles/elements/icons/alert/not-started.svg';

import styles from './pizzaTracker.module.css';

export enum Status {
    Complete = 'complete',
    Progress = 'progress',
    NotStarted = 'not-started',
    Issue = 'issue',
    Default = 'default',
}

export interface PizzaTrackerProps {
    steps: StepProps[];
    className?: string;
}

interface StepProps {
    status: Status;
    label: string;
}

const STATUS_TO_ICON: Record<Status, IconType> = {
    [Status.Complete]: IconType.CHECKMARK,
    [Status.Progress]: IconType.IN_PROGRESS,
    [Status.NotStarted]: 'NS' as IconType,
    [Status.Issue]: IconType.HEX_EXCLAMATION,
    [Status.Default]: 'NS' as IconType,
};

const STATUS_TO_COLOR: Record<Status, string> = {
    [Status.Complete]: 'var(--color-status-icon-status-success-icon, #007BFA)',
    [Status.Progress]: 'var(--color-base-icon-icon-dark)',
    [Status.NotStarted]: 'var(--color-base-icon-icon-default)',
    [Status.Issue]: 'var(--color-status-icon-status-error-icon, #DB004F)',
    [Status.Default]: 'var(--color-base-icon-icon-default)',
};

const PizzaTracker = ({ steps, className }: PizzaTrackerProps) => {
    return (
        <div className={clsx(styles.pizzaTracker, className)}>
            {steps.map((step, index) => {
                return (
                    <div
                        key={index}
                        className={clsx(
                            styles.step,
                            'typography-labels-label-sm',
                            styles[step.status]
                        )}
                    >
                        {STATUS_TO_ICON[step.status] !== ('NS' as IconType) ? (
                            <Icon
                                type={STATUS_TO_ICON[step.status]}
                                color={STATUS_TO_COLOR[step.status]}
                                height={18}
                                width={18}
                            />
                        ) : (
                            <NotStartedIcon
                                color={STATUS_TO_COLOR[step.status]}
                                height={18}
                                width={18}
                            />
                        )}
                        <span
                            style={{
                                color:
                                    step.status === Status.Complete
                                        ? 'var(--color-semantics-color-semantic-success)'
                                        : 'initial',
                            }}
                        >
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default PizzaTracker;
