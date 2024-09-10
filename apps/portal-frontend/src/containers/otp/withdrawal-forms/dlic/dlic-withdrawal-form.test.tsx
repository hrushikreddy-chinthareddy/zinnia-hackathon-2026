import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { FormDataContext, defaultFormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { TaskType } from '@deps/models/case/task';
import { AddressTypes, CaseStatus, MaritalStatus, PartyRoles, PhoneTypes } from '@deps/models/case/withdrawal/case';
import { CaseDetails } from '@deps/models/case/withdrawal/case-data';

import DlicWithdrawalForm from './dlic-withdrawal-form';

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


describe('DLIC Form Specific component', () => {
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

    describe('CSLN Section', () => {
        it('Should render the CSLN Section for CA', () => {
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
                    <DlicWithdrawalForm />
                </FormDataContext.Provider>
            );

            const sectionTitle = screen.getByTestId('data-testid-csln-title');
            expect(sectionTitle).toBeInTheDocument();
            expect(sectionTitle.tagName).toBe('H3');
        });

        it('Should not render the CSLN Section for AZ', () => {
            const setMockData = jest.fn();

            const formParty = {
                parties: [
                    {
                        partyRoleType: 'OWNER' as PartyRoles, //- lifecad party API
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
                            text: '' as MaritalStatus, //-UI
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
                                state: 'AZ',
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
                                    text: 'Owner_Phone_Day' as PhoneTypes, //-party API phone type
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
                        contractIssueState: '',
                        initialForm: {
                            ...CaseDetails,
                            caseId: 'CA0000034607',
                            taskType: TaskType.Withdrawal,
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
                    <DlicWithdrawalForm />
                </FormDataContext.Provider>
            );

            const sectionTitle = screen.queryByTestId('data-testid-csln-title');
            expect(sectionTitle).not.toBeInTheDocument();
        });
    });
});
