import CardContainer from '@deps/containers/card-container/card-container';
import { useTranslation } from 'next-i18next';
import { useContext, useState } from 'react';
import CheckboxText from '../checkbox/checkbox-text/checkbox-text';
import AddressEntry, { DEFAULT_ADDRESS } from '../otp-withdrawal-form/address-entry';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { PartyRoles } from '@deps/containers/otp/reg60-forms/reg60.types';
import FormProgramMaritalStatus from '../otp-withdrawal-form/form-irsData/form-program-marital-status';
import { maritalStatusType } from '@deps/models/case/withdrawal/case';
import IncomeDisclosure from './income-disclosure';

interface W4pTaxFormProps {
    isFormStateReadOnly: boolean;
}

const W4pTaxForm = ({ isFormStateReadOnly }: W4pTaxFormProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.irsData' });
    const { formErrors } = useContext(FormDataContext);

    const [isW4pChecked, setIsW4pChecked] = useState(false);

    const [maritalStatus, setMaritalStatus] = useState<maritalStatusType | any>(null);

    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100" classNames="w-full">
            <div className="flex-1 mt-5">
                <CheckboxText
                    label="W4-P for Periodic Payments"
                    // label={t('isW4P')}
                    checked={isW4pChecked}
                    onChange={() => setIsW4pChecked(!isW4pChecked)}
                    isDisabled={isFormStateReadOnly}
                />
            </div>

            {isW4pChecked && (
                <div className={`my-4 flex flex-col gap-4 md:grid md:grid-cols-2 md:grid-rows-2 lg:grid-cols-auto-4 lg:grid-rows-1`}>
                    <AddressEntry
                        errors={{
                            addressLine1: formErrors[`addressLine1${PartyRoles.OWNER}`],
                            city: formErrors[`city${PartyRoles.OWNER}`],
                            state: formErrors[`state${PartyRoles.OWNER}`],
                            zip: formErrors[`zip${PartyRoles.OWNER}`],
                            ssn: formErrors[`ssn${PartyRoles.OWNER}`],
                        }}
                        onDataChange={() => {}}
                        initialAddress={DEFAULT_ADDRESS}
                        className="col-span-4 max-w-lg"
                        isFormStateReadOnly={isFormStateReadOnly}
                        isW4pTaxAddress={true}
                    />
                    <div className="col-span-4 mt-4">
                        <FormProgramMaritalStatus
                            selected={maritalStatus}
                            setSelected={setMaritalStatus}
                            isFormStateReadOnly={isFormStateReadOnly}
                        />
                    </div>
                    <IncomeDisclosure isFormStateReadOnly={false} />
                </div>
            )}
        </CardContainer>
    );
};

export default W4pTaxForm;
