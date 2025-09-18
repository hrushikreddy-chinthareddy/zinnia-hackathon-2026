import { fireEvent, render, waitFor } from '@testing-library/react';

import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { getAllClientDetails } from '@deps/queries/api/knowledge-base';

import TenantsTab from './tenants-tab';

const mockBrowserLogError = jest.fn();
const mockClient = [
    {
        client: {
            createdAt: null,
            updatedAt: null,
            id: 'client-id-1',
            acronym: 'Common',
            clientName: 'Common',
            sharepointName: 'Common',
            conductorOneAccessId: 'conductorOneAccessId-1',
            notes: 'This is the common SharePoint site. This would be applied to the Common Tenant',
            conductorOneEntitlementId: 'conductorOneEntitlementId-1',
            pageId: 'page-id-1',
            name: 'Common.aspx',
            webUrl: 'https://se2office365.sharepoint.com/sites/spsbgportal/opbase/SitePages/Common.aspx',
            title: 'Common',
            thumbnailWebUrl:
                'https://media.akamai.odsp.cdn.office.net/se2office365.sharepoint.com/_layouts/15/images/sitepagethumbnail.png',
            createdDateTime: '2024-05-27T13:55:36Z',
            lastModifiedDateTime: '2025-06-20T21:40:23Z',
            createdByUser: 'Gaikwad, Mahesh',
            createdByUserEmail: 'Mahesh.Gaikwad@zinnia.com',
            lastModifiedByUser: 'Stamps, Emerson',
            lastModifiedByUserEmail: 'Emerson.Stamps@zinnia.com',
        },
        status: 'PENDING',
    },
    {
        client: {
            createdAt: null,
            updatedAt: null,
            id: '685d4c22262b636047cabd8a',
            acronym: 'Arcus',
            clientName: 'Arcus Investors Life Insurance of North America',
            sharepointName: 'Arcus Investors Life Insurance of North America',
            conductorOneAccessId: 'splib_spsbgportal_opbase_ArcusINLA_read',
            notes: '',
            conductorOneEntitlementId: '2tYJwBmDqQ3nJuPTuLrV9DqsmMT',
            pageId: 'f75ad7b1-bbaf-42f4-9803-9c4eef2ae09c',
            name: 'ArcusInvestorsLifeInsuranceNorthAmerica.aspx',
            webUrl: 'https://se2office365.sharepoint.com/sites/spsbgportal/opbase/SitePages/New_Dashboards/ArcusInvestorsLifeInsuranceNorthAmerica.aspx',
            title: 'Arcus Investors Life Insurance of North America',
            thumbnailWebUrl:
                'https://media.akamai.odsp.cdn.office.net/se2office365.sharepoint.com/_layouts/15/images/sitepagethumbnail.png',
            createdDateTime: '2024-10-15T09:17:57Z',
            lastModifiedDateTime: '2024-10-16T09:29:56Z',
            createdByUser: 'Gaikwad, Mahesh',
            createdByUserEmail: 'Mahesh.Gaikwad@zinnia.com',
            lastModifiedByUser: 'Gaikwad, Mahesh',
            lastModifiedByUserEmail: 'Mahesh.Gaikwad@zinnia.com',
        },
        status: 'PENDING',
    },
];

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));

jest.mock('@deps/queries/api/knowledge-base', () => ({
    getAllClientDetails: jest.fn(),
}));

jest.mock('@deps/utils/browser-logging', () => {
    return {
        browserLogError: (...args: any[]) => mockBrowserLogError(...args),
    };
});

