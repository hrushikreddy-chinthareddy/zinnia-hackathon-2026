import { useTranslation } from 'next-i18next';
import { useState, useContext, useEffect, useMemo } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import SignatureValidation, {
    SignatureValidationField,
} from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation';
import CardContainer from '@deps/containers/card-container/card-container';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import { Address, IrsFormType, maritalStatusType, Party, PartyRoles, TaxWithholdingPlace, WithholdingType, AmountType } from '@deps/models/case/withdrawal/case';

import AddressEntry from './address-entry';
import FormProgramMaritalStatus from './form-program/form-program-marital-status';
import { getDefaultSignature } from './signature-validation/signature-validations';
import TaxWithholdingRow from './tax-withholding-row';
import { toViewTaxWithholding } from './tax-withholdings';
import FieldLabel from '../fields/field-label';

export interface IrsWithholdingProps {
    signatureFields: SignatureValidationField[];
    isFormStateReadOnly?: boolean;
    w4pSignaturesConfig: SignatureValidationField[];
}

export default function IrsWithholding({ signatureFields, isFormStateReadOnly, w4pSignaturesConfig }: IrsWithholdingProps) {
    const amountFormat = { format: '###' };
    const { formIrsData, setFormIrsData, formParty, formErrors } = useContext(FormDataContext);

    const owner = formParty.parties.find(party => party.partyRoleType === 'OWNER') as Party;
    const IrsW4rData = useMemo(() => (
        Array.isArray(formIrsData) ? formIrsData.find(data => data.irsFormType === 'W4R') : null
    ), [formIrsData]);
    const IrsW4pData = useMemo(() => (
        Array.isArray(formIrsData) ? formIrsData.find(data => data.irsFormType === 'W4P') : null
    ), [formIrsData]);


    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.irsData' });
    const [isIrsChecked, setIrsChecked] = useState(IrsW4rData?.irsApplicable || false);

    const [amount, setAmount] = useState(IrsW4rData?.irsTaxWithholding?.amount?.text || '');
    const [taxId, setTaxId] = useState(IrsW4rData?.formParty?.taxId || owner?.taxId || '')
    const [signature, setSignature] = useState(IrsW4rData?.irsSignature || getDefaultSignature(SignatureValidationTypeWithdrawal.Owner));
    const [isW4pChecked, setW4pChecked] = useState(IrsW4pData?.irsApplicable || false);

    const [name, setName] = useState(IrsW4pData?.formParty?.fullName || owner?.fullName || '');
    const [ssn, setSsn] = useState(IrsW4pData?.formParty?.taxId || owner?.taxId || '');
    const [address, setAddress] = useState(IrsW4pData?.formParty?.addresses || owner?.addresses[0]);
    const [maritalStatus, setMaritalStatus] = useState<maritalStatusType>(IrsW4pData?.formParty?.maritalStatus?.text as maritalStatusType | undefined || maritalStatusType.single);
    const [numberOfAllowances, setNumberOfAllowances] = useState(IrsW4pData?.irsTaxWithholding?.allowances || '');
    const [w4Psignature, setW4pSignature] = useState(
        IrsW4pData?.irsSignature || getDefaultSignature(SignatureValidationTypeWithdrawal.Owner)
    );
    const [stateWithholding, setStateWithholding] = useState(
        toViewTaxWithholding(IrsW4pData?.irsTaxWithholding as any)
    );

    const updateFormIrsData = (type: IrsFormType, data: any) => {
        const existingDataIndex = formIrsData?.findIndex(item => item.irsFormType === type);

        setFormIrsData((prevData) => {
            const newData = [...prevData];
            if (existingDataIndex !== undefined && existingDataIndex !== -1) {
                newData[existingDataIndex] = data;
            } else {
                newData.push(data);
            }
            return newData;
        });
    }



    useEffect(() => {
        if (isIrsChecked) {
            const w4rData = {
                irsApplicable: isIrsChecked,
                IrsFormType: IrsFormType.W4R,
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
            updateFormIrsData(IrsFormType.W4R, w4rData);
        } else {
            updateFormIrsData(IrsFormType.W4R, null);
        }
    }, [isIrsChecked, amount, taxId, signature, owner, stateWithholding]);

    useEffect(() => {
        if (isW4pChecked) {
            const w4pData = {
                irsApplicable: isW4pChecked,
                IrsFormType: IrsFormType.W4P,
                irsSpecified: !!name,
                formParty: {
                    fullName: name,
                    taxId: ssn,
                    addresses: address,
                    maritalStatus: { text: maritalStatus },
                },
                irsSignature: w4Psignature,
                irsTaxWithholding: {
                    allowances: numberOfAllowances,
                    ...stateWithholding,
                },
            };
            updateFormIrsData(IrsFormType.W4P, w4pData);
        } else {
            updateFormIrsData(IrsFormType.W4P, null);
        }
    }, [isW4pChecked, name, ssn, address, maritalStatus, numberOfAllowances, stateWithholding, w4Psignature]);



    const handleAddressChange = (address: Address) => {
        setAddress([address]);
    };
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
                        data-testid="w4r-irsAmount"
                        variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
                    />

                    <Field
                        className="col-1 max-w-lg"
                        label={t(`ssn`) as string}
                        onChange={e => setTaxId(e.target.value)}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        value={taxId}
                        data-testid="w4r-ssn"
                        name="w4r-ssn"
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

            <div className="flex-1 mt-5">
                <CheckboxText
                    label={t('isW4P')}
                    checked={isW4pChecked}
                    onChange={() => setW4pChecked(!isW4pChecked)}
                    isDisabled={isFormStateReadOnly}
                />
            </div>
            {isW4pChecked && (
                <div className={`my-4 flex flex-col gap-4 md:grid md:grid-cols-2 md:grid-rows-2 lg:grid-cols-auto-4 lg:grid-rows-1`}>
                    <Field
                        className="col-1 max-w-lg"
                        label={t(`name`) as string}
                        onChange={e => setName(e.target.value)}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        value={name}
                        name="name"
                        variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
                    />

                    <Field
                        className="col-1 max-w-lg"
                        label={t(`ssn`) as string}
                        onChange={e => setSsn(e.target.value)}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        value={ssn}
                        data-testid="w4p-ssn"
                        name="w4p-ssn"
                        variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
                    />

                    <AddressEntry
                        errors={{
                            addressLine1: formErrors[`addressLine1${PartyRoles.OWNER}`],
                            city: formErrors[`city${PartyRoles.OWNER}`],
                            state: formErrors[`state${PartyRoles.OWNER}`],
                            zip: formErrors[`zip${PartyRoles.OWNER}`],
                        }}
                        onDataChange={val => handleAddressChange(val as Address)}
                        initialAddress={IrsW4pData?.formParty?.addresses[0] ?? owner?.addresses[0]}
                        className="col-span-4 max-w-lg"
                        isFormStateReadOnly={isFormStateReadOnly}
                    />
                    <div className="col-span-4 mt-4">
                        <FormProgramMaritalStatus
                            selected={maritalStatus}
                            setSelected={setMaritalStatus}
                            isFormStateReadOnly={isFormStateReadOnly}
                        />
                    </div>
                    <div className="mt-4 col-span-4 row-span-1">
                        <TaxWithholdingRow
                            label={t('stateIncomeTax')}
                            onDataChange={setStateWithholding}
                            place={TaxWithholdingPlace.State}
                            withholding={stateWithholding}
                            selectMin={false}
                            //  additionalWithHoldingConfig={additionalWithHoldingConfig?.State}
                            isFormStateReadOnly={isFormStateReadOnly}
                        />
                    </div>

                    <div className="col-span-1 row-span-1 mt-4">
                        <Field
                            label={t(`numberofAllowance`) as string}
                            onChange={e => setNumberOfAllowances(e.target.value)}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={numberOfAllowances as string}
                            name="numberofAllowance"
                            variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
                        />
                    </div>

                    <div className="col-span-4 mt-4">
                        <FieldLabel label={t('signatureValidation') as string} />
                        <SignatureValidation
                            className="flex flex-col gap-4 md:grid  lg:grid-cols-4 lg:grid-rows-1"
                            key={`sig-val-owner`}
                            fields={w4pSignaturesConfig}
                            onDataChange={setW4pSignature}
                            sigProp={w4Psignature}
                            isFormStateReadOnly={isFormStateReadOnly}
                        />
                    </div>
                </div>
            )}
        </CardContainer>
    );
}
