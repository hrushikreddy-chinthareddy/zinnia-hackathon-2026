import { useTranslation } from 'next-i18next';
import { useState, useContext, useEffect, useMemo } from 'react';

import Field, { FieldSize, FieldType, FieldVariant, FieldFormat } from '@deps/components/fields/field';
import SignatureValidation, {
  SignatureValidationField,
} from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation';
import CardContainer from '@deps/containers/card-container/card-container';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import { Address, IrsFormType, Party, PartyRoles, TaxWithholdingPlace, TaxWithholding, maritalStatusType } from '@deps/models/case/withdrawal/case';

import AddressEntry from './address-entry';
import FormProgramMaritalStatus from './form-irsData/form-program-marital-status';
import { MaritalStatusAllowances } from './maritial-status-allowance-withholdings';
import { getDefaultSignature } from './signature-validation/signature-validations';
import TaxWithholdingRow from './tax-withholding-row';
import { toFormTaxWithholding, toViewTaxWithholding } from './tax-withholdings';
import CheckboxText from '../checkbox/checkbox-text/checkbox-text';
import FieldLabel from '../fields/field-label';


export interface IrsWithholdingProps {

  isFormStateReadOnly?: boolean;
  w4pSignaturesConfig: SignatureValidationField[];
}

export default function StateW4Form({ isFormStateReadOnly, w4pSignaturesConfig }: IrsWithholdingProps) {

  //const amountFormat = { format: '###' };
  const { formIrsData, setFormIrsData, formParty, formErrors } = useContext(FormDataContext);

  const owner = formParty.parties.find(party => party.partyRoleType === 'OWNER') as Party;

  const IrsW4pData = useMemo(() => (
    Array.isArray(formIrsData) ? formIrsData.find(data => data?.irsFormType && data.irsFormType === 'W4P') : null
  ), [formIrsData]);


  const numberFormat = { type: 'number' as FieldFormat, decimalPlaces: 0, format: '' };
  const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.irsData' });

  const [isW4pChecked, setW4pChecked] = useState(IrsW4pData?.irsApplicable || false);

  const [name, setName] = useState(IrsW4pData?.formParty?.fullName || owner?.fullName || '');
  const [ssn, setSsn] = useState(IrsW4pData?.formParty?.taxId || owner?.taxId || '');
  const [address, setAddress] = useState(IrsW4pData?.formParty?.addresses[0] || owner?.addresses[0]);
  const [maritalStatus, setMaritalStatus] = useState<maritalStatusType>(IrsW4pData?.formParty?.maritalStatus?.text as maritalStatusType || null);
  const [numberOfAllowances, setNumberOfAllowances] = useState(IrsW4pData?.irsTaxWithholding?.[0]?.allowances?.[0].text || '');

  const [w4Psignature, setW4pSignature] = useState(
    IrsW4pData?.irsSignature || getDefaultSignature(SignatureValidationTypeWithdrawal.Owner)
  );
  const [stateWithholding, setStateWithholding] = useState(
    toViewTaxWithholding(IrsW4pData?.irsTaxWithholding as TaxWithholding[])
  );





  useEffect(() => {
    let filingStatus = null;
    if (maritalStatus) {
      if (maritalStatus === maritalStatusType.marriedFilingJointly || maritalStatus === maritalStatusType.marriedFilingSeparately) {
        filingStatus = 'Married'
      }
      else if (maritalStatus === maritalStatusType.single) {
        filingStatus = 'Single'
      }

    }
    const w4pData = {
      irsApplicable: isW4pChecked,
      irsFormType: IrsFormType.W4P,
      irsSpecified: !!name,
      formParty: {
        partyRoleType: PartyRoles.OWNER,
        firstName: '',
        middleName: '',
        lastName: '',
        phones: [],
        fullName: name,
        taxId: ssn,
        addresses: [address as Address],
        maritalStatus: { text: maritalStatus as maritalStatusType | null }
      },
      irsSignature: w4Psignature,
      irsTaxWithholding:
        toFormTaxWithholding(stateWithholding, { exemption: { text: numberOfAllowances as MaritalStatusAllowances }, filingStatus: { text: filingStatus } })
    };
    const index = formIrsData?.findIndex(data => data?.irsFormType === IrsFormType.W4P);
    const updateFormIrsData = [...formIrsData]
    if (index !== -1) {
      updateFormIrsData[index] = w4pData;
    } else if (index === -1 || index === undefined) {
      updateFormIrsData.push(w4pData)
    }
    setFormIrsData(updateFormIrsData);

  }, [isW4pChecked, name, ssn, address, maritalStatus, numberOfAllowances, stateWithholding, w4Psignature]);



  const handleAddressChange = (val: Address) => {
    setAddress(val);
  };
  return (
    <CardContainer containerClassNames="border-b-2 border-gray-100" classNames="w-full">
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
            initialAddress={address}
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
              formatOptions={numberFormat}
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
