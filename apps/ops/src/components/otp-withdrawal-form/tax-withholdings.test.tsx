import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import {
    FormDataContext,
    OtpWithdrawalFormState,
    defaultFormDataContext,
} from '@deps/contexts/OtpWithdrawalFormContext';
import {
    AmountType,
    TaxWithholdingPlace,
    CaseStatus,
} from '@deps/models/case/withdrawal/case';

import { MaritalStatusAllowances } from './maritial-status-allowance-withholdings';
import TaxWithholdings from './tax-withholdings';

describe('TaxWithholdings', () => {
    afterEach(cleanup);
    it('renders the component without the Iowa checkbox if the state of residence is not IA', () => {
        render(<TaxWithholdings ownerStateOfResidence="NA" />);

        // Assert that the component is rendered
        expect(screen.getByText('title')).toBeInTheDocument();
        expect(screen.getByText('federal')).toBeInTheDocument();
        expect(screen.getByText('state')).toBeInTheDocument();
        expect(screen.queryByText('iowaResident')).toBeNull();
    });

    it('renders the component with the Iowa checkbox if the state of residence is IA', () => {
        render(<TaxWithholdings ownerStateOfResidence="IA" />);

        // Assert that the component is rendered
        expect(screen.getByText('title')).toBeInTheDocument();
        expect(screen.getByText('federal')).toBeInTheDocument();
        expect(screen.getByText('state')).toBeInTheDocument();
        expect(screen.getByText('iowaResident')).toBeInTheDocument();
    });

    it('handles dollar amount changes in federal withholding', () => {
        const onDataChange = jest.fn() as React.Dispatch<
            React.SetStateAction<any>
        >;

        render(
            <FormDataContext.Provider
                value={
                    {
                        ...defaultFormDataContext,
                        setFormTaxWithholding: onDataChange,
                    } as OtpWithdrawalFormState
                }
            >
                <TaxWithholdings ownerStateOfResidence="NA" />
            </FormDataContext.Provider>
        );
        const federalInputs = screen
            .getByTestId('Federal-tax-withholding-row')
            .getElementsByTagName('input');

        fireEvent.change(federalInputs[0], { target: { value: '10' } });
        expect(onDataChange).toHaveBeenCalledWith({
            taxWithholding: [
                {
                    place: { text: 'Federal' },
                    type: { text: 'Specified Tax Withholding' },
                    amount: { text: '10', amountType: AmountType.Dollar },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
            ],
        });
    });

    it('handles percent changes in federal withholding', () => {
        const onDataChange = jest.fn() as React.Dispatch<
            React.SetStateAction<any>
        >;

        render(
            <FormDataContext.Provider
                value={
                    {
                        ...defaultFormDataContext,
                        setFormTaxWithholding: onDataChange,
                    } as OtpWithdrawalFormState
                }
            >
                <TaxWithholdings ownerStateOfResidence="NA" />
            </FormDataContext.Provider>
        );
        const federalInputs = screen
            .getByTestId('Federal-tax-withholding-row')
            .getElementsByTagName('input');

        fireEvent.change(federalInputs[1], { target: { value: '20' } });
        expect(onDataChange).toHaveBeenCalledWith({
            taxWithholding: [
                {
                    place: { text: 'Federal' },
                    type: { text: 'Specified Tax Withholding' },
                    amount: { text: '20', amountType: AmountType.Percent },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
            ],
        });
    });

    it('handles dollar amount in state withholding with owner state set', () => {
        const onDataChange = jest.fn() as React.Dispatch<
            React.SetStateAction<any>
        >;

        render(
            <FormDataContext.Provider
                value={
                    {
                        ...defaultFormDataContext,
                        setFormTaxWithholding: onDataChange,
                    } as OtpWithdrawalFormState
                }
            >
                <TaxWithholdings ownerStateOfResidence="Iowa" />
            </FormDataContext.Provider>
        );

        const stateInputs = screen
            .getByTestId('State-tax-withholding-row')
            .getElementsByTagName('input');

        fireEvent.change(stateInputs[0], { target: { value: '10' } });
        expect(onDataChange).toHaveBeenCalledWith({
            taxWithholding: [
                {
                    place: { text: 'State' },
                    type: { text: 'Specified Tax Withholding' },
                    amount: { text: '10', amountType: AmountType.Dollar },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
            ],
        });

        fireEvent.change(stateInputs[1], { target: { value: '20' } });
        expect(onDataChange).toHaveBeenCalledWith({
            taxWithholding: [
                {
                    place: { text: 'State' },
                    type: { text: 'Specified Tax Withholding' },
                    amount: { text: '10', amountType: AmountType.Dollar },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
                {
                    place: { text: 'State' },
                    type: { text: 'Specified Tax Withholding' },
                    amount: { text: '20', amountType: AmountType.Percent },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
            ],
        });
    });

    it('handles pre-populating of federal and state withholding', () => {
        const mockFormTaxWithholding = {
            taxWithholding: [
                {
                    place: { text: 'State' },
                    type: { text: 'Specified Tax Withholding' },
                    amount: { text: '20', amountType: AmountType.Percent },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
                {
                    place: { text: 'Federal' },
                    type: { text: 'Specified Tax Withholding' },
                    amount: { text: '10', amountType: AmountType.Dollar },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
                {
                    place: { text: 'Federal' },
                    type: { text: 'Specified Tax Withholding' },
                    amount: { text: '80', amountType: AmountType.Percent },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
                {
                    place: { text: 'Federal' },
                    type: { text: 'No Tax Withholding' },
                    amount: { text: null, amountType: null },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
                {
                    place: { text: 'State' },
                    type: { text: 'Minimum Tax Withholding' },
                    amount: { text: null, amountType: null },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
                {
                    place: { text: 'State' },
                    type: { text: 'No Tax Withholding Allowed' },
                    amount: { text: null, amountType: null },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
            ],
        };
        const mockSetFormTaxWithholding = jest.fn() as React.Dispatch<
            React.SetStateAction<any>
        >;
        render(
            <FormDataContext.Provider
                value={
                    {
                        ...defaultFormDataContext,
                        formTaxWithholding: mockFormTaxWithholding,
                        setFormTaxWithholding: mockSetFormTaxWithholding,
                    } as OtpWithdrawalFormState
                }
            >
                <TaxWithholdings ownerStateOfResidence="NA" />
            </FormDataContext.Provider>
        );

        const federalInputs = screen
            .getByTestId('Federal-tax-withholding-row')
            .getElementsByTagName('input');
        const federalDontWithhold = screen.getByTestId(
            'Federal-tax-withholding-do-not-withhold'
        );
        const federalSelectMinimum = screen.getByTestId(
            'Federal-tax-withholding-select-minimum'
        );
        const stateSelectMinimum = screen.getByTestId(
            'State-tax-withholding-select-minimum'
        );
        const stateInputs = screen
            .getByTestId('State-tax-withholding-row')
            .getElementsByTagName('input');
        const stateDontWithhold = screen.getByTestId(
            'State-tax-withholding-do-not-withhold'
        );

        const selectedClass = '!bg-primary-lighter';

        expect(federalDontWithhold).toHaveClass(selectedClass);
        expect(federalInputs[0].value.trim()).toBe('10');
        expect(federalInputs[1].value.trim()).toBe('80');
        expect(federalSelectMinimum).not.toHaveClass(selectedClass);
        expect(stateDontWithhold).not.toHaveClass(selectedClass);
        expect(stateInputs[0].value).toBeFalsy();
        expect(stateInputs[1].value.trim()).toBe('20');
        expect(stateSelectMinimum).toHaveClass(selectedClass);
    });

    it('handles pre-populating of federal withholding along with minimum and additional percent amount', () => {
        const mockFormTaxWithholding = {
            taxWithholding: [
                {
                    place: { text: 'Federal' },
                    type: { text: 'Specified Tax Withholding' },
                    amount: { text: '20', amountType: AmountType.Percent },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
                {
                    place: { text: 'Federal' },
                    type: { text: 'Specified Tax Withholding' },
                    amount: { text: '10', amountType: AmountType.Dollar },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
                {
                    place: { text: 'Federal' },
                    type: { text: 'Minimum Tax Withholding' },
                    amount: { text: null, amountType: null },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: {
                        text: '40',
                        amountType: AmountType.Percent,
                    },
                },
            ],
        };
        const mockSetFormTaxWithholding = jest.fn() as React.Dispatch<
            React.SetStateAction<any>
        >;
        render(
            <FormDataContext.Provider
                value={
                    {
                        ...defaultFormDataContext,
                        formTaxWithholding: mockFormTaxWithholding,
                        setFormTaxWithholding: mockSetFormTaxWithholding,
                    } as OtpWithdrawalFormState
                }
            >
                <TaxWithholdings
                    additionalWithHoldingConfig={{
                        [TaxWithholdingPlace.Federal]: {
                            amountType: AmountType.Percent,
                        },
                    }}
                />
            </FormDataContext.Provider>
        );

        expect(mockSetFormTaxWithholding).toHaveBeenCalledWith({
            taxWithholding: [
                {
                    place: { text: 'Federal' },
                    type: { text: 'Specified Tax Withholding' },
                    amount: { text: '10', amountType: AmountType.Dollar },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
                {
                    place: { text: 'Federal' },
                    type: { text: 'Specified Tax Withholding' },
                    amount: { text: '20', amountType: AmountType.Percent },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
                {
                    place: { text: 'Federal' },
                    type: { text: 'Minimum Tax Withholding' },
                    amount: { text: null, amountType: null },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: {
                        text: '40',
                        amountType: AmountType.Percent,
                    },
                },
            ],
        });
    });

    it('correctly maps a change in value to formTaxWithholding', () => {
        const mockSetFormTaxWithholding = jest.fn() as React.Dispatch<
            React.SetStateAction<any>
        >;
        const mockFormTaxWithholding = {
            taxWithholding: [
                {
                    place: { text: 'Federal' },
                    type: { text: 'Specified Tax Withholding' },
                    amount: { text: '10', amountType: AmountType.Dollar },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
                {
                    place: { text: 'Federal' },
                    type: { text: 'Specified Tax Withholding' },
                    amount: { text: '80', amountType: AmountType.Percent },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
                {
                    place: { text: 'Federal' },
                    type: { text: 'No Tax Withholding' },
                    amount: { text: null, amountType: null },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
                {
                    place: { text: 'State' },
                    type: { text: 'Minimum Tax Withholding' },
                    amount: { text: null, amountType: null },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
                {
                    place: { text: 'State' },
                    type: { text: 'No Tax Withholding Allowed' },
                    amount: { text: null, amountType: null },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
            ],
        };
        render(
            <FormDataContext.Provider
                value={
                    {
                        ...defaultFormDataContext,
                        formTaxWithholding: mockFormTaxWithholding,
                        setFormTaxWithholding: mockSetFormTaxWithholding,
                        currentFormState: CaseStatus.Pending,
                    } as OtpWithdrawalFormState
                }
            >
                <TaxWithholdings ownerStateOfResidence="NA" />
            </FormDataContext.Provider>
        );

        const stateDontWithhold = screen.getByTestId(
            'State-tax-withholding-do-not-withhold'
        );
        fireEvent.click(stateDontWithhold);

        expect(mockSetFormTaxWithholding).toHaveBeenCalledWith({
            taxWithholding: [
                {
                    place: { text: 'Federal' },
                    type: { text: 'No Tax Withholding' },
                    amount: { text: null, amountType: null },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
                {
                    place: { text: 'Federal' },
                    type: { text: 'Specified Tax Withholding' },
                    amount: { text: '10', amountType: AmountType.Dollar },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
                {
                    place: { text: 'Federal' },
                    type: { text: 'Specified Tax Withholding' },
                    amount: { text: '80', amountType: AmountType.Percent },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
                {
                    place: { text: 'State' },
                    type: { text: 'No Tax Withholding' },
                    amount: { text: null, amountType: null },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
                {
                    place: { text: 'State' },
                    type: { text: 'Minimum Tax Withholding' },
                    amount: { text: null, amountType: null },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: {
                        text: null,
                        amountType: AmountType.Percent,
                    },
                },
            ],
        });
    });

    it('correctly maps a change in value to formTaxWithholding', () => {
        const mockSetFormTaxWithholding = jest.fn() as React.Dispatch<
            React.SetStateAction<any>
        >;
        const mockFormTaxWithholding = {
            taxWithholding: [
                {
                    place: { text: 'Federal' },
                    type: { text: 'Specified Tax Withholding' },
                    amount: { text: '10', amountType: AmountType.Dollar },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
                {
                    place: { text: 'Federal' },
                    type: { text: 'Specified Tax Withholding' },
                    amount: { text: '80', amountType: AmountType.Percent },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
                {
                    place: { text: 'Federal' },
                    type: { text: 'No Tax Withholding' },
                    amount: { text: null, amountType: null },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
                {
                    place: { text: 'State' },
                    type: { text: 'Minimum Tax Withholding' },
                    amount: { text: null, amountType: null },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
                {
                    place: { text: 'State' },
                    type: { text: 'No Tax Withholding Allowed' },
                    amount: { text: null, amountType: null },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
            ],
        };
        render(
            <FormDataContext.Provider
                value={
                    {
                        ...defaultFormDataContext,
                        formTaxWithholding: mockFormTaxWithholding,
                        setFormTaxWithholding: mockSetFormTaxWithholding,
                        currentFormState: CaseStatus.Pending,
                    } as OtpWithdrawalFormState
                }
            >
                <TaxWithholdings ownerStateOfResidence="NA" />
            </FormDataContext.Provider>
        );

        const stateDontWithhold = screen.getByTestId(
            'State-tax-withholding-do-not-withhold'
        );
        fireEvent.click(stateDontWithhold);

        expect(mockSetFormTaxWithholding).toHaveBeenCalledWith({
            taxWithholding: [
                {
                    place: { text: 'Federal' },
                    type: { text: 'No Tax Withholding' },
                    amount: { text: null, amountType: null },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
                {
                    place: { text: 'Federal' },
                    type: { text: 'Specified Tax Withholding' },
                    amount: { text: '10', amountType: AmountType.Dollar },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
                {
                    place: { text: 'Federal' },
                    type: { text: 'Specified Tax Withholding' },
                    amount: { text: '80', amountType: AmountType.Percent },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
                {
                    place: { text: 'State' },
                    type: { text: 'No Tax Withholding' },
                    amount: { text: null, amountType: null },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
                {
                    place: { text: 'State' },
                    type: { text: 'Minimum Tax Withholding' },
                    amount: { text: null, amountType: null },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: {
                        text: null,
                        amountType: AmountType.Percent,
                    },
                },
            ],
        });
    });

    it.skip('handles changes in Iowa resident checkbox', () => {
        const onDataChange = jest.fn();

        render(<TaxWithholdings ownerStateOfResidence="IA" />);

        // Simulate a click on the Iowa resident checkbox
        const checkbox = screen.getByLabelText('iowaResident');
        fireEvent.click(checkbox);

        expect(onDataChange).toHaveBeenCalledWith({
            taxWithholding: [],
        });
    });

    it('should render marital status allowances component when isMaritalStatusAllowances is true', () => {
        render(<TaxWithholdings isMaritalStatusAllowances={true} />);

        expect(screen.getByText('title')).toBeInTheDocument();
        expect(screen.getByText('federal')).toBeInTheDocument();
        expect(screen.getByText('state')).toBeInTheDocument();

        const maritalStatusAllowancesCheckbox = screen.getByTestId(
            'marital-status-allowances-test-id'
        );
        expect(maritalStatusAllowancesCheckbox).toBeInTheDocument();

        fireEvent.click(maritalStatusAllowancesCheckbox);

        expect(
            screen.getByTestId(
                `marital-status-test-id-${MaritalStatusAllowances.Single}`
            )
        ).toBeInTheDocument();
        expect(
            screen.getByTestId(
                `marital-status-test-id-${MaritalStatusAllowances.Married}`
            )
        ).toBeInTheDocument();
        expect(
            screen.getByTestId(
                `marital-status-test-id-${MaritalStatusAllowances.HeadOfHousehold}`
            )
        ).toBeInTheDocument();
    });

    it('should not render marital status allowances component when isMaritalStatusAllowances is false', () => {
        render(<TaxWithholdings isMaritalStatusAllowances={false} />);

        expect(screen.getByText('title')).toBeInTheDocument();
        expect(screen.getByText('federal')).toBeInTheDocument();
        expect(screen.getByText('state')).toBeInTheDocument();
        expect(screen.queryByText('maritalStatusAllowances')).toBeNull();
    });

    it('should render specified tax view component when specifiedView is true', () => {
        const onDataChange = jest.fn() as React.Dispatch<
            React.SetStateAction<any>
        >;

        render(
            <FormDataContext.Provider
                value={
                    {
                        ...defaultFormDataContext,
                        setFormTaxWithholding: onDataChange,
                    } as OtpWithdrawalFormState
                }
            >
                <TaxWithholdings specifiedView={true} />
            </FormDataContext.Provider>
        );

        expect(screen.getByText('title')).toBeInTheDocument();
        expect(screen.getByText('state')).toBeInTheDocument();

        const stateDontWithhold = screen.getByTestId(
            'State-tax-withholding-select-specified'
        );
        fireEvent.click(stateDontWithhold);

        const federalInputs = screen
            .getByTestId('State-tax-withholding-row')
            .getElementsByTagName('input');
        expect(federalInputs[0]).toBeInTheDocument(); //dollar field
        expect(federalInputs[1]).toBeInTheDocument(); //percentage field
        expect(onDataChange).toHaveBeenCalledWith({
            taxWithholding: [
                {
                    place: { text: 'State' },
                    type: { text: 'Specified Tax Withholding' },
                    amount: { text: null, amountType: null },
                    exemption: { text: null },
                    filingStatus: { text: null },
                    additionalAmount: { text: null, amountType: null },
                },
            ],
        });
    });
});