describe('TenantsTab', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
    });

    it('fetches tenants on render', async () => {
        (getAllClientDetails as jest.Mock).mockResolvedValue(mockClient);
        const { getByText } = render(<TenantsTab />);
        await waitFor(() => {
            expect(getAllClientDetails).toHaveBeenCalled();
            expect(getByText(mockClient[0].client.acronym)).toBeInTheDocument();
        });
    });

    it('shows logs when an error occurs while fetching tenants', async () => {
        (getAllClientDetails as jest.Mock).mockRejectedValue(
            new Error('Network failure')
        );
        render(<TenantsTab />);
        await waitFor(() => {
            expect(getAllClientDetails).toHaveBeenCalled();
            expect(mockBrowserLogError).toHaveBeenCalled();
        });
    });

    it('throws an error when no user data is returned', async () => {
        (getAllClientDetails as jest.Mock).mockResolvedValue(undefined);
        const { findByText } = render(<TenantsTab />);
        const errorMessage = await findByText('admin.tenants.noTenantsFound');
        expect(errorMessage).toBeInTheDocument();
    });

    it('filters tenants when a search term is provided', async () => {
        (getAllClientDetails as jest.Mock).mockResolvedValue(mockClient);
        const { getByPlaceholderText, getByText } = render(<TenantsTab />);
        await waitFor(() => {
            expect(getAllClientDetails).toHaveBeenCalled();
        });

        const searchInput = getByPlaceholderText('admin.tenants.search');
        fireEvent.change(searchInput, { target: { value: 'Com' } });

        expect(getByText(mockClient[0].client.acronym)).toBeInTheDocument();
    });

    it('sorts result by created and updated date', async () => {
        (getAllClientDetails as jest.Mock).mockResolvedValue(mockClient);
        const { getByText, findAllByTestId } = render(<TenantsTab />);
        await waitFor(() => {
            expect(getAllClientDetails).toHaveBeenCalled();
        });

        const updatedDateHeader = getByText('admin.tenants.updatedDate');
        fireEvent.click(updatedDateHeader);
        const updatedDateCells = await findAllByTestId('tenant-updated-date');
        const updatedDates = updatedDateCells.map((cell) =>
            cell.textContent!.trim()
        );
        const parsedUpdatedDates = updatedDates.map((date) =>
            new Date(date).getTime()
        );
        const expectedSorted = [...parsedUpdatedDates].sort((a, b) => a - b);
        expect(parsedUpdatedDates).toEqual(expectedSorted);

        const createdDateHeader = getByText('admin.tenants.createdDate');
        fireEvent.click(createdDateHeader);

        const createdDateCells = await findAllByTestId('tenant-created-date');
        const createdDates = createdDateCells.map((cell) =>
            cell.textContent!.trim()
        );
        const parsedCreatedDates = createdDates.map((date) =>
            new Date(date).getTime()
        );
        const expectedCreatedSorted = [...parsedCreatedDates].sort(
            (a, b) => a - b
        );
        expect(parsedCreatedDates).toEqual(expectedCreatedSorted);
    });

    it('on clearing the search term it again displays all tenants', async () => {
        (getAllClientDetails as jest.Mock).mockResolvedValue(mockClient);
        const { getByPlaceholderText, getByRole, getByText } = render(
            <TenantsTab />
        );
        await waitFor(() => {
            expect(getAllClientDetails).toHaveBeenCalled();
        });

        const searchInput = getByPlaceholderText('admin.tenants.search');
        fireEvent.change(searchInput, { target: { value: 'xyz' } });

        const clearButton = getByRole('button', { name: /clearInput/i });
        fireEvent.click(clearButton);
        expect(getByText(mockClient[0].client.acronym)).toBeInTheDocument();
    });

    it('toggles sort direction when column header is clicked', async () => {
        (getAllClientDetails as jest.Mock).mockResolvedValue(mockClient);
        const { getByText, findAllByTestId } = render(<TenantsTab />);
        await waitFor(() => {
            expect(getAllClientDetails).toHaveBeenCalled();
        });

        const createdDateHeader = getByText('admin.tenants.createdDate');
        fireEvent.click(createdDateHeader);

        const createdDateCells = await findAllByTestId('tenant-created-date');
        const createdDates = createdDateCells.map((cell) =>
            cell.textContent!.trim()
        );
        const parsedCreatedDates = createdDates.map((date) =>
            new Date(date).getTime()
        );
        const expectedSorted = [...parsedCreatedDates].sort((a, b) => a - b);
        expect(parsedCreatedDates).toEqual(expectedSorted);

        fireEvent.click(createdDateHeader); // toggle sort direction

        const createdDateCellsAfterToggle = await findAllByTestId(
            'tenant-created-date'
        );
        const createdDatesAfterToggle = createdDateCellsAfterToggle.map(
            (cell) => cell.textContent!.trim()
        );
        const parsedCreatedDatesAfterToggle = createdDatesAfterToggle.map(
            (date) => new Date(date).getTime()
        );
        const expectedSortedAfterToggle = [
            ...parsedCreatedDatesAfterToggle,
        ].sort((a, b) => b - a);
        expect(parsedCreatedDatesAfterToggle).toEqual(
            expectedSortedAfterToggle
        );
    });
});
