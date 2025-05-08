import { render, screen } from '@testing-library/react';
import dayjs from 'dayjs';

import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import { DisclosureAuthorization } from './disclosure-authorization';
import getMassMutualReg60Config from '../../mass-mutual/mass-mutual-reg60-form-helper';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));

describe('#DisclosureAuthorization', () => {
    it('Should render disclosure authorization component', async () => {
        const t = jest.fn();
        const { disclosureAuthorizationConfig } = getMassMutualReg60Config(t);
        const onDataChange = jest.fn();
        const disclosureAuthorizationInfo = {
            signatureDate: '',
            expectedAcctValue: '',
            product: '',
            cdscPeriod: '',
        };

        render(
            <DisclosureAuthorization
                fields={disclosureAuthorizationConfig.fields}
                disclosureAuthorizationInfo={disclosureAuthorizationInfo}
                formErrors={{}}
                onDataChange={onDataChange}
            />
        );

        const signatureDate = screen.getByTestId('signature-date-test-id');
        expect(signatureDate).toBeInTheDocument();
        const expectedAccValue = screen.getByTestId('expected-acct-value-test-id');
        expect(expectedAccValue).toBeInTheDocument();
        const buttons = screen.getAllByRole('combobox');
        expect(buttons.length).toBe(2);
        expect(buttons[0]).toBeInTheDocument();
        expect(buttons[1]).toBeInTheDocument();
    });

    it('Should render disclosure authorization component', async () => {
        const t = jest.fn();
        const { disclosureAuthorizationConfig } = getMassMutualReg60Config(t);
        const onDataChange = jest.fn();
        const disclosureAuthorizationInfo = {
            signatureDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
            expectedAcctValue: '1000',
            product: 'RETIRE_EASE',
            cdscPeriod: '1YEAR_GUARANTEE',
        };

        render(
            <DisclosureAuthorization
                fields={disclosureAuthorizationConfig.fields}
                disclosureAuthorizationInfo={disclosureAuthorizationInfo}
                formErrors={{}}
                onDataChange={onDataChange}
            />
        );

        const signatureDate = screen.getByTestId('signature-date-test-id');
        expect(signatureDate).toBeInTheDocument();
        const expectedAccValue = screen.getByTestId('expected-acct-value-test-id');
        expect(expectedAccValue).toBeInTheDocument();
        const buttons = screen.getAllByRole('combobox');
        expect(buttons.length).toBe(2);
        expect(buttons[0]).toBeInTheDocument();
        expect(buttons[1]).toBeInTheDocument();
    });
});
