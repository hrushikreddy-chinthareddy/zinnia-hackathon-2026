import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import MartialStatusAllowancesWithholdings, {
    MaritalStatusAllowances,
} from './maritial-status-allowance-withholdings';

describe('MartialStatusAllowancesWithholdings', () => {
    afterEach(cleanup);

    it('should render marital status allowances component', () => {
        const maritalAllowances = {
            allowances: [],
            exemption: { text: '0' },
            multipleAllowances: { text: true },
        };
        const setMaritalAllowances = jest.fn();
        render(
            <MartialStatusAllowancesWithholdings
                maritalAllowances={maritalAllowances}
                setMaritalAllowances={setMaritalAllowances}
            />
        );

        const maritalStatusAllowancesCheckbox = screen.getByTestId(
            'marital-status-allowances-test-id'
        );
        expect(maritalStatusAllowancesCheckbox).toBeInTheDocument();
        expect(maritalStatusAllowancesCheckbox).toBeChecked();

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

        const singleCheckbox = screen.getByTestId(
            `marital-status-test-id-${MaritalStatusAllowances.Single}`
        );
        expect(singleCheckbox).toBeInTheDocument();
        expect(singleCheckbox).not.toBeChecked();

        const marriedCheckbox = screen.getByTestId(
            `marital-status-test-id-${MaritalStatusAllowances.Married}`
        );
        expect(marriedCheckbox).toBeInTheDocument();
        expect(marriedCheckbox).not.toBeChecked();

        const heaOfHousholdCheckbox = screen.getByTestId(
            `marital-status-test-id-${MaritalStatusAllowances.HeadOfHousehold}`
        );
        expect(heaOfHousholdCheckbox).toBeInTheDocument();
        expect(heaOfHousholdCheckbox).not.toBeChecked();

        const noOfAllowanceInput = screen.getByTestId(
            'no-of-allowances-test-id'
        );
        expect(noOfAllowanceInput).toBeInTheDocument();
        expect(noOfAllowanceInput).toHaveValue(
            maritalAllowances.exemption.text
        );
    });

    it('should render marital status allowances component along with passed state', () => {
        const maritalAllowances = {
            allowances: [
                {
                    text: MaritalStatusAllowances.Single,
                },
            ],
            exemption: { text: '11' },
            multipleAllowances: { text: true },
        };
        const setMaritalAllowances = jest.fn();

        render(
            <MartialStatusAllowancesWithholdings
                maritalAllowances={maritalAllowances}
                setMaritalAllowances={setMaritalAllowances}
            />
        );

        const maritalStatusAllowancesCheckbox = screen.getByTestId(
            'marital-status-allowances-test-id'
        );
        expect(maritalStatusAllowancesCheckbox).toBeInTheDocument();
        expect(maritalStatusAllowancesCheckbox).toBeChecked();

        const singleCheckbox = screen.getByTestId(
            `marital-status-test-id-${MaritalStatusAllowances.Single}`
        );
        expect(singleCheckbox).toBeInTheDocument();
        expect(singleCheckbox).toBeChecked();

        const marriedCheckbox = screen.getByTestId(
            `marital-status-test-id-${MaritalStatusAllowances.Married}`
        );
        expect(marriedCheckbox).toBeInTheDocument();
        expect(marriedCheckbox).not.toBeChecked();

        const heaOfHousholdCheckbox = screen.getByTestId(
            `marital-status-test-id-${MaritalStatusAllowances.HeadOfHousehold}`
        );
        expect(heaOfHousholdCheckbox).toBeInTheDocument();
        expect(heaOfHousholdCheckbox).not.toBeChecked();

        const noOfAllowanceInput = screen.getByTestId(
            'no-of-allowances-test-id'
        );
        expect(noOfAllowanceInput).toBeInTheDocument();
        expect(noOfAllowanceInput).toHaveValue(
            maritalAllowances.exemption.text
        );
    });

    it('should renders marital status allowances and handle user interaction', () => {
        const maritalAllowances = {
            allowances: [],
            exemption: { text: '0' },
            multipleAllowances: { text: true },
        };
        const setMaritalAllowances = jest.fn();

        render(
            <MartialStatusAllowancesWithholdings
                maritalAllowances={maritalAllowances}
                setMaritalAllowances={setMaritalAllowances}
            />
        );

        const maritalStatusAllowancesCheckbox = screen.getByTestId(
            'marital-status-allowances-test-id'
        );
        expect(maritalStatusAllowancesCheckbox).toBeInTheDocument();
        expect(maritalStatusAllowancesCheckbox).toBeChecked();

        const singleCheckbox = screen.getByTestId(
            `marital-status-test-id-${MaritalStatusAllowances.Single}`
        );
        expect(singleCheckbox).toBeInTheDocument();
        fireEvent.click(singleCheckbox);
        expect(singleCheckbox).toBeChecked();

        const marriedCheckbox = screen.getByTestId(
            `marital-status-test-id-${MaritalStatusAllowances.Married}`
        );
        expect(marriedCheckbox).toBeInTheDocument();
        fireEvent.click(marriedCheckbox);
        expect(marriedCheckbox).toBeChecked();

        const heaOfHousholdCheckbox = screen.getByTestId(
            `marital-status-test-id-${MaritalStatusAllowances.HeadOfHousehold}`
        );
        expect(heaOfHousholdCheckbox).toBeInTheDocument();
        fireEvent.click(heaOfHousholdCheckbox);
        expect(heaOfHousholdCheckbox).toBeChecked();

        const noOfAllowanceInput = screen.getByTestId(
            'no-of-allowances-test-id'
        );
        expect(noOfAllowanceInput).toBeInTheDocument();
        expect(noOfAllowanceInput).toHaveValue(
            maritalAllowances.exemption.text
        );
        const value = '121';
        fireEvent.change(noOfAllowanceInput, { target: { value } });
        expect(noOfAllowanceInput).toHaveValue(value);
    });
});
