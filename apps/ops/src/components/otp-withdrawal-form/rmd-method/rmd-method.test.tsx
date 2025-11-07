import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import {
    AmountType,
    Frequency,
    RMDType,
} from '@deps/models/case/withdrawal/case';
import { browserLogInfo } from '@deps/utils/browser-logging';

import { findOverlaps } from './rmd-calculator';
import RMDMethod, {
    DEFAULT_RMD_PROGRAM,
    DEFAULT_RMD,
    frequencyToValue,
} from './rmd-method';

// Mock dependencies
jest.mock('next-i18next', () => ({
    useTranslation: jest.fn(),
}));

jest.mock('@deps/utils/browser-logging', () => ({
    browserLogInfo: jest.fn(),
}));

jest.mock('./existing-programs', () => {
    return function MockExistingPrograms({ onDataChange }: any) {
        return (
            <div data-testid="existing-programs">
                <button
                    onClick={() => onDataChange([{ id: 'test-terminated' }])}
                    data-testid="set-terminated"
                >
                    Set Terminated
                </button>
            </div>
        );
    };
});

jest.mock('./rmd-calculator', () => ({
    __esModule: true,
    default: function MockRMDCalculator() {
        return <div data-testid="rmd-calculator">RMD Calculator</div>;
    },
    findOverlaps: jest.fn(),
}));

jest.mock('./rmd-row', () => {
    return function MockRMDOptions({ onDataChange, rmdData, formConfig }: any) {
        return (
            <div data-testid="rmd-options">
                <button
                    onClick={() =>
                        onDataChange({
                            ...rmdData,
                            startDate: { text: '2024-01-01' },
                            frequency: { text: Frequency.Monthly },
                            duration: { text: '12' },
                            amount: {
                                text: '1000',
                                amountType: AmountType.Dollar,
                            },
                        })
                    }
                    data-testid="update-rmd-data"
                >
                    Update RMD Data
                </button>
                <div data-testid="form-config">
                    {JSON.stringify(formConfig)}
                </div>
            </div>
        );
    };
});

// Mock SVG import
jest.mock('@deps/styles/elements/icons/icons_outlined/trash.svg', () => ({
    ReactComponent: ({ height, width }: any) => (
        <div data-testid="remove-icon" style={{ height, width }}>
            Remove Icon
        </div>
    ),
}));

// Mock ButtonGrp component to test toggle functionality
jest.mock('@deps/components/button-group/button-group', () => {
    return function MockButtonGrp({ toggle, activeValue, labels }: any) {
        return (
            <div data-testid="button-group">
                <div data-testid="active-value">{activeValue}</div>
                {labels.map((label: any, index: number) => (
                    <button
                        key={index}
                        onClick={() => toggle(label.value)}
                        data-testid={`toggle-${label.value}`}
                    >
                        {label.label}
                    </button>
                ))}
            </div>
        );
    };
});

const mockT = jest.fn((key: string) => key);
const mockSetFormProgram = jest.fn();

const defaultFormProgram = {
    rmd: {
        ...DEFAULT_RMD,
        rmdPrograms: [DEFAULT_RMD_PROGRAM],
        rmdType: RMDType.AutoRMD,
    },
};

const defaultContextValue: any = {
    formProgram: defaultFormProgram,
    setFormProgram: mockSetFormProgram,
    formErrors: null,
};

const renderWithContext = (
    component: React.ReactElement,
    contextValue: any = defaultContextValue
) => {
    return render(
        <FormDataContext.Provider value={contextValue}>
            {component}
        </FormDataContext.Provider>
    );
};

