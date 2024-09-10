import { useTranslation } from 'next-i18next';
import React, { useEffect, useState, useContext } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import SignatureValidation, {
    SignatureValidationField,
} from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation';
import CardContainer from '@deps/containers/card-container/card-container';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import { Party, TaxWithholdingPlace, AmountType, WithholdingType } from '@deps/models/case/withdrawal/case';

import { getDefaultSignature } from './signature-validation/signature-validations';

export interface IrsWithholdingProps {
    signatureFields: SignatureValidationField[];
    isFormStateReadOnly?: boolean,
}

export default function IrsWithholding({ signatureFields, isFormStateReadOnly }: IrsWithholdingProps) {
    const amountFormat = { format: '###' };
    const { formIrsData, setFormIrsData, formParty } = useContext(FormDataContext);

    // TODO - use PartyRoleType enum once created for FormParty work
    const owner = formParty.parties.find(party => party.partyRoleType === 'OWNER') as Party;

    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.irsData' });
    const [isIrsChecked, setIrsChecked] = useState(formIrsData?.irsApplicable || false);
    const [amount, setAmount] = useState(formIrsData?.irsTaxWithholding?.amount?.text || '');
    const [taxId, setTaxId] = useState(formIrsData?.formParty?.taxId || owner?.taxId || '');

    const [signature, setSignature] = useState(formIrsData?.irsSignature || getDefaultSignature(SignatureValidationTypeWithdrawal.Owner));

    useEffect(() => {
        const irsDetails = {
            ...formIrsData,
            irsApplicable: isIrsChecked,
            irsSpecified: amount ? true : false,
            formParty: { ...owner, taxId: taxId } as Party,
            irsSignature: signature,
            irsTaxWithholding: {
                place: {
                    text: TaxWithholdingPlace.Federal,
                },
                type: {
                    text: WithholdingType.SpecifiedTaxWithholding,
                },
                amount: {
                    text: amount,
                    amountType: AmountType.Percent,
                },
                additionalAmount: {
                    text: null,
                    amountType: null,
                },
                filingStatus: {
                    text: null,
                },
                exemption: {
                    text: null,
                },
            },
        };
        // setting formIRSData only if isIrsChecked checkbox checked
        setFormIrsData(isIrsChecked ? irsDetails : null);
    }, [isIrsChecked, amount, taxId, signature]);

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100" classNames="w-full">
            <div className="flex flex-wrap gap-8 max-md:flex-col">
                <div className="flex-1">
                    <CheckboxText
                        label={t('isW4R')}
                        checked={isIrsChecked}
                        onChange={() => setIrsChecked(!isIrsChecked)}
                        isDisabled={isFormStateReadOnly}
                        />
                </div>
            </div>
            {isIrsChecked && (
                <div className={`my-4 flex flex-col gap-4 md:grid md:grid-cols-2 md:grid-rows-2 lg:grid-cols-auto-4 lg:grid-rows-1`}>
                    <Field
                        className="col-1 max-w-lg"
                        label={t(`irsAmount`) as string}
                        onChange={e => setAmount(e.target.value)}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        value={amount}
                        formatOptions={amountFormat}
                        trailing={<div>%</div>}
                        data-testid="irsAmount"
                        variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
                    />

                    <Field
                        className="col-1 max-w-lg"
                        label={t(`ssn`) as string}
                        onChange={e => setTaxId(e.target.value)}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        value={taxId}
                        data-testid="ssn"
                        variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
                    />
                    <div className="col-2 max-w-lg">
                        <SignatureValidation
                            className="mb-4 flex flex-col gap-4 md:grid md:grid-cols-2 md:grid-rows-2 lg:grid-cols-2 lg:grid-rows-1"
                            key={`sig-val-owner`}
                            fields={signatureFields}
                            onDataChange={setSignature}
                            sigProp={signature}
                            isFormStateReadOnly={isFormStateReadOnly}
                        />
                    </div>
                </div>
            )}
        </CardContainer>
    );
}
