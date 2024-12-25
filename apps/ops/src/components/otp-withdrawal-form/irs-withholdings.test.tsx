// Full corrected version of the test file
import '@testing-library/jest-dom';
import { cleanup, screen, fireEvent, render } from '@testing-library/react';

import { FormDataContext, defaultFormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import { TaxWithholdingPlace, AmountType, WithholdingType, PartyRoles, CaseStatus, IrsFormType, AddressTypes } from '@deps/models/case/withdrawal/case';
import { CaseDetails } from '@deps/models/case/withdrawal/case-data';

import IrsWithholding from './irs-withholdings';
import { SignatureFields } from './signature-validation/signature-validation-parts/signature-parts';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));

describe('IRS Withholding Component', () => {
    afterEach(cleanup);

    const irsSignatureConfig = [
        {
            component: SignatureFields.SignaturePresent,
            key: 'irs-signature-sign-present',
        },
        {
            component: SignatureFields.SignatureDate,
            key: 'irs-signature-sign-date',
        },
    ];

    const w4pSignaturesConfig = [
        {
            component: SignatureFields.SignaturePresent,
            key: 'w4p-signature-sign-present',
        },
        {
            component: SignatureFields.SignatureDate,
            key: 'w4p-signature-sign-date',
        },
        {
            component: SignatureFields.SignatureType,
            key: 'w4p-owner-type',
        },
    ];

    it('should render IRS withholding fields if W-4R option checked', async () => {
        render(
            <FormDataContext.Provider value={{ ...defaultFormDataContext, currentFormState: CaseStatus.Pending, formParty: CaseDetails.data.formRequest.formParty }}>
                <IrsWithholding signatureFields={irsSignatureConfig} w4pSignaturesConfig={w4pSignaturesConfig} />
            </FormDataContext.Provider>
        );

        // should render the owner type signature fields
        const irsAmountElement = screen.queryByText('irsAmount');
        expect(irsAmountElement).not.toBeInTheDocument();

        const ssnElement = screen.queryByText('w4r-ssn');
        expect(ssnElement).not.toBeInTheDocument();

        const ownerSignPresentElement = screen.queryByText('Owner-signPresent');
        expect(ownerSignPresentElement).not.toBeInTheDocument();

        const isW4R = screen.getByLabelText('isW4R');
        expect(isW4R).toBeInTheDocument();
        fireEvent.click(isW4R);
        expect(isW4R).toBeChecked();

        const isW4P = screen.getByLabelText('isW4P');
        expect(isW4P).toBeInTheDocument();
        fireEvent.click(isW4P);
        expect(isW4P).toBeChecked();
    });

    it('should pre-populate data', async () => {
        const irsData = [
            {
                irsFormType: IrsFormType.W4R,
                irsApplicable: true,
                irsSpecified: true,
                formParty: {
                    partyRoleType: 'OWNER' as PartyRoles,
                    firstName: 'dom',
                    middleName: '',
                    lastName: 'greathead',
                    suffix: null,
                    fullName: 'dom',
                    taxId: '339333333',
                    maritalStatus: { text: null },
                    email: null,
                    employer: null,
                    addresses: [],
                    phones: [],
                    dob: { text: null },
                },
                irsTaxWithholding: [{
                    place: { text: TaxWithholdingPlace.Federal },
                    type: { text: WithholdingType.SpecifiedTaxWithholding },
                    amount: { text: '20', amountType: AmountType.Percent },
                    filingStatus: { text: null },
                    exemption: { text: null },
                    additionalAmount: { amountType: null, text: null },
                }],
                irsSignature: undefined,
            },
            {
                irsFormType: IrsFormType.W4P,
                irsApplicable: true,
                irsSpecified: true,
                formParty: {
                    partyRoleType: 'OWNER' as PartyRoles,
                    fullName: '',
                    firstName: '',
                    middleName: '',
                    lastName: '',
                    taxId: '',
                    addresses: [
                        {
                            addressLine1: '',
                            addressLine2: '',
                            addressLine3: '',
                            addressLine4: null,
                            addressType: AddressTypes.DEFAULT,
                            city: '',
                            country: null,
                            state: '',
                            zip: '',
                            zipPlusFour: '',
                            isAddressChanged: false,
                        },
                    ],
                    phones: [],
                    maritalStatus: { text: null },
                },
                irsSignature: undefined,
                irsTaxWithholding: [{
                    place: {
                        text: TaxWithholdingPlace.State,
                    },
                    type: {
                        text: WithholdingType.NoTaxWithholding
                    },
                    amount: {
                        text: '10',
                        amountType: AmountType.Dollar
                    },
                    additionalAmount: {
                        text: null,
                        amountType: null
                    },
                    filingStatus: {
                        text: null
                    },
                    exemption: {
                        "text": null
                    }
                }],
            },
        ];
        let setMethodArgs;
        const setMockData = jest.fn(cb => {
            setMethodArgs = cb(irsData);
            return setMethodArgs;
        });

        render(
            <FormDataContext.Provider
                value={{
                    ...defaultFormDataContext,
                    formParty: CaseDetails.data.formRequest.formParty,
                    formIrsData: irsData,
                    setFormIrsData: setMockData,
                }}
            >
                <IrsWithholding signatureFields={irsSignatureConfig} w4pSignaturesConfig={w4pSignaturesConfig} />
            </FormDataContext.Provider>
        );





        expect(setMockData).toHaveBeenCalledWith([{
            irsFormType: IrsFormType.W4R,
            irsApplicable: true,
            irsSpecified: true,
            formParty: { ...CaseDetails.data.formRequest.formParty.parties[0], taxId: '339333333' },
            irsTaxWithholding: [{
                place: { text: TaxWithholdingPlace.Federal },
                type: {
                    text: WithholdingType.SpecifiedTaxWithholding,
                },
                amount: {
                    text: '20',
                    amountType: AmountType.Percent,
                },
                additionalAmount: {
                    amountType: null,
                    text: null,
                },
                filingStatus: { text: null },
                exemption: {
                    text: null,
                },
            }],
            irsSignature: {
                isSigned: null,
                signDate: {
                    text: '',
                },
                signExtension: null,
                signName: null,
                signOtherTitle: null,
                signTitle: {
                    text: '',
                },
                signTitles: [
                    {
                        text: null,
                    },
                ],
                signType: {
                    text: SignatureValidationTypeWithdrawal.Owner,
                },

                spousalConsent: {
                    text: null,
                },
            }
        }, {
            irsFormType: IrsFormType.W4P,
            irsApplicable: true,
            irsSpecified: true,
            formParty: {
                partyRoleType: 'OWNER' as PartyRoles,
                fullName: '',
                firstName: '',
                middleName: '',
                lastName: '',
                taxId: '',
                addresses: [
                    {
                        addressLine1: '',
                        addressLine2: '',
                        addressLine3: '',
                        addressLine4: null,
                        addressType: AddressTypes.DEFAULT,
                        city: '',
                        country: null,
                        state: '',
                        zip: '',
                        zipPlusFour: '',
                        isAddressChanged: false,
                    },
                ],
                phones: [],
                maritalStatus: { text: null },
            },
            irsSignature: undefined,
            irsTaxWithholding: [{
                place: {
                    text: TaxWithholdingPlace.State,
                },
                type: {
                    text: WithholdingType.NoTaxWithholding
                },
                amount: {
                    text: '10',
                    amountType: AmountType.Dollar
                },
                additionalAmount: {
                    text: null,
                    amountType: null
                },
                filingStatus: {
                    text: null
                },
                exemption: {
                    "text": null
                }
            }],

        }]);
    });

    it('should update payload on event change', async () => {
        const irsData = [
            {
                irsFormType: IrsFormType.W4R,
                irsApplicable: true,
                irsSpecified: true,
                formParty: {
                    partyRoleType: 'OWNER' as PartyRoles,
                    firstName: 'dom',
                    middleName: '',
                    lastName: 'greathead',
                    suffix: null,
                    fullName: 'dom',
                    taxId: '339333333',
                    maritalStatus: { text: null },
                    email: null,
                    employer: null,
                    addresses: [],
                    phones: [],
                    dob: { text: null },
                },
                irsTaxWithholding: [{
                    place: { text: TaxWithholdingPlace.Federal },
                    type: { text: WithholdingType.SpecifiedTaxWithholding },
                    amount: { text: '20', amountType: AmountType.Percent },
                    filingStatus: { text: null },
                    exemption: { text: null },
                    additionalAmount: { amountType: null, text: null },
                }],
                irsSignature: undefined,
            },
            {
                irsFormType: IrsFormType.W4P,
                irsApplicable: true,
                irsSpecified: true,
                formParty: {
                    partyRoleType: 'OWNER' as PartyRoles,
                    fullName: '',
                    firstName: '',
                    middleName: '',
                    lastName: '',
                    taxId: '',
                    addresses: [
                        {
                            addressLine1: '',
                            addressLine2: '',
                            addressLine3: '',
                            addressLine4: null,
                            addressType: AddressTypes.DEFAULT,
                            city: '',
                            country: null,
                            state: '',
                            zip: '',
                            zipPlusFour: '',
                            isAddressChanged: false,
                        },
                    ],
                    phones: [],
                    maritalStatus: { text: null },
                },
                irsSignature: undefined,
                irsTaxWithholding: [{
                    place: {
                        text: TaxWithholdingPlace.State,
                    },
                    type: {
                        text: WithholdingType.NoTaxWithholding
                    },
                    amount: {
                        text: '10',
                        amountType: AmountType.Dollar
                    },
                    noOfallowances: {
                        text: '10'
                    },

                    additionalAmount: {
                        text: null,
                        amountType: null
                    },
                    filingStatus: {
                        text: null
                    },
                    exemption: {
                        "text": null
                    }
                }],
            }
        ];
        const setMockData = jest.fn();

        render(
            <FormDataContext.Provider
                value={{
                    ...defaultFormDataContext,
                    formParty: CaseDetails.data.formRequest.formParty,
                    formIrsData: irsData,
                    setFormIrsData: setMockData,
                }}
            >
                <IrsWithholding signatureFields={irsSignatureConfig} w4pSignaturesConfig={w4pSignaturesConfig} />
            </FormDataContext.Provider>
        );

        const irsAmountElement = screen.getByLabelText('irsAmount') as HTMLInputElement;
        fireEvent.change(irsAmountElement, { target: { value: '30' } });
        expect(irsAmountElement.value).toBe('30 ');
    });
});
