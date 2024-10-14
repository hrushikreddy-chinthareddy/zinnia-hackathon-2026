import React from 'react';

import Popover, { PopoverPlacement } from '@deps/components/popover/popover';
import { useStatusInfo } from '@deps/hooks/useStatusInfo';
import { StepStatusTest } from '@deps/jest/constants/test-id-constants';
import { Statuses } from '@deps/models/case/case';
import { ExceptionStatuses } from '@deps/models/case/exception-instance';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';

export interface StepStatusProps {
    status?: Statuses | ExceptionStatuses;
    label: string;
    updatedAt: string;
    createdAt: string;
    info?: string;
}

const StepStatus: React.FC<StepStatusProps> = ({ status, label, updatedAt, info }) => {
    if (status === ExceptionStatuses.New) {
        status = Statuses.NotStarted;
    }

    if (status === ExceptionStatuses.Resolved) {
        status = Statuses.Completed;
    }

    const { statusIcon, iconClassNames, reasonClassNames, updatedText, reasonText } = useStatusInfo(status, updatedAt, label, '');

    return (
        <div data-testid={StepStatusTest.STEP_STATUS} className={'flex'}>
            <div className={iconClassNames}>{statusIcon}</div>
            <div className={'ml-4 flex flex-col'}>
                <span className={`font-primary text-sm leading-4.5 text-gray-600`}>{updatedText}</span>
                <span className={reasonClassNames}>
                    {reasonText}
                    <span className="font-primary text-base font-semibold text-gray-900">{` - ${label}`}</span>
                </span>
            </div>
            {info && (
                <div className="ml-auto mt-auto" data-testid={StepStatusTest.STEP_INFO}>
                    <Popover body={info} placement={PopoverPlacement.BottomLeft} title={label}>
                        <CircleInfoIcon width={16} height={16} className="text-primary" />
                    </Popover>
                </div>
            )}
        </div>
    );
};

export default StepStatus;
