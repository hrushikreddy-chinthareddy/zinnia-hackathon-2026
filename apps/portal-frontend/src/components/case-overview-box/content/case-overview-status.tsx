import React from 'react';

import { toTitleCase } from '@deps/helpers/string.helper';
import { useStatusInfo } from '@deps/hooks/useStatusInfo';
import { CaseOverviewTest } from '@deps/jest/constants/test-id-constants';
import { Statuses } from '@deps/models/case/case';
import { ExceptionStatuses } from '@deps/models/case/exception-instance';

export interface CaseOverviewStatusProps {
    status?: ExceptionStatuses | Statuses;
    reason: string;
    detailedReason: string;
    updatedAt: string;
    createdAt?: string;
    category?: string;
}

const CaseOverviewStatus: React.FC<CaseOverviewStatusProps> = ({ category, status, reason, detailedReason, updatedAt }) => {
    // Function to check if status is in ExceptionStatuses
    const isExceptionStatus = (status?: ExceptionStatuses | Statuses): status is ExceptionStatuses => {
        return Object.values(ExceptionStatuses).includes(status as ExceptionStatuses);
    };

    // Function to check if status is in Statuses
    const isStatus = (status?: ExceptionStatuses | Statuses): status is Statuses => {
        return Object.values(Statuses).includes(status as Statuses);
    };

    let statusToDisplay: Statuses;

    if (isExceptionStatus(status)) {
        statusToDisplay = status === ExceptionStatuses.Resolved ? Statuses.Completed : Statuses.Exception;
    } else if (isStatus(status)) {
        statusToDisplay = status;
    } else {
        // default case if status is neither in Statuses nor ExceptionStatuses
        statusToDisplay = Statuses.Exception;
    }

    const categoryToDisplay = toTitleCase(category ? category : reason);

    const { statusIcon, iconClassNames, reasonClassNames, updatedText, reasonText, detailedReasonText } = useStatusInfo(
        statusToDisplay,
        updatedAt,
        reason,
        detailedReason
    );

    return (
        <div data-testid={CaseOverviewTest.CASE_OVERVIEW} className={'flex'}>
            <div className={`${iconClassNames} mt-1`}>{statusIcon}</div>
            <div className={'ml-4 flex flex-col'}>
                <span className={`font-primary text-label-sm-alt font-medium text-gray-600`}>{updatedText}</span>
                <span className={reasonClassNames}>
                    {reasonText}
                    <span className="font-primary text-base font-semibold text-gray-900">{` - ${categoryToDisplay}`}</span>
                </span>
                {!!detailedReasonText && <span className="font-secondary text-base font-normal text-gray-900">{detailedReasonText}</span>}
            </div>
        </div>
    );
};

export default CaseOverviewStatus;
