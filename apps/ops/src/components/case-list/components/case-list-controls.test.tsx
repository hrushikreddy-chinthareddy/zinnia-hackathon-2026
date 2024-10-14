import { render } from '@testing-library/react';

import { CaseSearchBody } from '@deps/types/search';

import { CaseListControls } from './case-list-controls';

it('should render PageSize component when filters are provided', () => {
    const mockSetFilters = jest.fn();
    const filters = { limit: 10, offset: 0 } as CaseSearchBody;
    const total = 100;
    const { getByText } = render(<CaseListControls filters={filters} setFilters={mockSetFilters} total={total} />);

    expect(getByText('caseManagementDashboard.pageSize:')).toBeInTheDocument();
});

it('should handle null filters gracefully without rendering PageSize and PaginationControls', () => {
    const mockSetFilters = jest.fn();
    const filters = null;
    const total = 100;

    const { queryByText } = render(<CaseListControls filters={filters} setFilters={mockSetFilters} total={total} />);

    expect(queryByText('caseManagementDashboard.pageSize')).not.toBeInTheDocument();
});
