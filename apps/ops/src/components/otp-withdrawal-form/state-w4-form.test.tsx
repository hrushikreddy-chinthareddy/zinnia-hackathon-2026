import '@testing-library/jest-dom';
import { cleanup, screen, fireEvent, render } from '@testing-library/react';

import { SignatureFields } from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { FormDataContext, defaultFormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { SignPresent } from '@deps/models/case/renewal/signature-validation';
import { AddressTypes, CaseStatus, IrsFormType, maritalStatusType, PartyRoles } from '@deps/models/case/withdrawal/case';
import { CaseDetails } from '@deps/models/case/withdrawal/case-data';

import StateW4Form from './state-w4-form';

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: DEFAULT_LOCALE,
    },
  }),
}));

describe('state-w4-form', () => {
  // orders of the tests are important here. Need to work on that
  afterEach(cleanup);
  const w4pSignaturesConfig = [
    {
      component: SignatureFields.SignatureType,
      key: 'w4p-owner-type',
    },
    {
      component: SignatureFields.SignaturePresent,
      key: 'w4p-signature-sign-present',
    },
    {
      component: SignatureFields.SignatureDate,
      key: 'w4p-signature-sign-date',
    },
  ];

  it('should render fields if isW4P  option checked ', async () => {
    render(
      <FormDataContext.Provider
        value={{
          ...defaultFormDataContext,
          currentFormState: CaseStatus.Pending,
          formParty: CaseDetails.data.formRequest.formParty,
        }}
      >
        <StateW4Form w4pSignaturesConfig={w4pSignaturesConfig} />
      </FormDataContext.Provider>
    );
    const Address = screen.queryByText('Address');
    expect(Address).not.toBeInTheDocument();

    const ssnElement = screen.queryByText('ssn');
    expect(ssnElement).not.toBeInTheDocument();

    const ownerSignPresentElement = screen.queryByText('Owner-signPresent');
    expect(ownerSignPresentElement).not.toBeInTheDocument();

    const isW4P = screen.getByLabelText('isW4P');
    expect(isW4P).toBeInTheDocument();
    fireEvent.click(isW4P);
    expect(isW4P).toBeChecked();

    const ssnElement1 = screen.getByText('ssn');
    expect(ssnElement1).toBeInTheDocument();

    const ownerSignPresentElement1 = screen.getByText('signPresent');
    expect(ownerSignPresentElement1).toBeInTheDocument();
  });

  it.skip('should pre-populate data', () => {
    const irsData = {
      irsApplicable: true,
      irsFormType: IrsFormType.W4P,
      irsSpecified: true,
      formParty: {
        partyRoleType: PartyRoles.OWNER,
        fullName: 'joe',
        firstName: '',
        middleName: '',
        lastName: '',
        taxId: '12343455555555555',
        addresses: [
          {
            addressLine1: 'NYC',
            addressLine2: '',
            addressLine3: '',
            addressLine4: null,
            addressType: AddressTypes.DEFAULT,
            city: 'NYC',
            state: 'NY',
            zip: '11111',
            zipPlusFour: '',
            isAddressChanged: false,
          },
        ],
        phones: [],
        maritalStatus: {
          text: maritalStatusType.marriedFilingJointly,
        },
      },
      irsSignature: undefined,
      irsTaxWithholding: [
        {
          place: {
            text: 'State',
          },
          type: {
            text: 'No Tax Withholding',
          },
          filingStatus: {
            text: 'Married',
          },
          amount: {
            text: null,
            amountType: null,
          },
          additionalAmount: {
            text: null,
            amountType: null,
          },
        },
      ],
    };

    const setMockData = jest.fn();
    render(
      <FormDataContext.Provider
        value={{
          ...defaultFormDataContext,
          formParty: CaseDetails.data.formRequest.formParty,
          formIrsData: [irsData],
          setFormIrsData: setMockData,
        }}
      >
        <StateW4Form w4pSignaturesConfig={w4pSignaturesConfig} />
      </FormDataContext.Provider>
    );

    const ssnElement = screen.getByLabelText('ssn') as HTMLInputElement;
    expect(ssnElement.value).toBe('12343455555555555');

    const ownerSignPresentElement = screen.getByText('signPresent');
    expect(ownerSignPresentElement).toBeInTheDocument();

    expect(setMockData).toHaveBeenCalledWith([
      {
        formParty: {
          addresses: [
            {
              addressLine1: 'NYC',
              addressLine2: '',
              addressLine3: '',
              addressLine4: null,
              addressType: 'DEFAULT',
              city: 'NYC',
              country: null,
              isAddressChanged: false,
              state: 'NY',
              zip: '11111',
              zipPlusFour: '',
            },
          ],
          firstName: '',
          fullName: 'joe',
          lastName: '',
          maritalStatus: { text: 'Married Filing Jointly' },
          middleName: '',
          partyRoleType: 'OWNER',
          phones: [],
          taxId: '12343455555555555',
        },
        irsApplicable: true,
        irsFormType: 'W4P',
        irsSignature: {
          commissionExpiryDate: undefined,
          isNotaryValid: undefined,
          isSignatureCityProvided: undefined,
          isSignatureValid: undefined,
          isSigned: null,
          signDate: { text: '' },
          signExtension: null,
          signGuaranteeStamp: undefined,
          signName: null,
          signOtherTitle: null,
          signTitle: { text: '' },
          signTitles: [{ text: null }],
          signType: { text: 'Owner' },
          signatureComment: undefined,
          spousalConsent: { text: null },
          ssn: undefined,
        },
        irsSpecified: true,
        irsTaxWithholding: [
          {
            additionalAmount: { amountType: null, text: null },
            amount: { amountType: null, text: null },
            exemption: { text: '' },
            filingStatus: { text: 'Married' },
            place: { text: 'State' },
            type: { text: 'No Tax Withholding' },
          },
        ],
      },
    ]);
  });


  it.skip('should update payload on event change', async () => {
    const irsData = {
      irsApplicable: true,
      irsFormType: IrsFormType.W4P,
      irsSpecified: true,
      formParty: {
        partyRoleType: PartyRoles.OWNER,
        fullName: 'joe',
        firstName: '',
        middleName: '',
        lastName: '',
        taxId: '12343455555555555',
        addresses: [
          {
            addressLine1: 'NYC',
            addressLine2: '',
            addressLine3: '',
            addressLine4: null,
            addressType: AddressTypes.DEFAULT,
            city: 'NYC',
            state: 'NY',
            zip: '11111',
            zipPlusFour: '',
            isAddressChanged: false,
          },
        ],
        phones: [],
        maritalStatus: {
          text: maritalStatusType.marriedFilingJointly,
        },
      },
      irsSignature: undefined,
      irsTaxWithholding: [
        {
          place: {
            text: 'State',
          },
          type: {
            text: 'No Tax Withholding',
          },
          filingStatus: {
            text: 'Married',
          },
          amount: {
            text: null,
            amountType: null,
          },
          additionalAmount: {
            text: null,
            amountType: null,
          },
        },
      ],
    };
    const setMockData = jest.fn();

    render(
      <FormDataContext.Provider
        value={{
          ...defaultFormDataContext,
          formParty: CaseDetails.data.formRequest.formParty,
          formIrsData: [irsData],
          setFormIrsData: setMockData,
        }}
      >
        <StateW4Form w4pSignaturesConfig={w4pSignaturesConfig} />
      </FormDataContext.Provider>
    );


    const ssnElement = screen.getByLabelText('ssn') as HTMLInputElement;
    fireEvent.change(ssnElement, { target: { value: '33933311' } });
    expect(ssnElement.value).toBe('33933311');

    const ownerSignPresentElement = screen.getByTestId('Owner-signature-present');
    fireEvent.change(ownerSignPresentElement, { target: { value: SignPresent.Yes } });

    expect(setMockData).toHaveBeenCalledWith([
      {
        formParty: {
          addresses: [
            {
              addressLine1: 'NYC',
              addressLine2: '',
              addressLine3: '',
              addressLine4: null,
              addressType: 'DEFAULT',
              city: 'NYC',
              country: null,
              isAddressChanged: false,
              state: 'NY',
              zip: '11111',
              zipPlusFour: '',
            },
          ],
          firstName: '',
          fullName: 'joe',
          lastName: '',
          maritalStatus: { text: 'Married Filing Jointly' },
          middleName: '',
          partyRoleType: 'OWNER',
          phones: [],
          taxId: '12343455555555555',
        },
        irsApplicable: true,
        irsFormType: 'W4P',
        irsSignature: {
          commissionExpiryDate: undefined,
          isNotaryValid: undefined,
          isSignatureCityProvided: undefined,
          isSignatureValid: undefined,
          isSigned: null,
          signDate: { text: '' },
          signExtension: null,
          signGuaranteeStamp: undefined,
          signName: null,
          signOtherTitle: null,
          signTitle: { text: '' },
          signTitles: [{ text: null }],
          signType: { text: 'Owner' },
          signatureComment: undefined,
          spousalConsent: { text: null },
          ssn: undefined,
        },
        irsSpecified: true,
        irsTaxWithholding: [
          {
            additionalAmount: { amountType: null, text: null },
            amount: { amountType: null, text: null },
            exemption: { text: '' },
            filingStatus: { text: 'Married' },
            place: { text: 'State' },
            type: { text: 'No Tax Withholding' },
          },
        ],
      },
    ]);
  });

});
