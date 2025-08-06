import { render } from '@testing-library/react';
import { TFunctionDetailedResult } from 'i18next';
import { TFunction } from 'next-i18next';

import { SignatureBonusFields } from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import {
    FormDataContext,
    OtpWithdrawalFormState,
    defaultFormDataContext,
} from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { statesAndTerritories } from '@deps/helpers/states.helpers';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import { TaskType } from '@deps/models/case/task';
import {
    AddressTypes,
    CaseStatus,
    FormParty,
    FormSignature,
    PartyRoles,
    SignatureWithdrawal,
} from '@deps/models/case/withdrawal/case';
import { CaseDetails } from '@deps/models/case/withdrawal/case-data';

import UlpcOftWithdrawalForm from './ulpc-oft-form';
import getUlpcOftConfig from './ulpc-oft-form.helpers';

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

const t: TFunction = (key: string | string[]) =>
    key as unknown as TFunctionDetailedResult<string>;

const oftUlpcConfig = getUlpcOftConfig(t);

describe('Config existence', () => {
    it('should return an object with the correct configuration options', () => {
        expect(oftUlpcConfig.formValidation).toBeDefined();
        expect(oftUlpcConfig.signaturesConfig).toBeDefined();
        expect(oftUlpcConfig.formPartyConfigs).toBeDefined();
        expect(oftUlpcConfig.surrenderingInstructionsOptions).toBeDefined();
        expect(oftUlpcConfig.disbursementOptions).toBeDefined();
    });
});

describe('formValidation', () => {
    window.HTMLElement.prototype.hasPointerCapture = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = jest.fn();

    const data = CaseDetails.data.formRequest;
    const formData = data.formData;
    const formDisbursement = data.formDisbursement;
    const formDistribution = data.formDistribution;
    const formErrors = {};
    const formFullSurrenderAck = data.formFullSurrenderAck;
    const formLoan = data.formLoan;
    const formProgram = data.formProgram;
    const formRestriction = data.formRestriction;
    const formSource = data.formSource;
    const formTaxWithholding = data.formTaxWithholding;
    const formTpaAuthorization = data.formTpaAuthorization;
    const { formValidation } = oftUlpcConfig;
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
                        taskType: TaskType.OFT,
                        source: 'Zinnia.TaskManagement',
                        carrier: 'DLIC',
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
                <UlpcOftWithdrawalForm />
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
                        carrier: 'ULPC',
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
                <UlpcOftWithdrawalForm />
            </FormDataContext.Provider>
        );

        expect(setMockData).toHaveBeenCalledWith({
            formExtName: `ULPC_OFT_DIGITAL_FORM`,
            metaData: {
                formId: null,
                formNumber: '',
                formType: `ULPC_OFT_DIGITAL_FORM`,
            },
        });
    });

    describe('signaturesConfig', () => {
        const { signaturesConfig } = oftUlpcConfig;

        describe('Spouse signature', () => {
            const spouseConfig = signaturesConfig.find(
                (sigConfig) =>
                    sigConfig.signatureType ===
                    SignatureValidationTypeWithdrawal.Spouse
            );
            it('should be in the config', () => {
                expect(spouseConfig).toBeTruthy();
                expect(spouseConfig?.fields).toHaveLength(3);
            });

            it('should have shouldDisplay logic', () => {
                expect(
                    spouseConfig?.shouldDisplay?.({
                        ownerStateOfResidence: statesAndTerritories.ARIZONA,
                    } as OtpWithdrawalFormState)
                ).toBeTruthy();
                expect(
                    spouseConfig?.shouldDisplay?.({
                        ownerStateOfResidence: statesAndTerritories.GUAM,
                    } as OtpWithdrawalFormState)
                ).toBeFalsy();
            });

            it('should have a bonusField (Spousal Consent', () => {
                expect(spouseConfig?.bonusField).toEqual(
                    SignatureBonusFields.SpousalConsent
                );
            });
        });
    });
});
