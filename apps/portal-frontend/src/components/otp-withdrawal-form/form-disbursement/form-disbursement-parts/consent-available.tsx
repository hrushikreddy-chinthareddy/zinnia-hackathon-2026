import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import { DisbursmentConsentInfo } from '@deps/models/case/withdrawal/case';

import SignatureValidation, { SignatureValidationField } from '../../signature-validation/signature-validation';
import { getDefaultSignature } from '../../signature-validation/signature-validations';

export interface ConsentAvailableProps {
    signatureFields: SignatureValidationField[];
    isFormStateReadOnly?: boolean;
}

type TextTuple = [{ text: null }];

export const defaultDisbursmentConsent: DisbursmentConsentInfo = {
    isConsent: { text: null },
    name: { text: '' },
    isSigned: { text: null },
    signTitle: { text: '' },
    signDate: { text: '' },
};

export const getDisbursmentConsent = (consentData: DisbursmentConsentInfo | undefined) =>
    consentData?.isConsent.text ? consentData : defaultDisbursmentConsent;

export const ConsentAvailable = ({ signatureFields, isFormStateReadOnly }: ConsentAvailableProps) => {
    const { initialForm, formDisbursement, setFormDisbursement } = useContext(FormDataContext);
    const disbursementConsent = initialForm?.data?.formRequest?.formDisbursement?.disbursmentConsent ?? defaultDisbursmentConsent;
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.distributionMethod' });
    const [isConsent] = useState(formDisbursement?.disbursmentConsent?.isConsent.text ?? null);
    const initialSignature = {
        isSigned: disbursementConsent.isSigned.text,
        signDate: { text: disbursementConsent.signDate.text as string | null },
        signExtension: null,
        signName: disbursementConsent.name.text as string | null,
        signOtherTitle: null,
        signTitle: { text: disbursementConsent.signTitle.text as string | null },
        signTitles: [{ text: null }] as TextTuple,
        signType: { text: SignatureValidationTypeWithdrawal.Owner as SignatureValidationTypeWithdrawal | null },
        spousalConsent: { text: null as boolean | null },
    };
    const [signature, setSignature] = useState(initialSignature || getDefaultSignature(SignatureValidationTypeWithdrawal.Owner));
    const [name, setName] = useState(disbursementConsent?.name.text ?? '');

    useEffect(() => {
        setFormDisbursement(ogFormDisbursement => ({
            ...ogFormDisbursement,
            disbursmentConsent: {
                ...defaultDisbursmentConsent,
                ...ogFormDisbursement.disbursmentConsent,
                name: { text: isConsent ? name : '' },
                isSigned: {
                    text: isConsent ? signature.isSigned : null,
                },
                signTitle: { text: isConsent && signature.signTitle.text ? signature.signTitle.text : '' },
                signDate: { text: isConsent && signature.signDate.text ? signature.signDate.text : '' },
            },
        }));
    }, [signature, name, isConsent]);

    return (
        <div className={`my-4 flex flex-col gap-4 md:grid md:grid-cols-2 md:grid-rows-2 lg:grid-cols-auto-2 lg:grid-rows-1`}>
            <Field
                className="col-1 w-[400px]"
                label={t(`consentorFullName`) as string}
                onChange={e => setName(e.target.value)}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                value={name}
                variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
            />
            <div className="col-3 max-w-xl">
                <SignatureValidation
                    className="mb-4 flex flex-col gap-4 md:grid md:grid-cols-2 md:grid-rows-2 lg:grid-cols-3 lg:grid-rows-1"
                    key={`sig-val-owner`}
                    fields={signatureFields}
                    onDataChange={setSignature}
                    sigProp={signature}
                    isFormStateReadOnly={isFormStateReadOnly}
                />
            </div>
        </div>
    );
};
