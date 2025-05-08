import { cleanup, render, screen } from '@testing-library/react';

import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';

import WithdrawalDrawer from './withdrawal-drawer';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));
const setIsOpenOverride = jest.fn();

describe('WithdrawalDrawer', () => {
    afterEach(cleanup);

    it('should render a component in open state with provided values', () => {
        const transactionDetail = {
            contractId: '574003587',
            documentNumber: '20240403-EM-542178',
            caseId: 'CA0000347976',
            qualType: 'Non-Qualified',
            ownerName: 'John Travolta',
            annuitantName: 'Tim Cook',
        };
        render(
            <WithdrawalDrawer
                content={transactionDetail}
                setIsOpenOverride={setIsOpenOverride}
                shouldOverlay={false}
                isNavDrawerOpen={true}
            />
        );

        expect(screen.getByText(transactionDetail.contractId)).toBeInTheDocument();
        expect(screen.getByText(transactionDetail.documentNumber)).toBeInTheDocument();
        expect(screen.getByText(transactionDetail.caseId)).toBeInTheDocument();
        expect(screen.getByText(transactionDetail.qualType)).toBeInTheDocument();
        expect(screen.getByText(transactionDetail.ownerName)).toBeInTheDocument();
        expect(screen.getByText(transactionDetail.annuitantName)).toBeInTheDocument();
        expect(screen.getByTestId('open-status-row')).toBeInTheDocument();
    });

    it('should render a component in close state with no values', () => {
        const transactionDetail = {
            contractId: '574003587',
            documentNumber: '20240403-EM-542178',
            caseId: 'CA0000347976',
            qualType: 'Non-Qualified',
            ownerName: 'John Travolta',
            annuitantName: 'Tim Cook',
        };
        render(
            <WithdrawalDrawer
                content={transactionDetail}
                setIsOpenOverride={setIsOpenOverride}
                shouldOverlay={true}
                isNavDrawerOpen={false}
            />
        );

        expect(screen.getByTestId('close-status-row')).toBeInTheDocument();
    });
});
