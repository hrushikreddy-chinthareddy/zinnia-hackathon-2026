import { FC, useMemo } from 'react';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { CaseStatusType } from '@deps/components/dashboard/sections/active-aging/context/active-aging-context';
import { caseStatusMap } from '@deps/components/dashboard/utils';
import { FieldSize } from '@deps/components/fields/field';
import Select from '@deps/components/select/select';
import { Statuses } from '@deps/models/case/case';
interface CaseStatusOption {
    label: string;
    displayText: string;
    value: Statuses;
}

interface CaseStatusFilterProps {
    handleChangeCallback: (val: CaseStatusType) => void;
    caseStatus: CaseStatusType;
    options: CaseStatusOption[];
}

export const CaseStatusFilter: FC<CaseStatusFilterProps> = ({ caseStatus, handleChangeCallback, options }) => {
    const handleCaseStatusChange = (status: Statuses) => {
        const newStatus = { ...caseStatus };

        if (newStatus[status]) {
            //dont delete if its the only one selected
            if (Object.keys(newStatus).length === 1) {
                return;
            }
            delete newStatus[status];
        } else {
            newStatus[status] = caseStatusMap[status];
        }
        handleChangeCallback(newStatus);
    };

    // Why do this? Basically to handle a situation where the option Statuses.EXCEPTION should be rendered in the value as "Not in good order"
    // We take the existing values and convert their keys to values. This gets us the correct display text to pass to the multiselect
    const caseStatusKeys = useMemo(() => Object.keys(caseStatus), [caseStatus]);
    const convertCaseStatusKeysToValuesInObject = useMemo(
        () =>
            caseStatusKeys.reduce((acc: { [key in Statuses]?: string }, key) => {
                acc[key as Statuses] = caseStatusMap[key as Statuses];
                return acc;
            }, {}),
        [caseStatusKeys]
    );

    return (
        <Select
            maxContentWidth
            label="Case status"
            options={options}
            value={convertCaseStatusKeysToValuesInObject}
            size={FieldSize.XS}
            isMultiselect
            className={sharedStyles.multiselectDropdowns}
            onChange={val => handleCaseStatusChange(val as Statuses)}
        />
    );
};
