import { useTranslation } from 'next-i18next';
import { useContext } from 'react';

import SelectSimple from '@deps/components/select/select';
import CardContainer from '@deps/containers/card-container/card-container';
import { FormSubtype } from '@deps/containers/otp/withdrawal-forms/flic-withdrawal-form.helper';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';

import { FieldSize } from '../fields/field';

type FormTypeProps = {
    formSubtypeOptions: {
        label: string;
        value: FormSubtype;
    }[];
    isFormStateReadOnly: boolean,
};
function FormType({ formSubtypeOptions, isFormStateReadOnly }: FormTypeProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });
    const { formSubtype, setFormSubtype } = useContext(FormDataContext);


    const handleFormSubtypeChange = (val: FormSubtype) => {
        if (val && setFormSubtype) {
            setFormSubtype(val as FormSubtype);
        }
    }
    return (
        <CardContainer classNames={'w-full !mt-0'} containerClassNames="border-b-2 border-gray-100 mt-0 w-full">
            <SelectSimple
                className="max-w-lg"
                label={t('formSubtype.formType') as string}
                options={formSubtypeOptions}
                onChange={(val: string) => handleFormSubtypeChange(val as FormSubtype)}
                size={FieldSize.Small}
                value={formSubtype}
                name="form-type"
                disabled={isFormStateReadOnly}
            />
        </CardContainer>
    );
}

export default FormType;
