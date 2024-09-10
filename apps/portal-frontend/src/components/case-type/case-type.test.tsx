import { render, screen } from '@testing-library/react';
import React from 'react';

import { toTitleCase } from '@deps/helpers/string.helper';
import { Processes } from '@deps/models/case/case';

import CaseType from './case-type';

describe('CaseType component', () => {
    const subType = 'INCOMING TRANSFER';

    test('renders NewBusiness with table-column variant', () => {
        render(<CaseType caseType={Processes.NewBusiness} subType={subType} variant="table-column" />);

        const caseTypeLabel = screen.getByText(/caseType.newBusiness/i);
        const subTypeTest = screen.getByText(toTitleCase(subType));

        expect(caseTypeLabel).toBeInTheDocument();
        expect(subTypeTest).toBeInTheDocument();
    });

    test('renders NewBusiness with horizontal variant', () => {
        render(<CaseType caseType={Processes.NewBusiness} variant="horizontal" />);

        const caseTypeLabel = screen.getByText(/caseType.newBusiness/i);

        expect(caseTypeLabel).toBeInTheDocument();
    });

    test('renders Redemption with table-column variant', () => {
        render(<CaseType caseType={Processes.Redemption} variant="table-column" />);

        const caseTypeLabel = screen.getByText(/caseType.redemption/i);

        expect(caseTypeLabel).toBeInTheDocument();
    });

    test('renders Redemption with horizontal variant', () => {
        render(<CaseType caseType={Processes.Redemption} subType={subType} variant="horizontal" />);

        const caseTypeLabel = screen.getByText(/caseType.redemption/i);
        const subTypeTest = screen.getByText(toTitleCase(subType));

        expect(caseTypeLabel).toBeInTheDocument();
        expect(subTypeTest).toBeInTheDocument();
    });

    test('renders Renewal with table-column variant', () => {
        render(<CaseType caseType={Processes.Renewal} variant="table-column" />);

        const caseTypeLabel = screen.getByText(/caseType.renewal/i);

        expect(caseTypeLabel).toBeInTheDocument();
    });

    test('renders Renewal with horizontal variant', () => {
        render(<CaseType caseType={Processes.Renewal} subType={subType} variant="horizontal" />);

        const caseTypeLabel = screen.getByText(/caseType.renewal/i);
        const subTypeTest = screen.getByText(toTitleCase(subType));

        expect(caseTypeLabel).toBeInTheDocument();
        expect(subTypeTest).toBeInTheDocument();
    });

    test('renders Withdrawal with table-column variant', () => {
        render(<CaseType caseType={Processes.Withdrawal} variant="table-column" />);

        const caseTypeLabel = screen.getByText(/caseType.withdrawal/i);

        expect(caseTypeLabel).toBeInTheDocument();
    });

    test('renders Withdrawal with horizontal variant', () => {
        render(<CaseType caseType={Processes.Withdrawal} subType={subType} variant="horizontal" />);

        const caseTypeLabel = screen.getByText(/caseType.withdrawal/i);
        const subTypeTest = screen.getByText(toTitleCase(subType));

        expect(caseTypeLabel).toBeInTheDocument();
        expect(subTypeTest).toBeInTheDocument();
    });
});
