import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import { BankingFields } from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helpers';
import {
    FormDataContext,
    defaultFormDataContext,
} from '@deps/contexts/OtpWithdrawalFormContext';
import { TaskType } from '@deps/models/case/task';
import { Carrier } from '@deps/models/case/withdrawal/case';
import { DisbursementParts } from '@deps/models/case/withdrawal/disbursement-types';

import SelectParticipantId from './select-participant-id';

// Mock the dependencies
jest.mock('@deps/models/case/withdrawal/case', () => ({
    ...jest.requireActual('@deps/models/case/withdrawal/case'),
    getFilteredParticipantCompanies: jest.fn(),
    filterParticipantIdRules: [
        {
            clients: 'FLIC',
            taskType: ['OFTFormInputTask'],
            excludeParticipantCodes: ['0226'],
        },
        {
            clients: 'USAA',
            taskType: ['SSWFormInputTask', 'RMDFormInputTask'],
            excludeParticipantCodes: ['3179', '4516', '0000'],
        },
    ],
}));

jest.mock('@deps/components/autocomplete/autocomplete', () => ({
    __esModule: true,
    default: (props: any) => (
        <div data-testid="autocomplete-mock">
            <label htmlFor="autocomplete-select">{props.label}</label>
            <select
                id="autocomplete-select"
                data-testid={props['data-testid']}
                value={props.value}
                onChange={(e) => props.onChange(e.target.value)}
                disabled={props.disabled}
                className={props.className}
            >
                <option value="">Select...</option>
                {props.options.map((option: any) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    ),
}));

afterEach(cleanup);

const { getFilteredParticipantCompanies } = jest.requireMock(
    '@deps/models/case/withdrawal/case'
);

const mockParticipantCompanies = [
    {
        code: '3179',
        companyName: 'AIG ANNUITIES-VAR & IDX/VAR.ANN.LIFE INS CO (3179)',
    },
    {
        code: '4516',
        companyName: 'AMERICAN GENERAL LIFE/AIG ANN.-VAR&INDEX (4516)',
    },
    {
        code: '0000',
        companyName: 'Disburse to Broker',
    },
    {
        code: '4535',
        companyName: 'AXA EQUITABLE LIFE INSURANCE COMPANY (4535)',
    },
    {
        code: '0226',
        companyName: 'TEST COMPANY (0226)',
    },
];

const mockFlicOftCompanies = [
    {
        code: '3055',
        companyName: 'DELAWARE LIFE INSURANCE COMPANY(3055)',
    },
    {
        code: '4756',
        companyName: 'RELIANCE STANDARD LIFE INSURANCE COMPANY(4756)',
    },
];

const mockDisbursementInformation = {
    fieldLabel: 'DTCC Participant ID',
    fieldName: BankingFields.ParticipantId,
    disbursementInformation: {
        participantId: '',
    } as DisbursementParts,
    isFormStateReadOnly: false,
    onDataChange: jest.fn(),
};

describe('SelectParticipantId Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        getFilteredParticipantCompanies.mockReturnValue(
            mockParticipantCompanies
        );
    });

    describe('Component Rendering', () => {
        it('should render the component without errors', () => {
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        initialForm: {
                            ...defaultFormDataContext.initialForm,
                            carrier: Carrier.DLIC,
                            taskType: TaskType.Withdrawal,
                        },
                    }}
                >
                    <SelectParticipantId {...mockDisbursementInformation} />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('autocomplete-mock')).toBeInTheDocument();
            expect(
                screen.getByLabelText('DTCC Participant ID')
            ).toBeInTheDocument();
        });

        it('should render with correct field label', () => {
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        initialForm: {
                            ...defaultFormDataContext.initialForm,
                            carrier: Carrier.DLIC,
                            taskType: TaskType.Withdrawal,
                        },
                    }}
                >
                    <SelectParticipantId
                        {...mockDisbursementInformation}
                        fieldLabel="Custom Participant Label"
                    />
                </FormDataContext.Provider>
            );

            expect(
                screen.getByLabelText('Custom Participant Label')
            ).toBeInTheDocument();
        });

        it('should render with initial participantId value', () => {
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        initialForm: {
                            ...defaultFormDataContext.initialForm,
                            carrier: Carrier.DLIC,
                            taskType: TaskType.Withdrawal,
                        },
                    }}
                >
                    <SelectParticipantId
                        {...mockDisbursementInformation}
                        disbursementInformation={
                            {
                                participantId: '4535',
                            } as DisbursementParts
                        }
                    />
                </FormDataContext.Provider>
            );

            const select = screen.getByTestId(
                'participantId'
            ) as HTMLSelectElement;
            expect(select.value).toBe('4535');
        });

        it('should render with empty value when participantId is null', () => {
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        initialForm: {
                            ...defaultFormDataContext.initialForm,
                            carrier: Carrier.DLIC,
                            taskType: TaskType.Withdrawal,
                        },
                    }}
                >
                    <SelectParticipantId
                        {...mockDisbursementInformation}
                        disbursementInformation={
                            {
                                participantId: null,
                            } as DisbursementParts
                        }
                    />
                </FormDataContext.Provider>
            );

            const select = screen.getByTestId(
                'participantId'
            ) as HTMLSelectElement;
            expect(select.value).toBe('');
        });
    });

    describe('getFilteredParticipantCompanies Integration', () => {
        it('should call getFilteredParticipantCompanies with correct carrier and taskType', () => {
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        initialForm: {
                            ...defaultFormDataContext.initialForm,
                            carrier: Carrier.DLIC,
                            taskType: TaskType.Withdrawal,
                        },
                    }}
                >
                    <SelectParticipantId {...mockDisbursementInformation} />
                </FormDataContext.Provider>
            );

            expect(getFilteredParticipantCompanies).toHaveBeenCalledWith(
                Carrier.DLIC,
                TaskType.Withdrawal
            );
        });

        it('should call getFilteredParticipantCompanies for FLIC OFT', () => {
            getFilteredParticipantCompanies.mockReturnValue(
                mockFlicOftCompanies
            );

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        initialForm: {
                            ...defaultFormDataContext.initialForm,
                            carrier: Carrier.FLIC,
                            taskType: TaskType.OFT,
                        },
                    }}
                >
                    <SelectParticipantId {...mockDisbursementInformation} />
                </FormDataContext.Provider>
            );

            expect(getFilteredParticipantCompanies).toHaveBeenCalledWith(
                Carrier.FLIC,
                TaskType.OFT
            );
        });

        it('should display only FLIC OFT companies when carrier is FLIC and taskType is OFT', () => {
            getFilteredParticipantCompanies.mockReturnValue(
                mockFlicOftCompanies
            );

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        initialForm: {
                            ...defaultFormDataContext.initialForm,
                            carrier: Carrier.FLIC,
                            taskType: TaskType.OFT,
                        },
                    }}
                >
                    <SelectParticipantId {...mockDisbursementInformation} />
                </FormDataContext.Provider>
            );

            const select = screen.getByTestId(
                'participantId'
            ) as HTMLSelectElement;
            const options = Array.from(select.options).filter(
                (opt) => opt.value !== ''
            );

            expect(options).toHaveLength(2);
            expect(options[0].textContent).toBe(
                'DELAWARE LIFE INSURANCE COMPANY(3055)'
            );
            expect(options[1].textContent).toBe(
                'RELIANCE STANDARD LIFE INSURANCE COMPANY(4756)'
            );
        });
    });

    describe('Exclusion Rules (filterParticipantIdRules)', () => {
        it('should exclude participant codes based on filterParticipantIdRules for FLIC OFT', () => {
            // FLIC OFT should exclude '0226'
            const companiesWithExcluded = [
                ...mockFlicOftCompanies,
                {
                    code: '0226',
                    companyName: 'TEST COMPANY (0226)',
                },
            ];
            getFilteredParticipantCompanies.mockReturnValue(
                companiesWithExcluded
            );

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        initialForm: {
                            ...defaultFormDataContext.initialForm,
                            carrier: Carrier.FLIC,
                            taskType: TaskType.OFT,
                        },
                    }}
                >
                    <SelectParticipantId {...mockDisbursementInformation} />
                </FormDataContext.Provider>
            );

            const select = screen.getByTestId(
                'participantId'
            ) as HTMLSelectElement;
            const options = Array.from(select.options).filter(
                (opt) => opt.value !== ''
            );

            // Should have 2 options (0226 excluded)
            expect(options).toHaveLength(2);
            expect(options.find((opt) => opt.value === '0226')).toBeUndefined();
        });

        it('should exclude participant codes based on filterParticipantIdRules for USAA SSW', () => {
            // USAA SSW should exclude '3179', '4516', '0000'
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        initialForm: {
                            ...defaultFormDataContext.initialForm,
                            carrier: Carrier.USAA,
                            taskType: TaskType.SSW,
                        },
                    }}
                >
                    <SelectParticipantId {...mockDisbursementInformation} />
                </FormDataContext.Provider>
            );

            const select = screen.getByTestId(
                'participantId'
            ) as HTMLSelectElement;
            const options = Array.from(select.options).filter(
                (opt) => opt.value !== ''
            );

            // Should have 2 options (3179, 4516, 0000 excluded from 5 total)
            expect(options).toHaveLength(2);
            expect(options.find((opt) => opt.value === '3179')).toBeUndefined();
            expect(options.find((opt) => opt.value === '4516')).toBeUndefined();
            expect(options.find((opt) => opt.value === '0000')).toBeUndefined();
            expect(options.find((opt) => opt.value === '4535')).toBeDefined();
            expect(options.find((opt) => opt.value === '0226')).toBeDefined();
        });

        it('should exclude participant codes based on filterParticipantIdRules for USAA RMD', () => {
            // USAA RMD should also exclude '3179', '4516', '0000' (same rule as SSW)
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        initialForm: {
                            ...defaultFormDataContext.initialForm,
                            carrier: Carrier.USAA,
                            taskType: TaskType.RMD,
                        },
                    }}
                >
                    <SelectParticipantId {...mockDisbursementInformation} />
                </FormDataContext.Provider>
            );

            const select = screen.getByTestId(
                'participantId'
            ) as HTMLSelectElement;
            const options = Array.from(select.options).filter(
                (opt) => opt.value !== ''
            );

            expect(options).toHaveLength(2);
            expect(options.find((opt) => opt.value === '3179')).toBeUndefined();
            expect(options.find((opt) => opt.value === '4516')).toBeUndefined();
            expect(options.find((opt) => opt.value === '0000')).toBeUndefined();
        });

        it('should not exclude any codes when no matching rule exists', () => {
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        initialForm: {
                            ...defaultFormDataContext.initialForm,
                            carrier: Carrier.DLIC,
                            taskType: TaskType.Withdrawal,
                        },
                    }}
                >
                    <SelectParticipantId {...mockDisbursementInformation} />
                </FormDataContext.Provider>
            );

            const select = screen.getByTestId(
                'participantId'
            ) as HTMLSelectElement;
            const options = Array.from(select.options).filter(
                (opt) => opt.value !== ''
            );

            // Should have all 5 options (no exclusions)
            expect(options).toHaveLength(5);
        });
    });

    describe('Participant Options Mapping', () => {
        it('should map participant companies to dropdown options with correct format', () => {
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        initialForm: {
                            ...defaultFormDataContext.initialForm,
                            carrier: Carrier.DLIC,
                            taskType: TaskType.Withdrawal,
                        },
                    }}
                >
                    <SelectParticipantId {...mockDisbursementInformation} />
                </FormDataContext.Provider>
            );

            const select = screen.getByTestId(
                'participantId'
            ) as HTMLSelectElement;
            const firstOption = select.options[1]; // Skip the "Select..." option

            expect(firstOption.value).toBe('3179');
            expect(firstOption.textContent).toBe(
                'AIG ANNUITIES-VAR & IDX/VAR.ANN.LIFE INS CO (3179)'
            );
        });

        it('should handle empty participant companies array', () => {
            getFilteredParticipantCompanies.mockReturnValue([]);

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        initialForm: {
                            ...defaultFormDataContext.initialForm,
                            carrier: Carrier.DLIC,
                            taskType: TaskType.Withdrawal,
                        },
                    }}
                >
                    <SelectParticipantId {...mockDisbursementInformation} />
                </FormDataContext.Provider>
            );

            const select = screen.getByTestId(
                'participantId'
            ) as HTMLSelectElement;
            const options = Array.from(select.options).filter(
                (opt) => opt.value !== ''
            );

            expect(options).toHaveLength(0);
        });
    });

    describe('User Interaction', () => {
        it('should call onDataChange when a participant is selected', () => {
            const mockOnDataChange = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        initialForm: {
                            ...defaultFormDataContext.initialForm,
                            carrier: Carrier.DLIC,
                            taskType: TaskType.Withdrawal,
                        },
                    }}
                >
                    <SelectParticipantId
                        {...mockDisbursementInformation}
                        onDataChange={mockOnDataChange}
                    />
                </FormDataContext.Provider>
            );

            const select = screen.getByTestId(
                'participantId'
            ) as HTMLSelectElement;
            fireEvent.change(select, { target: { value: '4535' } });

            expect(mockOnDataChange).toHaveBeenCalledTimes(1);
        });

        it('should update participantId in disbursementInformation when selection changes', () => {
            const mockOnDataChange = jest.fn((callback) => {
                const result = callback({ participantId: '' });
                expect(result).toEqual({ participantId: '4535' });
            });

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        initialForm: {
                            ...defaultFormDataContext.initialForm,
                            carrier: Carrier.DLIC,
                            taskType: TaskType.Withdrawal,
                        },
                    }}
                >
                    <SelectParticipantId
                        {...mockDisbursementInformation}
                        onDataChange={mockOnDataChange}
                    />
                </FormDataContext.Provider>
            );

            const select = screen.getByTestId(
                'participantId'
            ) as HTMLSelectElement;
            fireEvent.change(select, { target: { value: '4535' } });

            expect(mockOnDataChange).toHaveBeenCalled();
        });

        it('should preserve other disbursementInformation properties when updating participantId', () => {
            const mockOnDataChange = jest.fn((callback) => {
                const result = callback({
                    participantId: '',
                    otherProperty: 'test',
                });
                expect(result).toEqual({
                    participantId: '3179',
                    otherProperty: 'test',
                });
            });

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        initialForm: {
                            ...defaultFormDataContext.initialForm,
                            carrier: Carrier.DLIC,
                            taskType: TaskType.Withdrawal,
                        },
                    }}
                >
                    <SelectParticipantId
                        {...mockDisbursementInformation}
                        onDataChange={mockOnDataChange}
                    />
                </FormDataContext.Provider>
            );

            const select = screen.getByTestId(
                'participantId'
            ) as HTMLSelectElement;
            fireEvent.change(select, { target: { value: '3179' } });

            expect(mockOnDataChange).toHaveBeenCalled();
        });
    });

    describe('Read-Only State', () => {
        it('should disable the autocomplete when isFormStateReadOnly is true', () => {
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        initialForm: {
                            ...defaultFormDataContext.initialForm,
                            carrier: Carrier.DLIC,
                            taskType: TaskType.Withdrawal,
                        },
                    }}
                >
                    <SelectParticipantId
                        {...mockDisbursementInformation}
                        isFormStateReadOnly={true}
                    />
                </FormDataContext.Provider>
            );

            const select = screen.getByTestId(
                'participantId'
            ) as HTMLSelectElement;
            expect(select).toBeDisabled();
        });

        it('should enable the autocomplete when isFormStateReadOnly is false', () => {
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        initialForm: {
                            ...defaultFormDataContext.initialForm,
                            carrier: Carrier.DLIC,
                            taskType: TaskType.Withdrawal,
                        },
                    }}
                >
                    <SelectParticipantId
                        {...mockDisbursementInformation}
                        isFormStateReadOnly={false}
                    />
                </FormDataContext.Provider>
            );

            const select = screen.getByTestId(
                'participantId'
            ) as HTMLSelectElement;
            expect(select).not.toBeDisabled();
        });
    });

    describe('Context Integration', () => {
        it('should handle missing initialForm gracefully', () => {
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        // @ts-expect-error - Testing undefined initialForm
                        initialForm: undefined,
                    }}
                >
                    <SelectParticipantId {...mockDisbursementInformation} />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('autocomplete-mock')).toBeInTheDocument();
            expect(getFilteredParticipantCompanies).toHaveBeenCalledWith(
                undefined,
                undefined
            );
        });

        it('should handle missing carrier in initialForm', () => {
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        initialForm: {
                            ...defaultFormDataContext.initialForm,
                            // @ts-expect-error - Testing undefined carrier
                            carrier: undefined,
                            taskType: TaskType.Withdrawal,
                        },
                    }}
                >
                    <SelectParticipantId {...mockDisbursementInformation} />
                </FormDataContext.Provider>
            );

            expect(getFilteredParticipantCompanies).toHaveBeenCalledWith(
                undefined,
                TaskType.Withdrawal
            );
        });

        it('should handle missing taskType in initialForm', () => {
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        initialForm: {
                            ...defaultFormDataContext.initialForm,
                            carrier: Carrier.DLIC,
                            // @ts-expect-error - Testing undefined taskType
                            taskType: undefined,
                        },
                    }}
                >
                    <SelectParticipantId {...mockDisbursementInformation} />
                </FormDataContext.Provider>
            );

            expect(getFilteredParticipantCompanies).toHaveBeenCalledWith(
                Carrier.DLIC,
                undefined
            );
        });
    });

    describe('Field Name Customization', () => {
        it('should use custom fieldName for data-testid', () => {
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        initialForm: {
                            ...defaultFormDataContext.initialForm,
                            carrier: Carrier.DLIC,
                            taskType: TaskType.Withdrawal,
                        },
                    }}
                >
                    <SelectParticipantId
                        {...mockDisbursementInformation}
                        fieldName={'customParticipantField' as BankingFields}
                    />
                </FormDataContext.Provider>
            );

            expect(
                screen.getByTestId('customParticipantField')
            ).toBeInTheDocument();
        });

        it('should update correct field name in onDataChange callback', () => {
            const mockOnDataChange = jest.fn((callback) => {
                const result = callback({});
                expect(result).toHaveProperty('customFieldName');
                expect(result.customFieldName).toBe('4535');
            });

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        initialForm: {
                            ...defaultFormDataContext.initialForm,
                            carrier: Carrier.DLIC,
                            taskType: TaskType.Withdrawal,
                        },
                    }}
                >
                    <SelectParticipantId
                        {...mockDisbursementInformation}
                        fieldName={'customFieldName' as BankingFields}
                        onDataChange={mockOnDataChange}
                    />
                </FormDataContext.Provider>
            );

            const select = screen.getByTestId(
                'customFieldName'
            ) as HTMLSelectElement;
            fireEvent.change(select, { target: { value: '4535' } });

            expect(mockOnDataChange).toHaveBeenCalled();
        });
    });
});
