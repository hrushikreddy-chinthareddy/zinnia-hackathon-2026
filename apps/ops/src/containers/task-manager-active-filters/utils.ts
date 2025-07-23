import { TaskLabel, TaskStatus } from '@deps/models/case/task-instance';

export const customLabelMap: Record<string, string> = Object.keys(
    TaskLabel
).reduce((acc, key) => {
    const statusValue = TaskStatus[key as keyof typeof TaskStatus];
    const labelValue = TaskLabel[key as keyof typeof TaskLabel];

    if (statusValue && labelValue) {
        acc[statusValue] = labelValue;
    }

    return acc;
}, {} as Record<string, string>);

export const formatLabel = (val: string): string => {
    return val.includes('_')
        ? val
              .split('_')
              .map(
                  (word) =>
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              )
              .join(' ')
        : val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
};
