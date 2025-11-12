import { useContext, useMemo } from 'react';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { FieldSize } from '@deps/components/fields/field';
import Select from '@deps/components/select/select';
import { ExceptionStatus } from '@deps/queries/tanstack/dashboard/types';

import { IssueCountsByStatusContext } from '../sections/issue-counts-by-status/context/issue-counts-by-status-context';
import { exceptionStatusMapping } from '../sections/issue-counts-by-status/utlis';

export const ExceptionStatusOptions: {
    label: string;
    displayText: string;
    value: ExceptionStatus;
}[] = [
    {
        label: 'Unresolved',
        displayText: 'Unresolved',
        value: ExceptionStatus.UNRESOLVED,
    },
    {
        label: 'Resolved',
        displayText: 'Resolved',
        value: ExceptionStatus.RESOLVED,
    },
];

export const ExceptionStatusFilter = () => {
    const { setExceptionStatus, exceptionStatus } = useContext(
        IssueCountsByStatusContext
    );

    const handleIssueChange = (issue: ExceptionStatus) => {
        const includesBothStatus =
            exceptionStatus.includes(ExceptionStatus.UNRESOLVED) &&
            exceptionStatus.includes(ExceptionStatus.RESOLVED);
        if (includesBothStatus) {
            setExceptionStatus(
                exceptionStatus.filter(
                    (status) =>
                        !exceptionStatusMapping[issue].includes(
                            status as ExceptionStatus
                        )
                )
            );
        } else if (!exceptionStatus.includes(issue)) {
            setExceptionStatus([
                ...exceptionStatus,
                ...exceptionStatusMapping[issue],
            ]);
        } else {
            setExceptionStatus([]);
        }
    };

    const convertExceptionStatusIntoValueObj = useMemo(
        () =>
            Object.fromEntries(
                (Object.keys(exceptionStatusMapping) as ExceptionStatus[])
                    .filter((status) => exceptionStatus.includes(status))
                    .map((status) => [status, status])
            ),
        [exceptionStatus]
    );

    return (
        <Select
            maxContentWidth
            label="Issue status"
            placeholder="All"
            options={ExceptionStatusOptions}
            value={convertExceptionStatusIntoValueObj}
            size={FieldSize.XS}
            isMultiselect
            className={sharedStyles.multiselectDropdowns}
            onChange={(val) => handleIssueChange(val as ExceptionStatus)}
        />
    );
};
