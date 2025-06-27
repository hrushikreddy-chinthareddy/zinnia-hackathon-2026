import { cleanup, render, screen } from '@testing-library/react';

import { ProgressBarTest } from '@deps/jest/constants/test-id-constants';

import ProgressBar from './progress-bar';

afterEach(cleanup);

describe('ProgressBar', () => {
    it('> renders ProgressBar component with correct values', () => {
        const compareValue = 30;
        const total = 50;
        const label = 'Example Label';

        render(
            <ProgressBar
                compareValue={compareValue}
                total={total}
                label={label}
            />
        );

        expect(
            screen.getByTestId(ProgressBarTest.PROGRESSBAR)
        ).toBeInTheDocument();
        expect(
            screen.getByTestId(ProgressBarTest.COMPAREVALUE)
        ).toBeInTheDocument();
        expect(screen.getByTestId(ProgressBarTest.TOTAL)).toBeInTheDocument();
        expect(screen.getByTestId(ProgressBarTest.LABEL)).toBeInTheDocument();
    });
});
