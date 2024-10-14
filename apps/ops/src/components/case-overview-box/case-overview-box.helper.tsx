import { Statuses } from '@deps/models/case/case';

export const getClassNames = (status: Statuses) => {
    switch (status) {
        case Statuses.InProgress:
            return 'border-semantic-info';
        case Statuses.Exception:
            return 'border-semantic-error';
        case Statuses.Completed:
            return 'border-semantic-success';
        case Statuses.NotStarted:
            return 'border-gray-600';
    }
};