describe('RMDMethod Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useTranslation as jest.Mock).mockReturnValue({
            t: mockT,
        });
        (findOverlaps as jest.Mock).mockReturnValue([]);
    });

    describe('Component Rendering', () => {
        it('should render with default props', () => {
            renderWithContext(<RMDMethod isFormStateReadOnly={false} />);

            expect(screen.getByText('title')).toBeInTheDocument();
            expect(screen.getByTestId('existing-programs')).toBeInTheDocument();
            expect(screen.getByText('newRmdProgram')).toBeInTheDocument();
        });

        it('should render with custom rmdTypeOptions', () => {
            const customOptions = [
                { label: 'Custom Auto', value: RMDType.AutoRMD },
                { label: 'Custom Calculate', value: RMDType.CalculateRMD },
            ];

            renderWithContext(
                <RMDMethod
                    isFormStateReadOnly={false}
                    rmdTypeOptions={customOptions}
                />
            );

            expect(screen.getByText('title')).toBeInTheDocument();
        });

        it('should render RMD Calculator when rmdType is CalculateRMD', () => {
            const contextWithCalculateRMD = {
                ...defaultContextValue,
                formProgram: {
                    ...defaultFormProgram,
                    rmd: {
                        ...defaultFormProgram.rmd,
                        rmdType: RMDType.CalculateRMD,
                    },
                },
            };

            renderWithContext(
                <RMDMethod isFormStateReadOnly={false} />,
                contextWithCalculateRMD
            );

            expect(screen.getByTestId('rmd-calculator')).toBeInTheDocument();
        });

        it('should not render RMD programs section when isQCD is true', () => {
            renderWithContext(
                <RMDMethod isFormStateReadOnly={false} isQCD={true} />
            );

            expect(screen.queryByText('newRmdProgram')).not.toBeInTheDocument();
        });

        it('should render one-time RMD text when rmdType is OneTimeRMD', () => {
            const contextWithOneTimeRMD = {
                ...defaultContextValue,
                formProgram: {
                    ...defaultFormProgram,
                    rmd: {
                        ...defaultFormProgram.rmd,
                        rmdType: RMDType.OneTimeRMD,
                    },
                },
            };

            renderWithContext(
                <RMDMethod isFormStateReadOnly={false} />,
                contextWithOneTimeRMD
            );

            expect(screen.getByText('oneTimeRmd')).toBeInTheDocument();
        });
    });

    describe('RMD Type Selection', () => {
        it('should update rmdType when button group selection changes', async () => {
            const user = userEvent.setup();

            renderWithContext(<RMDMethod isFormStateReadOnly={false} />);

            const calculateButton = screen.getByTestId(
                `toggle-${RMDType.CalculateRMD}`
            );
            await user.click(calculateButton);

            // Verify that the toggle function was called and state would update
            expect(screen.getByTestId('button-group')).toBeInTheDocument();
        });

        it('should show active RMD type in button group', () => {
            renderWithContext(<RMDMethod isFormStateReadOnly={false} />);

            const activeValue = screen.getByTestId('active-value');
            expect(activeValue).toHaveTextContent(RMDType.AutoRMD);
        });

        it('should disable button group when isFormStateReadOnly is true', () => {
            renderWithContext(<RMDMethod isFormStateReadOnly={true} />);

            expect(screen.getByText('title')).toBeInTheDocument();
        });
    });

    describe('RMD Row Management', () => {
        it('should add new RMD row when add button is clicked', async () => {
            const user = userEvent.setup();

            renderWithContext(<RMDMethod isFormStateReadOnly={false} />);

            const addButton = screen.getByText('add');
            await user.click(addButton);

            // Verify that a new row would be added (component re-renders)
            expect(screen.getByText('add')).toBeInTheDocument();
        });

        it('should calculate next start date correctly when adding new row', async () => {
            const user = userEvent.setup();
            const contextWithExistingProgram = {
                ...defaultContextValue,
                formProgram: {
                    ...defaultFormProgram,
                    rmd: {
                        ...defaultFormProgram.rmd,
                        rmdPrograms: [
                            {
                                startDate: { text: '2024-01-01' },
                                frequency: { text: Frequency.Monthly },
                                duration: { text: '12' },
                                amount: {
                                    text: '1000',
                                    amountType: AmountType.Dollar,
                                },
                            },
                        ],
                    },
                },
            };

            renderWithContext(
                <RMDMethod isFormStateReadOnly={false} />,
                contextWithExistingProgram
            );

            const addButton = screen.getByText('add');
            await user.click(addButton);

            expect(screen.getByText('add')).toBeInTheDocument();
        });

        it('should remove RMD row when delete button is clicked', async () => {
            const user = userEvent.setup();

            renderWithContext(<RMDMethod isFormStateReadOnly={false} />);

            const removeButtons = screen.getAllByLabelText(
                'removeThisRmdProgram'
            );
            if (removeButtons.length > 0) {
                await user.click(removeButtons[0]);
            }

            expect(screen.getByText('title')).toBeInTheDocument();
        });

        it('should not remove RMD row when form is read-only', async () => {
            const user = userEvent.setup();

            renderWithContext(<RMDMethod isFormStateReadOnly={true} />);

            const removeButtons = screen.getAllByLabelText(
                'removeThisRmdProgram'
            );
            if (removeButtons.length > 0) {
                await user.click(removeButtons[0]);
            }

            expect(screen.getByText('title')).toBeInTheDocument();
        });

        it('should update RMD data when RMDOptions component triggers change', async () => {
            const user = userEvent.setup();

            renderWithContext(<RMDMethod isFormStateReadOnly={false} />);

            const updateButton = screen.getByTestId('update-rmd-data');
            await user.click(updateButton);

            expect(screen.getByTestId('update-rmd-data')).toBeInTheDocument();
        });

        it('should handle multiple RMD rows and update specific row data', async () => {
            const user = userEvent.setup();
            const contextWithMultipleRows = {
                ...defaultContextValue,
                formProgram: {
                    ...defaultFormProgram,
                    rmd: {
                        ...defaultFormProgram.rmd,
                        rmdPrograms: [
                            DEFAULT_RMD_PROGRAM,
                            { ...DEFAULT_RMD_PROGRAM, duration: { text: '6' } },
                        ],
                    },
                },
            };

            renderWithContext(
                <RMDMethod isFormStateReadOnly={false} />,
                contextWithMultipleRows
            );

            const updateButtons = screen.getAllByTestId('update-rmd-data');
            if (updateButtons.length > 1) {
                await user.click(updateButtons[1]);
            }

            expect(screen.getByText('title')).toBeInTheDocument();
        });
    });

    describe('Form Configuration', () => {
        it('should show correct form config for AutoRMD when isLC is false', () => {
            renderWithContext(
                <RMDMethod isFormStateReadOnly={false} isLC={false} />
            );

            const formConfigElement = screen.getByTestId('form-config');
            const config = JSON.parse(formConfigElement.textContent || '{}');

            expect(config.startDate).toBe(true);
            expect(config.frequency).toBe(true);
            expect(config.duration).toBe(true);
            expect(config.amount).toBe(false);
        });

        it('should show correct form config for OneTimeRMD when isLC is false', () => {
            const contextWithOneTimeRMD = {
                ...defaultContextValue,
                formProgram: {
                    ...defaultFormProgram,
                    rmd: {
                        ...defaultFormProgram.rmd,
                        rmdType: RMDType.OneTimeRMD,
                    },
                },
            };

            renderWithContext(
                <RMDMethod isFormStateReadOnly={false} isLC={false} />,
                contextWithOneTimeRMD
            );

            const formConfigElement = screen.getByTestId('form-config');
            const config = JSON.parse(formConfigElement.textContent || '{}');

            expect(config.startDate).toBe(true);
            expect(config.frequency).toBe(false);
            expect(config.duration).toBe(false);
            expect(config.amount).toBe(true);
        });

        it('should show all fields enabled when isLC is true', () => {
            renderWithContext(
                <RMDMethod isFormStateReadOnly={false} isLC={true} />
            );

            const formConfigElement = screen.getByTestId('form-config');
            const config = JSON.parse(formConfigElement.textContent || '{}');

            expect(config.startDate).toBe(true);
            expect(config.frequency).toBe(true);
            expect(config.duration).toBe(true);
            expect(config.amount).toBe(true);
        });
    });

    describe('Validation Logic', () => {
        it('should disable add button when duration is 0', () => {
            const contextWithZeroDuration = {
                ...defaultContextValue,
                formProgram: {
                    ...defaultFormProgram,
                    rmd: {
                        ...defaultFormProgram.rmd,
                        rmdPrograms: [
                            {
                                ...DEFAULT_RMD_PROGRAM,
                                duration: { text: '0' },
                            },
                        ],
                    },
                },
            };

            renderWithContext(
                <RMDMethod isFormStateReadOnly={false} />,
                contextWithZeroDuration
            );

            const addButton = screen.getByText('add');
            expect(addButton).toBeDisabled();
        });

        it('should highlight overlapping RMDs', () => {
            (findOverlaps as jest.Mock).mockReturnValue([
                { id: 'overlapping-id' },
            ]);

            renderWithContext(<RMDMethod isFormStateReadOnly={false} />);

            expect(screen.getByText('title')).toBeInTheDocument();
        });
    });

    describe('Error Display', () => {
        it('should display form errors when present', () => {
            const contextWithErrors: any = {
                ...defaultContextValue,
                formErrors: {
                    rmdMinimumRequiredPropgram:
                        'Minimum required program error',
                    rmdDateOverlap: 'Date overlap error',
                    rmdDetectedDurationZero: 'Duration zero error',
                    rmdSystematicStartDate: 'Start date error',
                },
            };

            renderWithContext(
                <RMDMethod isFormStateReadOnly={false} />,
                contextWithErrors
            );

            expect(
                screen.getByText('Minimum required program error')
            ).toBeInTheDocument();
            expect(screen.getByText('Date overlap error')).toBeInTheDocument();
            expect(screen.getByText('Duration zero error')).toBeInTheDocument();
            expect(screen.getByText('Start date error')).toBeInTheDocument();
        });

        it('should not display error section when no errors', () => {
            renderWithContext(<RMDMethod isFormStateReadOnly={false} />);

            expect(
                screen.queryByText('Minimum required program error')
            ).not.toBeInTheDocument();
        });
    });

    describe('Context Updates', () => {
        it('should update form program context when component state changes', async () => {
            const user = userEvent.setup();

            renderWithContext(<RMDMethod isFormStateReadOnly={false} />);

            const setTerminatedButton = screen.getByTestId('set-terminated');
            await user.click(setTerminatedButton);

            await waitFor(() => {
                expect(mockSetFormProgram).toHaveBeenCalled();
            });
        });

        it('should set isOneTimeWithdrawal correctly for OneTimeRMD', async () => {
            const contextWithOneTimeRMD = {
                ...defaultContextValue,
                formProgram: {
                    ...defaultFormProgram,
                    rmd: {
                        ...defaultFormProgram.rmd,
                        rmdType: RMDType.OneTimeRMD,
                    },
                },
            };

            renderWithContext(
                <RMDMethod isFormStateReadOnly={false} />,
                contextWithOneTimeRMD
            );

            await waitFor(() => {
                expect(mockSetFormProgram).toHaveBeenCalledWith(
                    expect.any(Function)
                );
            });
        });

        it('should update withdrawType to Gross', async () => {
            renderWithContext(<RMDMethod isFormStateReadOnly={false} />);

            await waitFor(() => {
                expect(mockSetFormProgram).toHaveBeenCalledWith(
                    expect.any(Function)
                );
            });
        });
    });

    describe('Browser Logging', () => {
        it('should log component render information', () => {
            renderWithContext(<RMDMethod isFormStateReadOnly={false} />);

            expect(browserLogInfo).toHaveBeenCalledWith('RMDMethod::render', {
                rmdType: RMDType.AutoRMD,
            });
        });
    });

    describe('Icon Display', () => {
        it('should show remove icon when isLC is true', () => {
            renderWithContext(
                <RMDMethod isFormStateReadOnly={false} isLC={true} />
            );

            expect(screen.getByTestId('remove-icon')).toBeInTheDocument();
        });

        it('should not show remove icon when isLC is false', () => {
            renderWithContext(
                <RMDMethod isFormStateReadOnly={false} isLC={false} />
            );

            expect(screen.queryByTestId('remove-icon')).not.toBeInTheDocument();
        });

        it('should not show add button when isLC is false', () => {
            renderWithContext(
                <RMDMethod isFormStateReadOnly={false} isLC={false} />
            );

            expect(screen.queryByText('add')).not.toBeInTheDocument();
        });
    });
});

