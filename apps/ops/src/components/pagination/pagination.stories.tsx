import { Meta } from '@storybook/react';
import { GridApi } from 'ag-grid-community';

import PaginationControlsComponent, { PaginationControlsProps } from './pagination';
import '@deps/styles/styles.css';

class MockGridApi extends GridApi {
    paginationGetCurrentPage() {
        return 1;
    }

    paginationGetTotalPages() {
        return 10;
    }

    paginationIsLastPageFound() {
        return true;
    }

    // eslint-disable-next-line
    paginationGoToFirstPage() {}

    // eslint-disable-next-line
    paginationGoToPreviousPage() {}

    // eslint-disable-next-line
    paginationGoToNextPage() {}

    // eslint-disable-next-line
    paginationGoToLastPage() {}

    // eslint-disable-next-line
    paginationGoToPage = (pageNumber: number) => {};

    // eslint-disable-next-line
    addEventListener(eventType: string, listener: () => void) {}

    // eslint-disable-next-line
    removeEventListener(eventType: string, listener: () => void) {}
}

const mockGridApi = new MockGridApi();

export default {
    title: 'Components/Pagination/PaginationControls',
    component: PaginationControlsComponent,
    decorators: [
        Story => (
            <div className="h-screen w-2/3 p-10">
                <Story />
            </div>
        ),
    ],
    argTypes: {
        gridApi: {
            control: {
                disable: true,
            },
        },
    },
} as Meta<typeof PaginationControlsComponent>;

const PaginationControlsTemplate: React.VFC<PaginationControlsProps> = args => <PaginationControlsComponent {...args} />;

export const PaginationControls = {
    ...PaginationControlsTemplate,
    args: {
        gridApi: mockGridApi,
        currentPageDefault: 1,
        totalPagesDefault: 10,
    },
};
