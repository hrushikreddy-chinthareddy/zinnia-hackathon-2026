import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import DeathAuditFilesTab from './death-audit-files-tab';
import {
    DeathAuditCaseFileTypes,
    DeathAuditFileTypes,
} from './death-audit-files.types';

// Mocks

jest.mock('next-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@zinnia/bloom/components', () => ({
    TabGroup: ({ children }: any) => (
        <div data-testid="tab-group">{children}</div>
    ),
    TabList: ({ children, ...rest }: any) => (
        <div data-testid="tab-list" {...rest}>
            {children}
        </div>
    ),
    TabTrigger: ({ children, value, ...rest }: any) => (
        <button data-testid={`tab-trigger-${value}`} {...rest}>
            {children}
        </button>
    ),
    TabContent: ({ children, ...rest }: any) => (
        <div data-testid="tab-content" {...rest}>
            {children}
        </div>
    ),
}));

// Mock DeathAuditFiles child component to capture props
const mockDeathAuditFiles: jest.Mock = jest.fn(() => (
    <div data-testid="death-audit-files" />
));

jest.mock('./death-audit-files', () => ({
    __esModule: true,
    default: (props: any) => mockDeathAuditFiles(props),
}));

const stepAdditionalData = { value: 'entity-1' } as any;

describe('##DeathAuditFilesTab', () => {
    beforeEach(() => {
        mockDeathAuditFiles.mockClear();
    });

    it('#renders tabs and two DeathAuditFiles sections', () => {
        render(<DeathAuditFilesTab stepAdditionalData={stepAdditionalData} />);

        // Tab headers
        expect(screen.getByTestId('tab-group')).toBeInTheDocument();
        expect(screen.getByTestId('tab-list')).toBeInTheDocument();
        expect(
            screen.getByText('deathAuditFiles.tabs.matchedCase')
        ).toBeInTheDocument();
        expect(
            screen.getByText('deathAuditFiles.tabs.cancelledCase')
        ).toBeInTheDocument();

        // Children are rendered twice with correct props
        expect(mockDeathAuditFiles).toHaveBeenCalledTimes(2);

        // Inspect first call (Matched Case)
        expect(mockDeathAuditFiles).toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
                stepAdditionalData,
                prop: DeathAuditFileTypes.INBOUND,
                objectKey: DeathAuditCaseFileTypes.MATCHED_CASES_FILE,
                title: 'deathAuditFiles.tabs.matchedCase',
            })
        );

        // Inspect second call (Cancelled Case)
        expect(mockDeathAuditFiles).toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
                stepAdditionalData,
                prop: DeathAuditFileTypes.INBOUND,
                objectKey: DeathAuditCaseFileTypes.CANCELLED_CASES_FILE,
                title: 'deathAuditFiles.tabs.cancelledCase',
            })
        );
    });
});