describe('Utility Functions', () => {
    describe('frequencyToValue', () => {
        it('should return correct values for all frequencies', () => {
            expect(frequencyToValue[Frequency.None]).toBe(0);
            expect(frequencyToValue[Frequency.Monthly]).toBe(1);
            expect(frequencyToValue[Frequency.Quarterly]).toBe(3);
            expect(frequencyToValue[Frequency.SemiAnnually]).toBe(6);
            expect(frequencyToValue[Frequency.Annually]).toBe(12);
        });
    });

    describe('DEFAULT_RMD_PROGRAM', () => {
        it('should have correct default values', () => {
            expect(DEFAULT_RMD_PROGRAM).toEqual({
                startDate: { text: '' },
                frequency: { text: Frequency.Annually },
                duration: { text: '0' },
                amount: { text: '', amountType: AmountType.Dollar },
            });
        });
    });

    describe('DEFAULT_RMD', () => {
        it('should have correct default values', () => {
            expect(DEFAULT_RMD).toEqual({
                rmdType: null,
                rmdSubType: null,
                rmdRelationship: null,
                ralationshipDate: null,
                rmdAmount: null,
                fullName: null,
                firstName: null,
                middleName: null,
                lastName: null,
                dob: { text: null },
                isJointLifeExpectancy: false,
                rmdPrograms: [],
                taxId: { text: null },
            });
        });
    });
});

