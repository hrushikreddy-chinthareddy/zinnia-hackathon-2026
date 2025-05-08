import { fireEvent, render, screen } from '@testing-library/react';

import ComparisonContract from './comparison-contract';
import { BenefitType } from './create-disclosure.types';
import { amountCellFormatter, numberParser } from '../../mass-mutual/mass-mutual-reg60-form-helpers';
import { getCreateDisclosureInfo } from '../../utils/reg60-form-helpers';

describe('ComparisonContract', () => {
    const formConfigs = {
        title: 'Test',
        field: {
            comparisonType: {
                fieldLabel: 'Comparison Type',
            },
            partialRequest: {
                fieldLabel: 'Partial Request',
            },
            goodFaithEstimateRequired: {
                fieldLabel: 'Good Faith Estimate Required',
            },
            companyName: {
                fieldLabel: 'Company Name',
            },
            companyPhoneNumber: {
                fieldLabel: 'Company Phone Number',
            },
            contractNumber: {
                fieldLabel: 'Contract Number',
            },
            issueDate: {
                fieldLabel: 'Issue Date',
            },
            accountValue: {
                fieldLabel: 'Account Value',
            },
            surrenderChargeApplies: {
                fieldLabel: 'Surrender Charge Applies',
            },
            mvaApplies: {
                fieldLabel: 'MVA Applies',
            },
            surrenderValue: {
                fieldLabel: 'Surrender Value',
            },
        },
        table: [
            {
                title: 'Surrender value',
                key: BenefitType.SurrenderBenefit,
                rowConfig: [
                    {
                        period: '5 years',
                        returnGuarRate: '',
                        returnCurrRate: '',
                        return0Prct: '',
                        return6Prct: '',
                        return12Prct: '',
                    },
                    {
                        period: '10 years',
                        returnGuarRate: '',
                        returnCurrRate: '',
                        return0Prct: '',
                        return6Prct: '',
                        return12Prct: '',
                    },
                ],
                colConfigFixed: [
                    {
                        headerName: 'Years',
                        field: 'period',
                        editable: false,
                        cellClass: ['w-100', 'text-sm'],
                    },
                    {
                        headerName: 'Guaranteed rate',
                        field: 'returnGuarRate',
                        editable: true,
                        cellClass: ['w-100', 'text-sm'],
                        valueParser: numberParser,
                        valueFormatter: amountCellFormatter,
                    },
                    {
                        headerName: 'Current rate',
                        field: 'returnCurrRate',
                        editable: true,
                        cellClass: ['w-100', 'text-sm'],
                        valueParser: numberParser,
                        valueFormatter: amountCellFormatter,
                    },
                ],
                colConfigVariable: [
                    {
                        headerName: 'Year',
                        field: 'period',
                        editable: false,
                        cellClass: ['w-100', 'text-sm border-b-xl'],
                    },
                    {
                        headerName: '0%',
                        field: 'return0Prct',
                        editable: true,
                        cellClass: ['w-100', 'text-sm'],
                        valueParser: numberParser,
                        valueFormatter: amountCellFormatter,
                    },
                    {
                        headerName: '6%',
                        field: 'return6Prct',
                        editable: true,
                        cellClass: ['w-100', 'text-sm'],
                        valueParser: numberParser,
                        valueFormatter: amountCellFormatter,
                    },
                    {
                        headerName: '12%',
                        field: 'return12Prct',
                        editable: true,
                        cellClass: ['w-100', 'text-sm'],
                        valueParser: numberParser,
                        valueFormatter: amountCellFormatter,
                    },
                ],
            },
            {
                title: 'Death Benifits',
                key: BenefitType.DeathBenefit,
                rowConfig: [
                    {
                        period: '5 years',
                        returnGuarRate: '',
                        returnCurrRate: '',
                        return0Prct: '',
                        return6Prct: '',
                        return12Prct: '',
                    },
                    {
                        period: '10 Years',
                        returnGuarRate: '',
                        returnCurrRate: '',
                        return0Prct: '',
                        return6Prct: '',
                        return12Prct: '',
                    },
                ],
                colConfigFixed: [
                    {
                        headerName: 'Years',
                        field: 'period',
                        editable: false,
                        cellClass: ['w-100', 'text-sm'],
                    },
                    {
                        headerName: 'Guaranteed rate',
                        field: 'returnGuarRate',
                        editable: true,
                        cellClass: ['w-100', 'text-sm'],
                        valueParser: numberParser,
                        valueFormatter: amountCellFormatter,
                    },
                    {
                        headerName: 'Current rate',
                        field: 'returnCurrRate',
                        editable: true,
                        cellClass: ['w-100', 'text-sm'],
                        valueParser: numberParser,
                        valueFormatter: amountCellFormatter,
                    },
                ],
                colConfigVariable: [
                    {
                        headerName: 'Year',
                        field: 'period',
                        editable: false,
                        cellClass: ['w-100', 'text-sm border-b-xl'],
                    },
                    {
                        headerName: '0%',
                        field: 'return0Prct',
                        editable: true,
                        cellClass: ['w-100', 'text-sm'],
                        valueParser: numberParser,
                        valueFormatter: amountCellFormatter,
                    },
                    {
                        headerName: '6%',
                        field: 'return6Prct',
                        editable: true,
                        cellClass: ['w-100', 'text-sm'],
                        valueParser: numberParser,
                        valueFormatter: amountCellFormatter,
                    },
                    {
                        headerName: '12%',
                        field: 'return12Prct',
                        editable: true,
                        cellClass: ['w-100', 'text-sm'],
                        valueParser: numberParser,
                        valueFormatter: amountCellFormatter,
                    },
                ],
            },
        ],
    };
    it('should render all form fields and labels correctly with default values', () => {
        // Arrange
        const comparisonData = getCreateDisclosureInfo();

        const title = 'Comparison Contract';
        const formErrors = {};
        const handleChange = jest.fn();

        render(
            <ComparisonContract
                comparisonContract={comparisonData[0]}
                formConfigs={formConfigs}
                title={title}
                formErrors={formErrors}
                onComparisonContractChange={handleChange}
            />
        );

        // Assert
        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByText('Comparison Type')).toBeInTheDocument();
        expect(screen.getByLabelText('Partial Request')).toBeInTheDocument();
        expect(screen.getByLabelText('Good Faith Estimate Required')).toBeInTheDocument();
        expect(screen.getByLabelText('Company Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Company Phone Number')).toBeInTheDocument();
        expect(screen.getByLabelText('Contract Number')).toBeInTheDocument();
        expect(screen.getByLabelText('Issue Date')).toBeInTheDocument();
        expect(screen.getByLabelText('Account Value')).toBeInTheDocument();
        expect(screen.getByLabelText('Surrender Charge Applies')).toBeInTheDocument();
        expect(screen.getByLabelText('MVA Applies')).toBeInTheDocument();
        expect(screen.getByLabelText('Surrender Value')).toBeInTheDocument();
    });

    it('should allow the user to select a comparison type', () => {
        // Arrange
        const comparisonData = getCreateDisclosureInfo();

        const title = 'Comparison Contract';
        const formErrors = {};
        const handleChange = jest.fn();

        render(
            <ComparisonContract
                comparisonContract={comparisonData[0]}
                formConfigs={formConfigs}
                title={title}
                formErrors={formErrors}
                onComparisonContractChange={handleChange}
            />
        );

        // Assert
        expect(screen.getByText(formConfigs.field.comparisonType.fieldLabel)).toBeInTheDocument();
    });

    it('should modify the surrender or death benefits data correctly when the table data is changed', () => {
        // Arrange
        const comparisonData = getCreateDisclosureInfo();
        const tableData = [
            {
                period: '5YEAR',
                returnGuarRate: '',
                returnCurrRate: '',
                return0Prct: '',
                return6Prct: '',
                return12Prct: '',
            },
            {
                period: '10YEAR',
                returnGuarRate: '',
                returnCurrRate: '',
                return0Prct: '',
                return6Prct: '',
                return12Prct: '',
            },
        ];
        const title = 'Comparison Contract';
        const formErrors = {};
        const handleChange = jest.fn();

        render(
            <ComparisonContract
                comparisonContract={comparisonData[0]}
                formConfigs={formConfigs}
                title={title}
                formErrors={formErrors}
                onComparisonContractChange={handleChange}
            />
        );

        // Act
        fireEvent.change(screen.getByLabelText('Surrender Value'), { target: { value: '50000' } });

        // Assert
        expect(handleChange).toHaveBeenCalledWith({
            ...comparisonData[0],
            surrenderValue: '50000',
            carrierBenefits: {
                ...comparisonData[0].carrierBenefits,
                surrenderBenefit: tableData,
            },
        });
    });

    it('should update the issue date correctly when a new date is entered', () => {
        // Arrange
        const comparisonData = getCreateDisclosureInfo();

        const title = 'Comparison Contract';
        const formErrors = {};
        const handleChange = jest.fn();

        render(
            <ComparisonContract
                comparisonContract={comparisonData[0]}
                formConfigs={formConfigs}
                title={title}
                formErrors={formErrors}
                onComparisonContractChange={handleChange}
            />
        );

        // Act
        fireEvent.change(screen.getByLabelText('Issue Date'), { target: { value: '01012022' } });

        // Assert
        expect(handleChange).toHaveBeenCalledWith({
            ...comparisonData[0],
            issueDate: '2022-01-01',
        });
    });

    it('should render all form fields and labels correctly with non-default values', () => {
        // Arrange
        const comparisonData = getCreateDisclosureInfo();
        const nonDefaultFormConfigs = {
            title: 'Test',
            field: {
                comparisonType: {
                    fieldLabel: 'Comparison Type',
                },
                partialRequest: {
                    fieldLabel: 'Partial Request',
                },
                goodFaithEstimateRequired: {
                    fieldLabel: 'Good Faith Estimate Required',
                },
                companyName: {
                    fieldLabel: 'Company Name',
                },
                companyPhoneNumber: {
                    fieldLabel: 'Company Phone Number',
                },
                contractNumber: {
                    fieldLabel: 'Contract Number',
                },
                issueDate: {
                    fieldLabel: 'Issue Date',
                },
                accountValue: {
                    fieldLabel: 'Account Value',
                },
                surrenderChargeApplies: {
                    fieldLabel: 'Surrender Charge Applies',
                },
                mvaApplies: {
                    fieldLabel: 'MVA Applies',
                },
                surrenderValue: {
                    fieldLabel: 'Surrender Value',
                },
            },
            table: [],
        };
        const title = 'Comparison Contract';
        const formErrors = {};
        const handleChange = jest.fn();

        render(
            <ComparisonContract
                comparisonContract={comparisonData[0]}
                formConfigs={nonDefaultFormConfigs}
                title={title}
                formErrors={formErrors}
                onComparisonContractChange={handleChange}
            />
        );

        // Assert
        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByText('Comparison Type')).toBeInTheDocument();
        expect(screen.getByLabelText('Partial Request')).toBeInTheDocument();
        expect(screen.getByLabelText('Good Faith Estimate Required')).toBeInTheDocument();
        expect(screen.getByLabelText('Company Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Company Phone Number')).toBeInTheDocument();
        expect(screen.getByLabelText('Contract Number')).toBeInTheDocument();
        expect(screen.getByLabelText('Issue Date')).toBeInTheDocument();
        expect(screen.getByLabelText('Account Value')).toBeInTheDocument();
        expect(screen.getByLabelText('Surrender Charge Applies')).toBeInTheDocument();
        expect(screen.getByLabelText('MVA Applies')).toBeInTheDocument();
        expect(screen.getByLabelText('Surrender Value')).toBeInTheDocument();
    });

    // Updates the issue date correctly when a new date is entered
    it('should update the issue date correctly when a new date is entered', () => {
        // Arrange
        const comparisonData = getCreateDisclosureInfo();

        const title = 'Comparison Contract';
        const formErrors = {};
        const handleChange = jest.fn();

        render(
            <ComparisonContract
                comparisonContract={comparisonData[0]}
                formConfigs={formConfigs}
                title={title}
                formErrors={formErrors}
                onComparisonContractChange={handleChange}
            />
        );

        // Act
        fireEvent.change(screen.getByLabelText('Issue Date'), { target: { value: '01012022' } });

        // Assert
        expect(handleChange).toHaveBeenCalledWith({
            ...comparisonData[0],
            issueDate: '2022-01-01',
        });
    });

    it('should show table when good faith estimate required is true', () => {
        // Arrange
        const comparisonData = getCreateDisclosureInfo();

        const title = 'Comparison Contract';
        const formErrors = {};
        const handleChange = jest.fn();

        render(
            <ComparisonContract
                comparisonContract={comparisonData[0]}
                formConfigs={formConfigs}
                title={title}
                formErrors={formErrors}
                onComparisonContractChange={handleChange}
            />
        );
        expect(screen.getAllByTestId('benefits-table')[0]).toBeInTheDocument();
        expect(screen.getAllByTestId('benefits-table')[1]).toBeInTheDocument();
    });

    it('should show table only when good faith estimate required is true', async () => {
        // Arrange
        const comparisonData = getCreateDisclosureInfo()[0];

        const title = 'Comparison Contract';
        const formErrors = {};
        const handleChange = jest.fn();

        render(
            <ComparisonContract
                comparisonContract={{ ...comparisonData, goodFaithEstimateRequired: true }}
                formConfigs={formConfigs}
                title={title}
                formErrors={formErrors}
                onComparisonContractChange={handleChange}
            />
        );

        expect(screen.getAllByTestId('benefits-table')[0]).toBeInTheDocument();
        expect(screen.getAllByTestId('benefits-table')[1]).toBeInTheDocument();
    });
});
