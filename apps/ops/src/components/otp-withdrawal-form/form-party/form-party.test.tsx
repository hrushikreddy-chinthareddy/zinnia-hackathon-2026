import '@testing-library/jest-dom';
import { fireEvent, render, renderHook, screen } from '@testing-library/react';

import getFlicOftConfig from '@deps/containers/otp/oft-forms/flic/flic-oft-form.helper';
import useDlicConfig from '@deps/containers/otp/withdrawal-forms/dlic/dlic-withdrawal-form-helper';
import getFlicConfig from '@deps/containers/otp/withdrawal-forms/flic-withdrawal-form.helper';
import getSbgcConfig from '@deps/containers/otp/withdrawal-forms/sbgc-withdrawal-form.helper';
import { FormDataContext, defaultFormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { AddressTypes, maritalStatusType, PartyRoles, PhoneTypes, QualTypes } from '@deps/models/case/withdrawal/case';
import { CaseDetails } from '@deps/models/case/withdrawal/case-data';

import FormParties from './form-party';

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
const t = jest.fn();

afterEach(() => {
    jest.clearAllMocks();
});
describe('Formparty component', () => {
    describe('FLIC Form', () => {
        it('should render empty formControls if parties object is empty', async () => {
            const { formPartyConfigs } = getFlicConfig(t, QualTypes.CustInhIRA);
            render(
                <FormDataContext.Provider value={{ ...defaultFormDataContext }}>
                    <FormParties configs={formPartyConfigs} />
                </FormDataContext.Provider>
            );
            // Personal details Fields
            const firstNameInput = screen.getAllByLabelText('firstName')[0];
            const middleNameInput = screen.getAllByLabelText('middleName')[0];
            const LastNameInput = screen.getAllByLabelText('lastName')[0];
            const emailInput = screen.getAllByLabelText('email')[0];
            const dobInput = screen.getAllByLabelText('dob')[0];
            const ssnInput = screen.getAllByLabelText('ssn')[0];
            // const maritalStatusInput = screen.queryAllByLabelText('maritalStatus')[0];

            expect(firstNameInput).toBeInTheDocument();
            expect(middleNameInput).toBeInTheDocument();
            expect(LastNameInput).toBeInTheDocument();
            expect(emailInput).toBeInTheDocument();
            expect(dobInput).toBeInTheDocument();
            expect(ssnInput).toBeInTheDocument();
            // expect(maritalStatusInput).not.toBeInTheDocument();

            // Phone Fields
            const TelephoneInput = screen.getAllByLabelText('daytimePhone')[0];
            expect(TelephoneInput).toBeInTheDocument();

            // Address Fields
            const addressLine1Input = screen.getAllByLabelText('mailingAddress')[0];
            const cityInput = screen.getAllByLabelText('city')[0];
            const stateInput = await screen.getAllByRole('combobox')[0];
            const zipInput = screen.getAllByLabelText('zip')[0];

            expect(addressLine1Input).toBeInTheDocument();
            expect(cityInput).toBeInTheDocument();
            expect(stateInput).toBeInTheDocument();
            expect(zipInput).toBeInTheDocument();
        });
        it('should render formControls based on configuration configuration', async () => {
            let setMethodArgs;
            const mockformPartyData = CaseDetails.data.formRequest.formParty;
            const setMockData = jest.fn(cb => {
                setMethodArgs = cb(mockformPartyData);
                return setMethodArgs;
            });

            const { formPartyConfigs } = getFlicConfig(t, QualTypes.CustInhIRA);
            render(
                <FormDataContext.Provider value={{ ...defaultFormDataContext, formParty: mockformPartyData, setFormParty: setMockData }}>
                    <FormParties configs={formPartyConfigs} />
                </FormDataContext.Provider>
            );
            // Personal details Fields
            const firstNameInput = screen.getAllByLabelText('firstName')[0];
            const middleNameInput = screen.getAllByLabelText('middleName')[0];
            const LastNameInput = screen.getAllByLabelText('lastName')[0];
            const emailInput = screen.getAllByLabelText('email')[0];
            const dobInput = screen.getAllByLabelText('dob')[0];
            const ssnInput = screen.getAllByLabelText('ssn')[0];
            // const maritalStatusInput = screen.queryAllByLabelText('maritalStatus')[0];

            expect(firstNameInput).toBeInTheDocument();
            expect(middleNameInput).toBeInTheDocument();
            expect(LastNameInput).toBeInTheDocument();
            expect(emailInput).toBeInTheDocument();
            expect(dobInput).toBeInTheDocument();
            expect(ssnInput).toBeInTheDocument();
            // expect(maritalStatusInput).not.toBeInTheDocument();

            // Phone Fields
            const TelephoneInput = screen.getAllByLabelText('daytimePhone')[0];
            expect(TelephoneInput).toBeInTheDocument();

            // Address Fields
            const addressLine1Input = screen.getAllByLabelText('mailingAddress')[0];
            const cityInput = screen.getAllByLabelText('city')[0];
            const stateInput = await screen.getAllByRole('combobox')[0];

            const zipInput = screen.getAllByLabelText('zip')[0];

            expect(addressLine1Input).toBeInTheDocument();
            expect(cityInput).toBeInTheDocument();
            expect(stateInput).toBeInTheDocument();
            expect(zipInput).toBeInTheDocument();

            expect(setMockData).toHaveReturnedWith({
                parties: [
                    {
                        partyRoleType: 'OWNER' as PartyRoles,
                        firstName: 'JAMES',
                        middleName: 'C',
                        lastName: 'FORD',
                        fullName: 'JAMES C FORD',
                        suffix: null,
                        dob: { text: null },
                        taxId: '572621420',
                        email: null,
                        employer: null,
                        maritalStatus: {
                            text: '' as maritalStatusType,
                        },
                        addresses: [
                            {
                                addressLine1: '560 calle de la sierra',
                                addressLine2: '',
                                addressLine3: '',
                                addressLine4: null,
                                addressType: 'DEFAULT' as AddressTypes,
                                city: '',
                                country: null,
                                state: 'CA',
                                zip: '92019-1241',
                                zipPlusFour: '',
                                isAddressChanged: false,
                            },
                            {
                                addressLine1: '',
                                addressLine2: '',
                                addressLine3: '',
                                addressLine4: null,
                                addressType: 'MAILING_ADDRESS' as AddressTypes,
                                city: '',
                                country: null,
                                state: '',
                                zip: '',
                                isAddressChanged: false,
                                zipPlusFour: '',
                            },
                        ],
                        phones: [
                            {
                                phoneCountry: 'US',
                                phoneNumber: '6192001466',
                                phoneTypeDesc: 'Default',
                                phoneType: {
                                    text: 'Owner_Phone_Day' as PhoneTypes,
                                },
                            },
                            {
                                phoneCountry: 'US',
                                phoneNumber: '6192001411',
                                phoneTypeDesc: 'Default',
                                phoneType: {
                                    text: 'Owner_Phone_Home' as PhoneTypes,
                                },
                            },
                        ],
                    },
                ],
            });
        });
        it('should render addressLine2 if available', () => {
            CaseDetails.data.formRequest.formParty.parties[0].addresses[0].addressLine2 = 'sierra2';
            const mockformPartyData = CaseDetails.data.formRequest.formParty;
            let setMethodArgs;
            const setMockData = jest.fn(cb => {
                setMethodArgs = cb(mockformPartyData);
                return setMethodArgs;
            });

            const { formPartyConfigs } = getFlicConfig(t, QualTypes.CustInhIRA);

            render(
                <FormDataContext.Provider value={{ ...defaultFormDataContext, formParty: mockformPartyData, setFormParty: setMockData }}>
                    <FormParties configs={formPartyConfigs} />
                </FormDataContext.Provider>
            );

            const addressLine2Input = screen.getAllByLabelText('mailingAddressLine2')[0] as HTMLInputElement;
            expect(addressLine2Input).toBeInTheDocument();
            expect(addressLine2Input.value).toBe('sierra2');

            expect(setMockData).toHaveReturnedWith({
                parties: [
                    {
                        partyRoleType: 'OWNER' as PartyRoles,
                        firstName: 'JAMES',
                        middleName: 'C',
                        lastName: 'FORD',
                        fullName: 'JAMES C FORD',
                        suffix: null,
                        dob: { text: null },
                        taxId: '572621420',
                        email: null,
                        employer: null,
                        maritalStatus: {
                            text: '' as maritalStatusType,
                        },
                        addresses: [
                            {
                                addressLine1: '560 calle de la sierra',
                                addressLine2: 'sierra2',
                                addressLine3: '',
                                addressLine4: null,
                                addressType: 'DEFAULT' as AddressTypes,
                                city: '',
                                country: null,
                                state: 'CA',
                                zip: '92019-1241',
                                zipPlusFour: '',
                                isAddressChanged: false,
                            },
                            {
                                addressLine1: '',
                                addressLine2: '',
                                addressLine3: '',
                                addressLine4: null,
                                addressType: 'MAILING_ADDRESS' as AddressTypes,
                                city: '',
                                country: null,
                                state: '',
                                zip: '',
                                isAddressChanged: false,
                                zipPlusFour: '',
                            },
                        ],
                        phones: [
                            {
                                phoneCountry: 'US',
                                phoneNumber: '6192001466',
                                phoneTypeDesc: 'Default',
                                phoneType: {
                                    text: 'Owner_Phone_Day' as PhoneTypes,
                                },
                            },
                            {
                                phoneCountry: 'US',
                                phoneNumber: '6192001411',
                                phoneTypeDesc: 'Default',
                                phoneType: {
                                    text: 'Owner_Phone_Home' as PhoneTypes,
                                },
                            },
                        ],
                    },
                ],
            });
        });
    });

    describe('SBGC Form', () => {
        it('should render empty formControls if parties object is empty', async () => {
            const { formPartyConfigs } = getSbgcConfig(t);
            render(
                <FormDataContext.Provider value={{ ...defaultFormDataContext }}>
                    <FormParties configs={formPartyConfigs} />
                </FormDataContext.Provider>
            );
            // Personal details Fields
            const firstNameInput = screen.getAllByLabelText('firstName')[0];
            const middleNameInput = screen.getAllByLabelText('middleName')[0];
            const LastNameInput = screen.getAllByLabelText('lastName')[0];
            const ssnInput = screen.getAllByLabelText('ssn')[0];
            // const maritalStatusInput = screen.queryAllByLabelText('maritalStatus')[0];

            expect(firstNameInput).toBeInTheDocument();
            expect(middleNameInput).toBeInTheDocument();
            expect(LastNameInput).toBeInTheDocument();
            expect(ssnInput).toBeInTheDocument();
            // expect(maritalStatusInput).not.toBeInTheDocument();

            // Phone Fields
            const ownerPhoneDayInput = screen.getAllByLabelText('daytimePhone')[0];
            expect(ownerPhoneDayInput).toBeInTheDocument();

            const OwnerPhoneHomeInput = screen.getAllByLabelText('daytimePhone')[1];
            expect(OwnerPhoneHomeInput).toBeInTheDocument();

            // Address Fields
            const addressLine1Input = screen.getAllByLabelText('mailingAddress')[0];
            const cityInput = screen.getAllByLabelText('city')[0];
            const stateInput = await screen.getAllByRole('combobox')[0];

            const zipInput = screen.getAllByLabelText('zip')[0];

            expect(addressLine1Input).toBeInTheDocument();
            expect(cityInput).toBeInTheDocument();
            expect(stateInput).toBeInTheDocument();
            expect(zipInput).toBeInTheDocument();
        });

        it('should render formControls based on configuration', async () => {
            const { formPartyConfigs } = getSbgcConfig(t);
            CaseDetails.data.formRequest.formParty.parties[0].addresses[0].addressLine2 = null;

            let setMethodArgs;
            const mockformPartyData = CaseDetails.data.formRequest.formParty;
            const setMockData = jest.fn(cb => {
                setMethodArgs = cb(mockformPartyData);
                return setMethodArgs;
            });

            render(
                <FormDataContext.Provider value={{ ...defaultFormDataContext, formParty: mockformPartyData, setFormParty: setMockData }}>
                    <FormParties configs={formPartyConfigs} />
                </FormDataContext.Provider>
            );
            // Personal details Fields
            const firstNameInput = screen.getAllByLabelText('firstName')[0];
            const middleNameInput = screen.getAllByLabelText('middleName')[0];
            const LastNameInput = screen.getAllByLabelText('lastName')[0];
            const ssnInput = screen.getAllByLabelText('ssn')[0];
            // const maritalStatusInput = screen.queryAllByLabelText('maritalStatus')[0];

            expect(firstNameInput).toBeInTheDocument();
            expect(middleNameInput).toBeInTheDocument();
            expect(LastNameInput).toBeInTheDocument();
            expect(ssnInput).toBeInTheDocument();
            // expect(maritalStatusInput).not.toBeInTheDocument();

            // Phone Fields
            const ownerPhoneDayInput = screen.getAllByLabelText('daytimePhone')[0];
            expect(ownerPhoneDayInput).toBeInTheDocument();

            const OwnerPhoneHomeInput = screen.getAllByLabelText('daytimePhone')[1];
            expect(OwnerPhoneHomeInput).toBeInTheDocument();

            // Address Fields
            const addressLine1Input = screen.getAllByLabelText('mailingAddress')[0];
            const cityInput = screen.getAllByLabelText('city')[0];
            const stateInput = await screen.getAllByRole('combobox')[0];

            const zipInput = screen.getAllByLabelText('zip')[0];

            expect(addressLine1Input).toBeInTheDocument();
            expect(cityInput).toBeInTheDocument();
            expect(stateInput).toBeInTheDocument();
            expect(zipInput).toBeInTheDocument();

            expect(setMockData).toHaveReturnedWith({
                parties: [
                    {
                        partyRoleType: 'OWNER' as PartyRoles,
                        firstName: 'JAMES',
                        middleName: 'C',
                        lastName: 'FORD',
                        fullName: 'JAMES C FORD',
                        suffix: null,
                        dob: { text: null },
                        taxId: '572621420',
                        email: null,
                        employer: null,
                        maritalStatus: {
                            text: '' as maritalStatusType,
                        },
                        addresses: [
                            {
                                addressLine1: '560 calle de la sierra',
                                addressLine2: '',
                                addressLine3: '',
                                addressLine4: null,
                                addressType: 'DEFAULT' as AddressTypes,
                                city: '',
                                country: null,
                                state: 'CA',
                                zip: '92019-1241',
                                zipPlusFour: '',
                                isAddressChanged: false,
                            },
                            {
                                addressLine1: '',
                                addressLine2: '',
                                addressLine3: '',
                                addressLine4: null,
                                addressType: 'MAILING_ADDRESS' as AddressTypes,
                                city: '',
                                country: null,
                                state: '',
                                zip: '',
                                isAddressChanged: false,
                                zipPlusFour: '',
                            },
                        ],
                        phones: [
                            {
                                phoneCountry: 'US',
                                phoneNumber: '6192001466',
                                phoneTypeDesc: 'Default',
                                phoneType: {
                                    text: 'Owner_Phone_Day' as PhoneTypes,
                                },
                            },
                            {
                                phoneCountry: 'US',
                                phoneNumber: '6192001411',
                                phoneTypeDesc: 'Default',
                                phoneType: {
                                    text: 'Owner_Phone_Home' as PhoneTypes,
                                },
                            },
                        ],
                    },
                ],
            });
        });
        it('should render addressLine2 if available', () => {
            const { formPartyConfigs } = getSbgcConfig(t);
            CaseDetails.data.formRequest.formParty.parties[0].addresses[0].addressLine2 = 'sierra2';
            let setMethodArgs;
            const mockformPartyData = CaseDetails.data.formRequest.formParty;
            const setMockData = jest.fn(cb => {
                setMethodArgs = cb(mockformPartyData);
                return setMethodArgs;
            });

            render(
                <FormDataContext.Provider value={{ ...defaultFormDataContext, formParty: mockformPartyData, setFormParty: setMockData }}>
                    <FormParties configs={formPartyConfigs} />
                </FormDataContext.Provider>
            );

            const addressLine2Input = screen.getAllByLabelText('mailingAddressLine2')[0] as HTMLInputElement;
            expect(addressLine2Input).toBeInTheDocument();
            expect(addressLine2Input.value).toBe('sierra2');

            expect(setMockData).toHaveReturnedWith({
                parties: [
                    {
                        partyRoleType: 'OWNER' as PartyRoles,
                        firstName: 'JAMES',
                        middleName: 'C',
                        lastName: 'FORD',
                        fullName: 'JAMES C FORD',
                        suffix: null,
                        dob: { text: null },
                        taxId: '572621420',
                        email: null,
                        employer: null,
                        maritalStatus: {
                            text: '' as maritalStatusType,
                        },
                        addresses: [
                            {
                                addressLine1: '560 calle de la sierra',
                                addressLine2: 'sierra2',
                                addressLine3: '',
                                addressLine4: null,
                                addressType: 'DEFAULT' as AddressTypes,
                                city: '',
                                country: null,
                                state: 'CA',
                                zip: '92019-1241',
                                zipPlusFour: '',
                                isAddressChanged: false,
                            },
                            {
                                addressLine1: '',
                                addressLine2: '',
                                addressLine3: '',
                                addressLine4: null,
                                addressType: 'MAILING_ADDRESS' as AddressTypes,
                                city: '',
                                country: null,
                                state: '',
                                zip: '',
                                isAddressChanged: false,
                                zipPlusFour: '',
                            },
                        ],
                        phones: [
                            {
                                phoneCountry: 'US',
                                phoneNumber: '6192001466',
                                phoneTypeDesc: 'Default',
                                phoneType: {
                                    text: 'Owner_Phone_Day' as PhoneTypes,
                                },
                            },
                            {
                                phoneCountry: 'US',
                                phoneNumber: '6192001411',
                                phoneTypeDesc: 'Default',
                                phoneType: {
                                    text: 'Owner_Phone_Home' as PhoneTypes,
                                },
                            },
                        ],
                    },
                ],
            });
        });
    });

    describe('DLIC Withdrawal Form', () => {
        it('should render empty party formControls if parties object is empty', () => {
            const {
                result: { current },
            } = renderHook(() => useDlicConfig(t));
            render(
                <FormDataContext.Provider value={{ ...defaultFormDataContext }}>
                    <FormParties configs={current.formPartyConfigs} />
                </FormDataContext.Provider>
            );
            // Personal details Fields
            const firstNameInput = screen.getAllByLabelText('firstName')[0];
            const middleNameInput = screen.getAllByLabelText('middleName')[0];
            const LastNameInput = screen.getAllByLabelText('lastName')[0];
            const ssnInput = screen.getAllByLabelText('ssn')[0];
            // const maritalStatusInput = screen.queryAllByLabelText('maritalStatus')[0];

            expect(firstNameInput).toBeInTheDocument();
            expect(middleNameInput).toBeInTheDocument();
            expect(LastNameInput).toBeInTheDocument();
            expect(ssnInput).toBeInTheDocument();
            // expect(maritalStatusInput).not.toBeInTheDocument();

            // Phone Fields
            const ownerPhoneDayInput = screen.getAllByLabelText('daytimePhone')[0];
            expect(ownerPhoneDayInput).toBeInTheDocument();

            const OwnerPhoneHomeInput = screen.getAllByLabelText('daytimePhone')[1];
            expect(OwnerPhoneHomeInput).toBeInTheDocument();

            // Address Fields
            const addressHasChanged = screen.getAllByLabelText('addressDetails.checkHereIfYourAddressHasChanged')[0];
            expect(addressHasChanged).toBeInTheDocument();
        });

        it('should render empty address formControls on address changed checkbox selection', async () => {
            let setMethodArgs;
            const mockformPartyData = {
                parties: [
                    {
                        partyRoleType: 'OWNER' as PartyRoles,
                        firstName: 'JAMES',
                        middleName: 'C',
                        lastName: 'FORD',
                        fullName: 'JAMES C FORD',
                        suffix: null,
                        dob: { text: null },
                        taxId: '572621420',
                        email: null,
                        employer: null,
                        maritalStatus: {
                            text: '' as maritalStatusType,
                        },
                        addresses: [
                            {
                                addressLine1: '',
                                addressLine2: '',
                                addressLine3: '',
                                addressLine4: null,
                                addressType: 'DEFAULT' as AddressTypes,
                                city: '',
                                country: null,
                                state: '',
                                zip: '',
                                zipPlusFour: '',
                                isAddressChanged: false,
                            },
                            {
                                addressLine1: '',
                                addressLine2: '',
                                addressLine3: '',
                                addressLine4: null,
                                addressType: 'MAILING_ADDRESS' as AddressTypes,
                                city: '',
                                country: null,
                                isAddressChanged: false,
                                state: '',
                                zip: '',
                                zipPlusFour: '',
                            },
                        ],
                        phones: [
                            {
                                phoneCountry: 'US',
                                phoneNumber: '6192001466',
                                phoneTypeDesc: 'Default',
                                phoneType: {
                                    text: 'Owner_Phone_Day' as PhoneTypes,
                                },
                            },
                            {
                                phoneCountry: 'US',
                                phoneNumber: '6192001411',
                                phoneTypeDesc: 'Default',
                                phoneType: {
                                    text: 'Owner_Phone_Home' as PhoneTypes,
                                },
                            },
                        ],
                    },
                ],
            };
            const setMockData = jest.fn(cb => {
                setMethodArgs = cb(mockformPartyData);
                return setMethodArgs;
            });

            const {
                result: { current },
            } = renderHook(() => useDlicConfig(t));

            // CaseDetails.data.formRequest.formParty.parties = parties;
            render(
                <FormDataContext.Provider value={{ ...defaultFormDataContext, formParty: mockformPartyData, setFormParty: setMockData }}>
                    <FormParties configs={current.formPartyConfigs} />
                </FormDataContext.Provider>
            );
            // Personal details Fields
            const firstNameInput = screen.getAllByLabelText('firstName')[0];
            const middleNameInput = screen.getAllByLabelText('middleName')[0];
            const LastNameInput = screen.getAllByLabelText('lastName')[0];
            const ssnInput = screen.getAllByLabelText('ssn')[0];
            // const maritalStatusInput = screen.queryAllByLabelText('maritalStatus')[0];

            expect(firstNameInput).toBeInTheDocument();
            expect(middleNameInput).toBeInTheDocument();
            expect(LastNameInput).toBeInTheDocument();
            expect(ssnInput).toBeInTheDocument();
            // expect(maritalStatusInput).not.toBeInTheDocument();

            // Phone Fields
            const ownerPhoneDayInput = screen.getAllByLabelText('daytimePhone')[0];
            expect(ownerPhoneDayInput).toBeInTheDocument();

            const OwnerPhoneHomeInput = screen.getAllByLabelText('daytimePhone')[1];
            expect(OwnerPhoneHomeInput).toBeInTheDocument();

            const addressHasChanged = screen.getAllByLabelText('addressDetails.checkHereIfYourAddressHasChanged')[0];
            fireEvent.click(addressHasChanged);
            expect(addressHasChanged).toBeInTheDocument();

            // Address Fields
            const addressLine1Input = screen.getAllByLabelText('mailingAddress')[0];
            const cityInput = screen.getAllByLabelText('city')[0];
            const stateInput = await screen.getAllByRole('combobox')[0];

            const zipInput = screen.getAllByLabelText('zip')[0];

            expect(addressLine1Input).toBeInTheDocument();
            expect(cityInput).toBeInTheDocument();
            expect(stateInput).toBeInTheDocument();
            expect(zipInput).toBeInTheDocument();

            expect(setMockData).toHaveReturnedWith({
                parties: [
                    {
                        partyRoleType: 'OWNER' as PartyRoles,
                        firstName: 'JAMES',
                        middleName: 'C',
                        lastName: 'FORD',
                        fullName: 'JAMES C FORD',
                        suffix: null,
                        dob: { text: null },
                        taxId: '572621420',
                        email: null,
                        employer: null,
                        maritalStatus: {
                            text: '' as maritalStatusType,
                        },
                        addresses: [
                            {
                                addressLine1: '',
                                addressLine2: '',
                                addressLine3: '',
                                addressLine4: null,
                                addressType: 'DEFAULT' as AddressTypes,
                                city: '',
                                country: null,
                                state: '',
                                zip: '',
                                zipPlusFour: '',
                                isAddressChanged: true,
                            },
                            {
                                addressLine1: '',
                                addressLine2: '',
                                addressLine3: '',
                                addressLine4: null,
                                addressType: 'MAILING_ADDRESS',
                                city: '',
                                country: null,
                                isAddressChanged: false,
                                state: '',
                                zip: '',
                                zipPlusFour: '',
                            },
                        ],
                        phones: [
                            {
                                phoneCountry: 'US',
                                phoneNumber: '6192001466',
                                phoneTypeDesc: 'Default',
                                phoneType: {
                                    text: 'Owner_Phone_Day' as PhoneTypes,
                                },
                            },
                            {
                                phoneCountry: 'US',
                                phoneNumber: '6192001411',
                                phoneTypeDesc: 'Default',
                                phoneType: {
                                    text: 'Owner_Phone_Home' as PhoneTypes,
                                },
                            },
                        ],
                    },
                ],
            });
        });
    });

    describe('OFT FLIC Form', () => {
        it('Should not render Address controls for flic withdrawal', () => {
            const { formPartyConfigs } = getFlicOftConfig(t);
            let setMethodArgs;
            const mockformPartyData = CaseDetails.data.formRequest.formParty;
            const setMockData = jest.fn(cb => {
                setMethodArgs = cb(mockformPartyData);
                return setMethodArgs;
            });

            render(
                <FormDataContext.Provider value={{ ...defaultFormDataContext, formParty: mockformPartyData, setFormParty: setMockData }}>
                    <FormParties configs={formPartyConfigs} />
                </FormDataContext.Provider>
            );
            // Personal details Fields
            const firstNameInput = screen.getAllByLabelText('firstName')[0];
            const middleNameInput = screen.getAllByLabelText('middleName')[0];
            const LastNameInput = screen.getAllByLabelText('lastName')[0];
            const dobInput = screen.getAllByLabelText('dob')[0];
            const ssnInput = screen.getAllByLabelText('ssn')[0];

            expect(firstNameInput).toBeInTheDocument();
            expect(middleNameInput).toBeInTheDocument();
            expect(LastNameInput).toBeInTheDocument();
            expect(dobInput).toBeInTheDocument();
            expect(ssnInput).toBeInTheDocument();

            // Phone Fields
            const TelephoneInput = screen.getAllByLabelText('daytimePhone')[0];
            expect(TelephoneInput).toBeInTheDocument();

            // should not display Address Fields
            const addressLine1Input = screen.queryByLabelText('mailingAddress') as HTMLInputElement;
            const cityInput = screen.queryByLabelText('city') as HTMLInputElement;
            const stateInput = screen.queryByLabelText('state') as HTMLInputElement;
            const zipInput = screen.queryByLabelText('zip') as HTMLInputElement;

            expect(addressLine1Input).not.toBeInTheDocument();
            expect(cityInput).not.toBeInTheDocument();
            expect(stateInput).not.toBeInTheDocument();
            expect(zipInput).not.toBeInTheDocument();

            expect(setMockData).toHaveReturnedWith({
                parties: [
                    {
                        partyRoleType: 'OWNER' as PartyRoles,
                        firstName: 'JAMES',
                        middleName: 'C',
                        lastName: 'FORD',
                        fullName: 'JAMES C FORD',
                        suffix: null,
                        dob: { text: null },
                        taxId: '572621420',
                        email: null,
                        employer: null,
                        maritalStatus: {
                            text: '' as maritalStatusType,
                        },
                        addresses: [
                            {
                                addressLine1: '560 calle de la sierra',
                                addressLine2: 'sierra2',
                                addressLine3: '',
                                addressLine4: null,
                                addressType: 'DEFAULT' as AddressTypes,
                                city: '',
                                country: null,
                                state: 'CA',
                                zip: '92019-1241',
                                zipPlusFour: '',
                                isAddressChanged: false,
                            },
                            {
                                addressLine1: '',
                                addressLine2: '',
                                addressLine3: '',
                                addressLine4: null,
                                addressType: 'MAILING_ADDRESS' as AddressTypes,
                                city: '',
                                country: null,
                                state: '',
                                zip: '',
                                zipPlusFour: '',
                                isAddressChanged: false,
                            },
                        ],
                        phones: [
                            {
                                phoneCountry: 'US',
                                phoneNumber: '6192001466',
                                phoneTypeDesc: 'Default',
                                phoneType: {
                                    text: 'Owner_Phone_Day' as PhoneTypes,
                                },
                            },
                            {
                                phoneCountry: 'US',
                                phoneNumber: '6192001411',
                                phoneTypeDesc: 'Default',
                                phoneType: {
                                    text: 'Owner_Phone_Home' as PhoneTypes,
                                },
                            },
                        ],
                    },
                ],
            });
        });
    });
});
