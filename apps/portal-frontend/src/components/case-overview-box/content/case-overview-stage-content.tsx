import React from 'react';

import StepStatus from '@deps/components/case-overview-box/content/step-status';
import { StepInstance } from '@deps/models/case/step-instance';

export interface CaseOverviewStageContentProps {
    steps: StepInstance[];
}

const CaseOverviewStageContent = ({ steps }: CaseOverviewStageContentProps) => {
    const divider = <div className="my-6 h-0.5 w-full bg-gray-100" />;

    return (
        <div className="w-full flex-col">
            {steps.map((step, index) => (
                <div key={step.id}>
                    <StepStatus
                        status={step.stepStatus}
                        label={step.label}
                        updatedAt={step.updatedAt}
                        createdAt={step.createdAt}
                        info={step.info}
                    />
                    {index < steps.length - 1 && divider}
                </div>
            ))}
        </div>
    );
};

export default CaseOverviewStageContent;
