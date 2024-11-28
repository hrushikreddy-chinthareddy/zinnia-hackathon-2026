import '@testing-library/jest-dom';

import { fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FormDataContext, defaultFormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { AddressTypes, CaseStatus } from '@deps/models/case/withdrawal/case';
import { CaseDetails } from '@deps/models/case/withdrawal/case-data';

import TaxOL4753Attachment from './tax-ol4753-attachment';

window.HTMLElement.prototype.scrollIntoView = jest.fn();
window.HTMLElement.prototype.hasPointerCapture = jest.fn();

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));

describe('TAX OL4753 Attachment Component', () => {
    // CheckboxText toggles isOL4753Attached state correctly
    const parties = [
        {
            SourceSystem: 'LC',
            Role: 'Primary Owner',
            SrcRole: 'Beneficiary',
            SrcRoleOptionId: 0,
            SrcRoleOptionIdDesc: 'Primary',
            SrcNameId: '1810084398',
            SrcRoleType: -2,
            RoleUniqueID: '1810084398|-2|0|8',
            RoleStartDate: '2022-05-04',
            RoleEndDate: '2999-12-31',
            RoleStatus: 'C',
            Gender: 'null',
            FirstName: 'null',
            MiddleName: 'null',
            LastName: 'SEE FILE FOR BENEFICIARY',
            Suffix: 'null',
            FullName: ' SEE FILE FOR BENEFICIARY',
            OrgName: 'null',
            DateOfBirth: 'null',
            TaxID: '***-**-',
            SplitPercent: 'null',
            PersonType: 'Individual',
            SrcPartyType: 'IN',
            Email: 'null',
            SrcRelToOwnerId: 'null',
            RelationshipToOwner: '',
            ElectronicAuth: 'null',
            PendingAddressUpdate: 'null',
            TaxToRole: '',
            SrcTaxToNameId: '999',
            SrcTaxToOptionId: '999',
            SrcTaxToRoleId: '999',
            SrcPhoneId: '999',
            SrcAddressId: '999',
            SrcRoleCountId: '8',
            Address: [
                {
                    SrcAddressId: '-999',
                    AddressStartDate: '2999-12-31',
                    AddressEndDate: '2999-12-31',
                    ActiveAddress: true,
                    AddressType: 'HADDR',
                    AddressTypeDesc: AddressTypes.DEFAULT,
                    MailIndicator: true,
                    AddressLine1: '1063 MIBTHCYKPO LN',
                    AddressLine2: 'null',
                    AddressLine3: 'null',
                    AddressLine4: 'null',
                    City: 'null',
                    State: 'UNK',
                    Zip: 'null',
                    ZipPlusFour: 'null',
                    Country: 'USA',
                    RoleAddress: true,
                },
            ],
            dob: [
                {
                    text: '05061939',
                },
            ],
            Phone: [
                {
                    PhoneType: 'HTELE',
                    PhoneTypeDesc: 'Default',
                    PhoneNumber: 'null',
                    PhoneCountry: '$$',
                    SrcPhoneId: '-999',
                    SrcAddressId: '-999',
                    RolePhone: true,
                },
            ],
            Banking: [],
            TaxWithHolding: [
                {
                    Type: 'Federal',
                    Exemption: '0',
                    FilingStatus: 'Default',
                    TaxRate: 'Default',
                },
                {
                    Type: 'State',
                    Exemption: '0',
                    FilingStatus: 'Default',
                    TaxRate: 'Default',
                },
                {
                    Type: 'Backup',
                    Exemption: 'null',
                    FilingStatus: 'null',
                    TaxRate: 'null',
                },
            ],
        },
    ];

    it('should toggle isOL4753Attached state when CheckboxText is clicked', () => {
        const setFormOL4753Data = jest.fn();

        const { getByLabelText, getByRole } = render(
            <FormDataContext.Provider
                value={{
                    ...defaultFormDataContext,
                    currentFormState: CaseStatus.Pending,
                    formParty: CaseDetails.data.formRequest.formParty,
                    parties,
                    setFormOL4753Data,
                }}
            >
                <TaxOL4753Attachment isFormStateReadOnly={false} shouldShowDOBInOl4573={true} />
            </FormDataContext.Provider>
        );
        const checkbox = getByLabelText(/isOL4753Attached/i);

        fireEvent.click(checkbox);

        const addressLine1Field = getByRole('textbox', { name: /mailingaddress/i });
        expect(addressLine1Field).toBeInTheDocument();
        const cityField = getByRole('textbox', { name: /city/i });
        expect(cityField).toBeInTheDocument();
        const stateField = getByRole('combobox');
        expect(stateField).toBeInTheDocument();

        const zipField = getByRole('textbox', { name: /zip/i });
        expect(zipField).toBeInTheDocument();

        const dobField = getByRole('textbox', { name: /dob/i });
        expect(dobField).toBeInTheDocument();
    });

    it('should handle input fields value changes', async () => {
        const setFormOL4753Data = jest.fn();

        const { getByLabelText, getByRole } = render(
            <FormDataContext.Provider
                value={{
                    ...defaultFormDataContext,
                    currentFormState: CaseStatus.Pending,
                    formParty: CaseDetails.data.formRequest.formParty,
                    parties,
                    setFormOL4753Data,
                }}
            >
                <TaxOL4753Attachment isFormStateReadOnly={false} shouldShowDOBInOl4573={true} />
            </FormDataContext.Provider>
        );
        const checkbox = getByLabelText(/isOL4753Attached/i);

        await waitFor(() => fireEvent.click(checkbox));

        const addressLine1Field = getByRole('textbox', { name: /mailingaddress/i });
        expect(addressLine1Field).toBeInTheDocument();
        const addressLine1 = '560 calle de la sierra';
        const expectedAddressLine1 = addressLine1.toUpperCase();
        fireEvent.change(addressLine1Field, { target: { value: addressLine1 } });
        expect(addressLine1Field).toHaveValue(expectedAddressLine1);

        const cityField = getByRole('textbox', { name: /city/i });
        expect(cityField).toBeInTheDocument();
        const city = 'ORLANDO';
        fireEvent.change(cityField, { target: { value: city } });
        expect(cityField).toHaveValue(city);

        const stateField = getByRole('combobox');
        expect(stateField).toBeInTheDocument();
        const state = 'FL';
        fireEvent.change(stateField, { target: { value: state } });
        expect(stateField).toHaveValue(state);

        const zipField = getByRole('textbox', { name: /zip/i });
        expect(zipField).toBeInTheDocument();
        const zip = '32809';
        fireEvent.change(zipField, { target: { value: zip } });
        expect(zipField).toHaveValue(zip);
    });

    it('should not display DOB field if personType is Company', async () => {
        const setFormOL4753Data = jest.fn();

        const { getByLabelText, getByRole, findByRole } = render(
            <FormDataContext.Provider
                value={{
                    ...defaultFormDataContext,
                    currentFormState: CaseStatus.Pending,
                    formParty: CaseDetails.data.formRequest.formParty,
                    parties: [{ ...parties[0], PersonType: 'Company' }],
                    setFormOL4753Data,
                }}
            >
                <TaxOL4753Attachment isFormStateReadOnly={false} shouldShowDOBInOl4573={false} />
            </FormDataContext.Provider>
        );
        const checkbox = getByLabelText(/isOL4753Attached/i);

        await fireEvent.click(checkbox);
        const addressLine1Field = getByRole('textbox', { name: /mailingaddress/i });
        expect(addressLine1Field).toBeInTheDocument();
        const addressLine1 = '560 calle de la sierra';
        const expectedAddressLine1 = addressLine1.toUpperCase();
        fireEvent.change(addressLine1Field, { target: { value: addressLine1 } });
        expect(addressLine1Field).toHaveValue(expectedAddressLine1);

        const cityField = getByRole('textbox', { name: /city/i });
        expect(cityField).toBeInTheDocument();
        const city = 'ORLANDO';
        fireEvent.change(cityField, { target: { value: city } });
        expect(cityField).toHaveValue(city);

        const stateField = await getByRole('combobox');
        expect(stateField).toBeInTheDocument();
        await userEvent.click(stateField);
        const state = 'FL';
        const option1 = await findByRole('option', { name: state });

        expect(option1).toBeInTheDocument();

        await userEvent.click(option1);

        const zipField = getByRole('textbox', { name: /zip/i });
        expect(zipField).toBeInTheDocument();
        const zip = '32809';
        fireEvent.change(zipField, { target: { value: zip } });
        expect(zipField).toHaveValue(zip);

        expect(setFormOL4753Data).toHaveBeenCalledWith({
            isAttached: { text: true },
            address: {
                addressLine1: '560 CALLE DE LA SIERRA',
                addressLine2: '',
                addressLine3: '',
                addressLine4: null,
                addressType: AddressTypes.DEFAULT,
                city: 'ORLANDO',
                country: null,
                state: 'FL',
                zip: '32809',
                zipPlusFour: '',
                isAddressChanged: false,
            },
        });
    });
});
