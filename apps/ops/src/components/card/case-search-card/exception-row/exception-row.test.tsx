import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';

import { ExceptionStatuses } from '@deps/models/case/exception-instance';

import ExceptionRow from './exception-row';

afterEach(cleanup);

const generateExceptionsArray = (count: number, daysAgo: number) =>
    Array.from({ length: count }, (_, index) => ({
        id: String(index + 1),
        status: ExceptionStatuses.New,
        category: 'Not used in search page',
        reason: "Address doesn't match what is on file.",
        detailedReason: "Address doesn't match what is on file.",
        additionalData: {},
        eventRef: [],
        updatedAt: new Date(
            Date.now() - daysAgo * 24 * 60 * 60 * 1000
        ).toISOString(),
        createdAt: new Date(
            Date.now() - daysAgo * 24 * 60 * 60 * 1000
        ).toISOString(),
    }));

describe('ExceptionRow Component', () => {
    it('Should render a ExceptionRow component created today', () => {
        render(<ExceptionRow exceptions={generateExceptionsArray(1, 0)} />);
        expect(screen.getByTestId('exception-days-ago-0')).toBeInTheDocument();
    });

    it('Should render a ExceptionRow component created 1 day ago', () => {
        render(<ExceptionRow exceptions={generateExceptionsArray(1, 1)} />);
        expect(screen.getByTestId('exception-days-ago-1')).toBeInTheDocument();
    });

    it('Should render a ExceptionRow component created 3 days ago', () => {
        render(<ExceptionRow exceptions={generateExceptionsArray(1, 3)} />);
        expect(screen.getByTestId('exception-days-ago-3')).toBeInTheDocument();
    });

    it('Should render a ExceptionRow component created 1 day ago with 1 exception remaining', () => {
        render(<ExceptionRow exceptions={generateExceptionsArray(2, 1)} />);
        expect(screen.getByTestId('exception-days-ago-1')).toBeInTheDocument();
        expect(screen.getByTestId('exception-remaining-1')).toBeInTheDocument();
    });

    it('Should render a ExceptionRow component created 1 day ago with 2 exceptions remaining', () => {
        render(<ExceptionRow exceptions={generateExceptionsArray(3, 1)} />);
        expect(screen.getByTestId('exception-days-ago-1')).toBeInTheDocument();
        expect(screen.getByTestId('exception-remaining-2')).toBeInTheDocument();
    });
});
