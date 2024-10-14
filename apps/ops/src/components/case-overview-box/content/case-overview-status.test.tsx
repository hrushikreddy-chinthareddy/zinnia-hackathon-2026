import { render, screen } from '@testing-library/react';

import CaseOverviewStatus from '@deps/components/case-overview-box/content/case-overview-status';
import { CaseOverviewTest } from '@deps/jest/constants/test-id-constants';
import { Statuses } from '@deps/models/case/case';
import '@testing-library/jest-dom';

describe('StatusCaseOverview', () => {
    it('should render successfully', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        render(
            <CaseOverviewStatus
                status={Statuses.InProgress}
                reason="Reason"
                detailedReason="Detailed Reason"
                updatedAt={new Date().toISOString()}
                createdAt={yesterday.toISOString()}
            />
        );
        expect(screen.getByTestId(CaseOverviewTest.CASE_OVERVIEW)).toBeInTheDocument();
    });
});
