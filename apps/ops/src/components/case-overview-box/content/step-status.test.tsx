import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import StepStatus from '@deps/components/case-overview-box/content/step-status';
import { StepStatusTest } from '@deps/jest/constants/test-id-constants';
import { Statuses } from '@deps/models/case/case';

describe('StepStatus', () => {
    it('should render successfully', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        render(
            <StepStatus
                status={Statuses.InProgress}
                label="Reason"
                updatedAt={new Date().toISOString()}
                createdAt={yesterday.toISOString()}
            />
        );
        expect(screen.getByTestId(StepStatusTest.STEP_STATUS)).toBeInTheDocument();
    });

    it('should render without an icon and popover if no info is passed', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        render(
            <StepStatus
                status={Statuses.InProgress}
                label="Reason"
                updatedAt={new Date().toISOString()}
                createdAt={yesterday.toISOString()}
            />
        );
        expect(screen.queryByTestId(StepStatusTest.STEP_INFO)).not.toBeInTheDocument();
    });

    it('should render with an icon and popover when info is passed', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        render(
            <StepStatus
                status={Statuses.InProgress}
                label="Reason"
                updatedAt={new Date().toISOString()}
                createdAt={yesterday.toISOString()}
                info="Sample reason"
            />
        );
        expect(screen.getByTestId(StepStatusTest.STEP_INFO)).toBeInTheDocument();
    });
});
