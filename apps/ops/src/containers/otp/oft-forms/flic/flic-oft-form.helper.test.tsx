import { render } from '@testing-library/react';
import { TFunctionDetailedResult } from 'i18next';
import { TFunction } from 'next-i18next';

import { SignatureBonusFields } from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { FormDataContext, OtpWithdrawalFormState, defaultFormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { statesAndTerritories } from '@deps/helpers/states.helper';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import { TaskType } from '@deps/models/case/task';
import {
    AddressTypes,
    CaseStatus,
    FormParty,
    FormSignature,
    PartyRoles,
    PhoneTypes,
    QualTypes,
    SignatureWithdrawal,
} from '@deps/models/case/withdrawal/case';
import { CaseDetails } from '@deps/models/case/withdrawal/case-data';

import FlicOftWithdrawalForm from './flic-oft-form';
import getFlicOftConfig from './flic-oft-form.helper';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));

jest.mock('next/navigation', () => {
    return {
        __esModule: true,
        useSearchParams: () => ({
            get: () => {},
        }),
    };
});

jest.mock('@deps/utils/server-logging');

describe('FLIC Form Specific component', () => {
    // added below code t fix the dropdown target.hasPointerCapture is not a function issue
    window.HTMLElement.prototype.hasPointerCapture = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = jest.fn();

    const data = CaseDetails.data.formRequest;
    const formData = data.formData;
    const formDisbursement = data.formDisbursement;
    const formDistribution = data.formDistribution;
    const formErrors = {};
    const formFullSurrenderAck = data.formFullSurrenderAck;
    const formLoan = data.formLoan;
    const formParty = data.formParty;
    const formProgram = data.formProgram;
    const formRestriction = data.formRestriction;
    const formSignature = data.formSignature;
    const formSource = data.formSource;
    const formTaxWithholding = data.formTaxWithholding;
    const formTpaAuthorization = data.formTpaAuthorization;

    const t: TFunction = (key: string | string[]) => key as unknown as TFunctionDetailedResult<string>;
    const flicConfig = getFlicOftConfig(t, QualTypes.CustInhIRA);

    describe('Config existence', () => {
        it('should return an object with the correct configuration options', () => {
            expect(flicConfig.formValidation).toBeDefined();
            expect(flicConfig.signaturesConfig).toBeDefined();
            expect(flicConfig.formPartyConfigs).toBeDefined();
            expect(flicConfig.surrenderingInstructionsOptions).toBeDefined();
            expect(flicConfig.disbursementOptions).toBeDefined();
        });
    });

    it('should render the oft form', () => {
        const setMockData = jest.fn();

        render(
            <FormDataContext.Provider
                value={{
                    ...defaultFormDataContext,
                    formData,
                    formDisbursement,
                    formDistribution,
                    formErrors,
                    formFullSurrenderAck,
                    formLoan,
                    formParty,
                    formProgram,
                    formRestriction,
                    formSignature,
                    formSource,
                    formTaxWithholding,
                    formTpaAuthorization,
                    initialForm: {
                        ...CaseDetails,
                        caseId: 'CA0000034607',
                        taskType: TaskType.Withdrawal,
                        source: 'Zinnia.TaskManagement',
                        carrier: 'FLIC',
                        createdDate: '',
                        updatedDate: '',
                        status: CaseStatus.Pending,
                        taskId: '6551c49b18a0092d07bfa9db',
                        data: {
                            ...CaseDetails.data,
                            agentEmailAddress: '',
                            documentNumber: '',
                            onbaseCaseId: '',
                        },
                    },
                    setFormData: setMockData,
                }}
            >
                <FlicOftWithdrawalForm qualType={QualTypes.ConvertedRothIRA} />
            </FormDataContext.Provider>
        );
    });

    it('should correctly render the formData payload', async () => {
        const setMockData = jest.fn();

        render(
            <FormDataContext.Provider
                value={{
                    ...defaultFormDataContext,
                    formData,
                    formDisbursement,
                    formDistribution,
                    formErrors,
                    formFullSurrenderAck,
                    formLoan,
                    formParty,
                    formProgram,
                    formRestriction,
                    formSignature,
                    formSource,
                    formTaxWithholding,
                    formTpaAuthorization,
                    initialForm: {
                        ...CaseDetails,
                        caseId: 'CA0000034607',
                        taskType: TaskType.OFT,
                        source: 'Zinnia.TaskManagement',
                        carrier: 'FLIC',
                        createdDate: '',
                        updatedDate: '',
                        status: CaseStatus.Pending,
                        taskId: '6551c49b18a0092d07bfa9db',
                        data: {
                            ...CaseDetails.data,
                            agentEmailAddress: '',
                            documentNumber: '',
                            onbaseCaseId: '',
                        },
                    },
                    setFormData: setMockData,
                }}
            >
                <FlicOftWithdrawalForm qualType={QualTypes.ConvertedRothIRA} />
            </FormDataContext.Provider>
        );

        expect(setMockData).toHaveBeenCalledWith({
            formExtName: `FLIC_OFT_DIGITAL_FORM`,
            metaData: {
                formId: null,
                formNumber: '',
                formType: `FLIC_OFT_DIGITAL_FORM`,
            },
        });
    });

    describe('formValidation', () => {
        const { formValidation } = flicConfig;
        const formParty: FormParty = {
            parties: [
                {
                    partyRoleType: PartyRoles.OWNER,
                    firstName: 'Bob',
                    middleName: '',
                    lastName: 'Mockington',
                    fullName: 'Bob Mockington',
                    maritalStatus: { text: null },
                    taxId: '123456',
                    addresses: [
                        {
                            addressLine1: 'blah',
                            addressType: AddressTypes.DEFAULT,
                            city: 'Mockville',
                            state: 'MockState',
                            zip: '12345',
                        },
                    ],
                    phones: [],
                },
            ],
        };

        const signature = {
            signType: { text: SignatureValidationTypeWithdrawal.Owner },
            isSigned: true,
            signDate: { text: null },
            signExtension: { text: null },
            signName: 'blah',
            signTitle: { text: 'mockSignTitle' },
            signTitles: [{ text: null }] as SignatureWithdrawal['signTitles'],
            signOtherTitle: null,
            spousalConsent: { text: false },
            isSignatureValid: true,
            signatureComment: 'signatureComment',
        };
        const formSignature: FormSignature = {
            isSpousalConsentRequired: { text: false },
            signatures: [signature],
        };
        it('should provide no errors for a valid form', () => {
            expect(formValidation({ formParty, formSignature })).toEqual({});
        });
    });

    describe('signaturesConfig', () => {
        const { signaturesConfig } = flicConfig;
        describe('Owner signature', () => {
            const ownerConfig = signaturesConfig.find(sigConfig => sigConfig.signatureType === SignatureValidationTypeWithdrawal.Owner);
            it('should be in the config', () => {
                expect(ownerConfig).toBeTruthy();
                expect(ownerConfig?.fields).toHaveLength(4);
            });
        });

        describe('Joint Owner signature', () => {
            const jointOwnerConfig = signaturesConfig.find(
                sigConfig => sigConfig.signatureType === SignatureValidationTypeWithdrawal.JointOwner
            );
            it('should be in the config', () => {
                expect(jointOwnerConfig).toBeTruthy();
                expect(jointOwnerConfig?.fields).toHaveLength(4);
            });

            it('should have shouldDisplay logic', () => {
                const jointOwner = {
                    parties: [
                        {
                            partyRoleType: PartyRoles.OWNER,
                            firstName: 'JAMES',
                            middleName: 'C',
                            lastName: 'FORD',
                            fullName: 'JAMES C FORD',
                            suffix: '1',
                            dob: { text: null },
                            taxId: '572621420',
                            email: null,
                            employer: null,
                            maritalStatus: {
                                text: null,
                            },
                            addresses: [
                                {
                                    addressLine1: '560 calle de la sierra',
                                    addressLine2: '',
                                    addressLine3: null,
                                    addressLine4: null,
                                    addressType: 'DEFAULT' as AddressTypes,
                                    city: '',
                                    country: null,
                                    state: 'CA',
                                    zip: '92019-1241',
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
                            ],
                        },
                        {
                            partyRoleType: PartyRoles.JOINT_OWNER,
                            firstName: 'JAMES',
                            middleName: 'C',
                            lastName: 'FORD',
                            fullName: 'JAMES C FORD',
                            suffix: '1',
                            dob: { text: null },
                            taxId: '572621420',
                            email: null,
                            employer: null,
                            maritalStatus: {
                                text: null,
                            },
                            addresses: [],
                            phones: [],
                        },
                    ],
                };

                const owner = {
                    parties: [
                        {
                            partyRoleType: PartyRoles.OWNER,
                            firstName: 'JAMES',
                            middleName: 'C',
                            lastName: 'FORD',
                            fullName: 'JAMES C FORD',
                            suffix: '1',
                            dob: { text: null },
                            taxId: '572621420',
                            email: null,
                            employer: null,
                            maritalStatus: {
                                text: null,
                            },
                            addresses: [
                                {
                                    addressLine1: '560 calle de la sierra',
                                    addressLine2: '',
                                    addressLine3: null,
                                    addressLine4: null,
                                    addressType: 'DEFAULT' as AddressTypes,
                                    city: '',
                                    country: null,
                                    state: 'CA',
                                    zip: '92019-1241',
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
                            ],
                        },
                    ],
                };

                expect(jointOwnerConfig?.shouldDisplay?.({ formParty: jointOwner } as OtpWithdrawalFormState)).toBeTruthy();
                expect(jointOwnerConfig?.shouldDisplay?.({ formParty: owner } as OtpWithdrawalFormState)).toBeFalsy();
            });
        });

        describe('Beneficiary signature', () => {
            it('should be in the config', () => {
                const beneficiaryConfig = signaturesConfig.find(
                    sigConfig => sigConfig.signatureType === SignatureValidationTypeWithdrawal.IrrevocableBeneficiary
                );
                expect(beneficiaryConfig).toBeTruthy();
                expect(beneficiaryConfig?.fields).toHaveLength(4);
            });
        });

        describe('Spouse signature', () => {
            const spouseConfig = signaturesConfig.find(sigConfig => sigConfig.signatureType === SignatureValidationTypeWithdrawal.Spouse);
            it('should be in the config', () => {
                expect(spouseConfig).toBeTruthy();
                expect(spouseConfig?.fields).toHaveLength(3);
            });

            it('should have shouldDisplay logic', () => {
                expect(
                    spouseConfig?.shouldDisplay?.({ ownerStateOfResidence: statesAndTerritories.ARIZONA } as OtpWithdrawalFormState)
                ).toBeTruthy();
                expect(
                    spouseConfig?.shouldDisplay?.({ ownerStateOfResidence: statesAndTerritories.GUAM } as OtpWithdrawalFormState)
                ).toBeFalsy();
            });

            it('should have a bonusField (Spousal Consent', () => {
                expect(spouseConfig?.bonusField).toEqual(SignatureBonusFields.SpousalConsent);
            });
        });
    });
});
