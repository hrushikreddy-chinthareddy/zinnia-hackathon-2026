import React from 'react';

import { useStatusInfo } from '@deps/hooks/useStatusInfo';
import { Statuses } from '@deps/models/case/case';

export interface AdditionalStepStatusProps {
    status: Statuses;
    updatedAt: string;
}

const AdditionalStepStatus: React.FC<AdditionalStepStatusProps> = ({
    status,
    updatedAt,
}) => {
    const { statusIcon, iconClassNames, reasonClassNames, reasonText } =
        useStatusInfo(status, updatedAt, '', '');

    return (
        <div>
            <div className={'flex my-2'}>
                <div className={`${iconClassNames} `}>{statusIcon}</div>
                <div className={`ml-4 ${reasonClassNames}`}>{reasonText}</div>
            </div>
            <span className={`text-label-md-alt font-secondary text-gray-400`}>
                {updatedAt}
            </span>
        </div>
    );
};

export default AdditionalStepStatus;
