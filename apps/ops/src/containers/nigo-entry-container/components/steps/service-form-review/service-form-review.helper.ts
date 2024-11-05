import { useCallback, useState } from 'react';

import { CaseType } from '@deps/models/case/case';
import { PolicyDocuments, PolicyDocument } from '@deps/models/case/document';
import { Carrier } from '@deps/models/case/withdrawal/case';
import { getPolicyTypeDocs } from '@deps/queries/api/documents';

export const useGetPolicyTypeDocs = (id: string, clientCode: string, docType: string, documentNumber: string): [boolean, () => void, any, any] => {
    const [loading, setLoading] = useState(false);
    const [workingDocument, setWorkingDocument] = useState<PolicyDocument>();
    const [relatedDocument, setRelatedDocument] = useState<PolicyDocument[]>();
    const getPolicyDocs = useCallback(async () => {
        if (loading) return;

        try {
            setLoading(true);

            const response = await getPolicyTypeDocs(id, clientCode, docType);
            const items = (response.data as PolicyDocuments)?.items || [];

            if (items) {
                const workingDoc = items.find(item => item.documentNumber === documentNumber);
                const relatedDoc = items.filter(item => item.documentNumber !== documentNumber);
                setWorkingDocument(workingDoc);
                setRelatedDocument(relatedDoc);
            }
            setLoading(false);
        } catch (e) {
            console.error('useGetPolicyTypeDocs::error validating address', e);
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
                }
            };
            break;
        case Carrier.FLIC:
        case Carrier.NASU:
        case  Carrier.RSLN:
        case  Carrier.GDMN:
            formData = {
                formExtName: `${carrier}_WD_REDEMPTION_${formSubtype?.toUpperCase()}_DIGITAL_FORM`,
                metaData: {
                    formType: `${carrier}_WD_REDEMPTION_${formSubtype?.toUpperCase()}_DIGITAL_FORM`,
                    formId: null,
                    formNumber: '',
                }
            };
            break;
        case Carrier.DLIC:
            formData = {
                formExtName: `${carrier}_REDEMPTION_DIGITAL_FORM`,
                metaData: {
                    formType: `${carrier}_REDEMPTION_DIGITAL_FORM`,
                    formId: null,
                    formNumber: '',
                }
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
