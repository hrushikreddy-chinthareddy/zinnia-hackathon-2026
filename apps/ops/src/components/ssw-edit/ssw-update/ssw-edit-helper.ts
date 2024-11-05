import dayjs from 'dayjs';

import { Program } from '@deps/components/otp-withdrawal-form/rmd-method/program-item';
import { DocumentData } from '@deps/models/case/document';
import { ActiveWithdrawalCase, FormSignature, FormSource } from '@deps/models/case/withdrawal/case';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

export const getSswEditPayload = (
    initialForm: ActiveWithdrawalCase,
    formSource: FormSource,
    formSignature: FormSignature,
    sswProgram: Program,
    document: DocumentData,
    sswEditType: string
) => {
    const formUpdateData = {
        updateType: sswEditType,
        contractNumber: initialForm.data.contractNum,
        bank: null,
        doesCheckMeetSecRequiremnt: null,
        voidCheck: null,
        programs: [
            {
                programType: 'SSW',
                allocationId: sswProgram.allocationId,
                amount: sswProgram.amount,
                duration: sswProgram.duration,
                frequency: sswProgram.frequency,
                nextDate: {
                    text: sswProgram.nextDate,
                },
            },
        ],
    };

    const formData = {
        formExtName: `${initialForm.carrier}_UPDATE_DIGITAL_FORM`,
        metaData: {
            formType: `${initialForm.carrier}_UPDATE_DIGITAL_FORM`,
            formId: null,
            formNumber: '',
        },
    };

    const source = {
        ...formSource,
        businessKey: document.documentNumber,
        receivedDate: dayjs(document.dateReceived, 'M/D/YYYY hh:mm:ss A').format(ZAHARA_API_DATE_FORMAT),
        receivedDateTime: dayjs(document.dateReceived, 'M/D/YYYY hh:mm:ss A').format('YYYY-MM-DDTHH:mm:ss:Z'),
        sourceSysId: 'ONBASE',
    };

    return {
        ...initialForm.data,
        onbaseCaseId: document?.caseId,
        formRequest: {
            formData: formData,
            formSource: source,
            formUpdateData: formUpdateData,
            formDisbursement: null,
            formDistribution: null,
            formFullSurrenderAck: null,
            formIrsData: null,
            formOL4753Data: null,
            formLoan: null,
            formParty: null,
            formProgram: null,
            formRestriction: null,
            formSignature: formSignature,
            formTaxWithholding: null,
            formTpaAuthorization: null,
            formSurrenderingCompany: null,
            formAdditionalWaivers: null,
            formSpecialInstruction: null,
            ownerAcknowledgement: null,
            formNigos: null,
        },
    };
};