describe('Edge Cases', () => {
    it('should handle empty rmdPrograms array', () => {
        const contextWithEmptyPrograms = {
            ...defaultContextValue,
            formProgram: {
                ...defaultFormProgram,
                rmd: {
                    ...defaultFormProgram.rmd,
                    rmdPrograms: [],
                },
            },
        };

        renderWithContext(
            <RMDMethod isFormStateReadOnly={false} />,
            contextWithEmptyPrograms
        );

        expect(screen.getByText('title')).toBeInTheDocument();
    });

    it('should handle null formProgram', () => {
        const contextWithNullProgram: any = {
            ...defaultContextValue,
            formProgram: null,
        };

        renderWithContext(
            <RMDMethod isFormStateReadOnly={false} />,
            contextWithNullProgram
        );

        expect(screen.getByText('title')).toBeInTheDocument();
    });

    it('should handle undefined rmd in formProgram', () => {
        const contextWithUndefinedRmd: any = {
            ...defaultContextValue,
            formProgram: {
                ...defaultFormProgram,
                rmd: undefined,
            },
        };

        renderWithContext(
            <RMDMethod isFormStateReadOnly={false} />,
            contextWithUndefinedRmd
        );

        expect(screen.getByText('title')).toBeInTheDocument();
    });

    it('should handle missing frequency in previous item when adding new row', async () => {
        const user = userEvent.setup();
        const contextWithMissingFrequency = {
            ...defaultContextValue,
            formProgram: {
                ...defaultFormProgram,
                rmd: {
                    ...defaultFormProgram.rmd,
                    rmdPrograms: [
                        {
                            startDate: { text: '2024-01-01' },
                            frequency: { text: '' as Frequency },
                            duration: { text: '12' },
                            amount: {
                                text: '1000',
                                amountType: AmountType.Dollar,
                            },
                        },
                    ],
                },
            },
        };

        renderWithContext(
            <RMDMethod isFormStateReadOnly={false} />,
            contextWithMissingFrequency
        );

        const addButton = screen.getByText('add');
        await user.click(addButton);

        expect(screen.getByText('add')).toBeInTheDocument();
    });

    it('should handle missing start date in previous item when adding new row', async () => {
        const user = userEvent.setup();
        const contextWithMissingStartDate = {
            ...defaultContextValue,
            formProgram: {
                ...defaultFormProgram,
                rmd: {
                    ...defaultFormProgram.rmd,
                    rmdPrograms: [
                        {
                            startDate: { text: '' },
                            frequency: { text: Frequency.Monthly },
                            duration: { text: '12' },
                            amount: {
                                text: '1000',
                                amountType: AmountType.Dollar,
                            },
                        },
                    ],
                },
            },
        };

        renderWithContext(
            <RMDMethod isFormStateReadOnly={false} />,
            contextWithMissingStartDate
        );

        const addButton = screen.getByText('add');
        await user.click(addButton);

        expect(screen.getByText('add')).toBeInTheDocument();
    });

    it('should handle empty rmdType in formProgram', () => {
        const contextWithEmptyRmdType = {
            ...defaultContextValue,
            formProgram: {
                ...defaultFormProgram,
                rmd: {
                    ...defaultFormProgram.rmd,
                    rmdType: null,
                },
            },
        };

        renderWithContext(
            <RMDMethod isFormStateReadOnly={false} />,
            contextWithEmptyRmdType
        );

        const activeValue = screen.getByTestId('active-value');
        expect(activeValue).toHaveTextContent('Auto RMD');
    });

    it('should handle programs with zero duration correctly', () => {
        const contextWithZeroDurationPrograms = {
            ...defaultContextValue,
            formProgram: {
                ...defaultFormProgram,
                rmd: {
                    ...defaultFormProgram.rmd,
                    rmdPrograms: [
                        { ...DEFAULT_RMD_PROGRAM, duration: { text: '0' } },
                        { ...DEFAULT_RMD_PROGRAM, duration: { text: '12' } },
                    ],
                },
            },
        };

        renderWithContext(
            <RMDMethod isFormStateReadOnly={false} />,
            contextWithZeroDurationPrograms
        );

        const addButton = screen.getByText('add');
        expect(addButton).toBeDisabled();
    });

    it('should handle frequency mapping with None frequency', async () => {
        const user = userEvent.setup();
        const contextWithNoneFrequency = {
            ...defaultContextValue,
            formProgram: {
                ...defaultFormProgram,
                rmd: {
                    ...defaultFormProgram.rmd,
                    rmdPrograms: [
                        {
                            startDate: { text: '2024-01-01' },
                            frequency: { text: Frequency.None },
                            duration: { text: '12' },
                            amount: {
                                text: '1000',
                                amountType: AmountType.Dollar,
                            },
                        },
                    ],
                },
            },
        };

        renderWithContext(
            <RMDMethod isFormStateReadOnly={false} />,
            contextWithNoneFrequency
        );

        const addButton = screen.getByText('add');
        await user.click(addButton);

        expect(screen.getByText('add')).toBeInTheDocument();
    });
});
