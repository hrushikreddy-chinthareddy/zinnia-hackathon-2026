import { useCallback, useState } from 'react';

import { isNullEmptyOrUndefined } from '@deps/helpers/string.helper';
import { CaseType } from '@deps/models/case/case';
import { PolicyDocuments, PolicyDocument } from '@deps/models/case/document';
import { Carrier } from '@deps/models/case/withdrawal/case';
import { getPolicyTypeDocsV2 } from '@deps/queries/api/documents';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

export const useGetPolicyTypeDocs = (
    id: string,
    clientCode: string,
    docType: string,
    documentNumber: string
): [boolean, () => void, any, any] => {
    const [loading, setLoading] = useState(false);
    const [workingDocument, setWorkingDocument] = useState<PolicyDocument>();
    const [relatedDocument, setRelatedDocument] = useState<PolicyDocument[]>();
    const getPolicyDocs = useCallback(async () => {
        if (loading) return;

        if (isNullEmptyOrUndefined(id) || isNullEmptyOrUndefined(clientCode)) return;

        try {
            setLoading(true);

            const response = await getPolicyTypeDocsV2(id, clientCode);
            const items = (response?.data as PolicyDocuments)?.items || [];

            if (items) {
                const workingDoc = items.find(
                    item => item.documentNumber === documentNumber && item.documentType.toLowerCase() === docType.toLowerCase()
                );
                const relatedDoc = items.filter(
                    item => item.documentNumber !== documentNumber
                );
                browserLogInfo('useGetPolicyTypeDocs::Policy documents retrieved', {
                    id,
                    clientCode,
                    docType,
                    workingDocument: workingDoc ? true : false,
                    relatedDocument: relatedDoc?.length || 0,
                    file: 'service-form-review-helper'
                });
                setWorkingDocument(workingDoc);
                setRelatedDocument(relatedDoc);
            }
            setLoading(false);
        } catch (e) {
            browserLogError('useGetPolicyTypeDocs::error while fetching policy type documents', { id, clientCode, docType, ...parseErrorInformation(e)} );
            setLoading(false);
        }
    }, [loading, id, clientCode, docType, documentNumber]);

    return [loading, getPolicyDocs, workingDocument, relatedDocument];
};

export const getWithdrawalFormData = (carrier: string, formSubtype: string | undefined) => {
    let formData;
    switch (carrier) {
        case Carrier.SBGC:
            formData = {
                formExtName: `${carrier}_WD_REDEMPTION_DIGITAL_FORM`,
                metaData: {
                    formType: `${carrier}_WD_REDEMPTION_DIGITAL_FORM`,
                    formId: null,
                    formNumber: '',
                },
            };
            break;
        case Carrier.FLIC:
        case Carrier.NASU:
        case Carrier.RSLN:
        case Carrier.GDMN:
        case Carrier.ULPC:
        case Carrier.GLCO:
            formData = {
                formExtName: `${carrier}_WD_REDEMPTION_${formSubtype?.toUpperCase()}_DIGITAL_FORM`,
                metaData: {
                    formType: `${carrier}_WD_REDEMPTION_${formSubtype?.toUpperCase()}_DIGITAL_FORM`,
                    formId: null,
                    formNumber: '',
                },
            };
            break;
        case Carrier.DLIC:
            formData = {
                formExtName: `${carrier}_REDEMPTION_DIGITAL_FORM`,
                metaData: {
                    formType: `${carrier}_REDEMPTION_DIGITAL_FORM`,
                    formId: null,
                    formNumber: '',
                },
            };
            break;
        case Carrier.MASS:
            formData = {
                formExtName: `${carrier}_REDEMPTION_${formSubtype?.toUpperCase()}_DIGITAL_FORM`,
                metaData: {
                    formType: `${carrier}_REDEMPTION_${formSubtype?.toUpperCase()}_DIGITAL_FORM`,
                    formId: null,
                    formNumber: '',
                },
            };
            break;
    }
    return formData;
};

export const getSSWFormData = (carrier: string) => {
    return {
        formExtName: `${carrier}_SSW_DIGITAL_FORM`,
        metaData: {
            formType: `${carrier}_SSW_DIGITAL_FORM`,
            formId: null,
            formNumber: '',
        },
    };
};

export const getRMDFormData = (carrier: string) => {
    return {
        formExtName: `${carrier}_RMD_DIGITAL_FORM`,
        metaData: {
            formType: `${carrier}_RMD_DIGITAL_FORM`,
            formId: null,
            formNumber: '',
        },
    };
};

export const getOFTFormData = (carrier: string) => {
    return {
        formExtName: `${carrier}_OFT_DIGITAL_FORM`,
        metaData: {
            formType: `${carrier}_OFT_DIGITAL_FORM`,
            formId: null,
            formNumber: '',
        },
    };
};

export const getFormData = (caseType: CaseType, carrier: string, formSubtype: string | undefined) => {
    let data;
    switch (caseType) {
        case CaseType.Withdrawal:
            data = getWithdrawalFormData(carrier, formSubtype);
            break;
        case CaseType.SSW:
            data = getSSWFormData(carrier);
            break;
        case CaseType.Rmd:
            data = getRMDFormData(carrier);
            break;
        case CaseType.Oft:
            data = getOFTFormData(carrier);
            break;
    }
    return data;
};
