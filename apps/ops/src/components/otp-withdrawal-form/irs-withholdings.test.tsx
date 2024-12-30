import '@testing-library/jest-dom';
import { cleanup, screen, fireEvent, render } from '@testing-library/react';

import { FormDataContext, defaultFormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { SignPresent, SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import { TaxWithholdingPlace, AmountType, WithholdingType, PartyRoles, CaseStatus } from '@deps/models/case/withdrawal/case';
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
    // orders of the tests are important here. Need to work on that
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
    it('should render IRS withholding fields if W-4R option checked ', async () => {
        render(
            <FormDataContext.Provider value={{ ...defaultFormDataContext, currentFormState: CaseStatus.Pending, formParty: CaseDetails.data.formRequest.formParty }}>
                <IrsWithholding signatureFields={irsSignatureConfig} />
            </FormDataContext.Provider>
        );
        // should render the owner type signature fields
        const irsAmountElement = screen.queryByText('irsAmount');
        expect(irsAmountElement).not.toBeInTheDocument();

        const ssnElement = screen.queryByText('ssn');
        expect(ssnElement).not.toBeInTheDocument();

        const ownerSignPresentElement = screen.queryByText('Owner-signPresent');
        expect(ownerSignPresentElement).not.toBeInTheDocument();

        const isW4R = screen.getByLabelText('isW4R');
        expect(isW4R).toBeInTheDocument();
        fireEvent.click(isW4R);
        expect(isW4R).toBeChecked();

        const irsAmountElement1 = screen.getByText('irsAmount');
        expect(irsAmountElement1).toBeInTheDocument();

        const ssnElement1 = screen.getByText('ssn');
        expect(ssnElement1).toBeInTheDocument();

        const ownerSignPresentElement1 = screen.getByText('signPresent');
        expect(ownerSignPresentElement1).toBeInTheDocument();
    });

    it('should pre-populate data', () => {
        const irsData = {
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
                maritalStatus: {
                    text: null,
                },
                email: null,
                employer: null,
                addresses: [],
                phones: [],
                dob: { text: null },
            },
            irsTaxWithholding: {
                place: { text: TaxWithholdingPlace.Federal },
                type: {
                    text: WithholdingType.SpecifiedTaxWithholding,
                },
                amount: {
                    text: '20',
                    amountType: AmountType.Percent,
                },
                filingStatus: { text: null },
                exemption: {
                    text: null,
                },
                additionalAmount: {
                    amountType: null,
                    text: null,
                }
            },
            irsSignature: undefined,
        };
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
                <IrsWithholding signatureFields={irsSignatureConfig} />
            </FormDataContext.Provider>
        );
        // should render the owner type signature fields
        const irsAmountElement = screen.getByLabelText('irsAmount') as HTMLInputElement;
        expect(irsAmountElement.value).toBe('20 ');

        const ssnElement = screen.getByLabelText('ssn') as HTMLInputElement;
        expect(ssnElement.value).toBe('339333333');

        const ownerSignPresentElement = screen.getByText('signPresent');
        expect(ownerSignPresentElement).toBeInTheDocument();

        expect(setMockData).toHaveBeenCalledWith({
            irsApplicable: true,
            irsSpecified: true,
            formParty: { ...CaseDetails.data.formRequest.formParty.parties[0], taxId: '339333333' },
            irsTaxWithholding: {
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
            },
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
                signatureComment: undefined,
                isSignatureValid: undefined,
                spousalConsent: {
                    text: null,
                },
            },
        });
    });

    it('should update payload on event change', async () => {
        const irsData = {
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
                maritalStatus: {
                    text: null,
                },
                email: null,
                employer: null,
                addresses: [],
                phones: [],
                dob: { text: null },
            },
            irsTaxWithholding: {
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
            },
            irsSignature: undefined,
        };
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
                <IrsWithholding signatureFields={irsSignatureConfig} />
            </FormDataContext.Provider>
        );
        // should render the owner type signature fields
        const irsAmountElement = (await screen.getByLabelText('irsAmount')) as HTMLInputElement;
        fireEvent.change(irsAmountElement, { target: { value: '30' } });
        expect(irsAmountElement.value).toBe('30 ');

        const ssnElement = screen.getByLabelText('ssn') as HTMLInputElement;
        fireEvent.change(ssnElement, { target: { value: '33933311' } });
        expect(ssnElement.value).toBe('33933311');

        const ownerSignPresentElement = screen.getByTestId('Owner-signature-present');
        fireEvent.change(ownerSignPresentElement, { target: { value: SignPresent.Yes } });

        expect(setMockData).toHaveBeenCalledWith({
            irsApplicable: true,
            irsSpecified: true,
            formParty: { ...CaseDetails.data.formRequest.formParty.parties[0], taxId: '33933311' },
            irsTaxWithholding: {
                place: { text: TaxWithholdingPlace.Federal },
                type: {
                    text: WithholdingType.SpecifiedTaxWithholding,
                },
                amount: {
                    text: '30',
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
            },
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
                signatureComment: undefined,
                isSignatureValid: undefined,
                spousalConsent: {
                    text: null,
                },
            },
        });
    });
});