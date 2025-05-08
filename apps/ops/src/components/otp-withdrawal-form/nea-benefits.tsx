import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { deStringifyTrueFalseNull, stringifyTrueFalseNull } from '@deps/helpers/string.helpers';
import { FormSpecialInstruction, StringTrueFalseNull } from '@deps/models/case/withdrawal/case';

import CheckboxText from '../checkbox/checkbox-text/checkbox-text';

const NeaBenefits = () => {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });
    const { formSpecialInstruction, setFormSpecialInstruction, isFormStateReadOnly } = useContext(FormDataContext);

    const neaBenefits = deStringifyTrueFalseNull(formSpecialInstruction?.neaBenefitSensitivity?.text);

    const handleNeaBenefitsChange = () => {
        setFormSpecialInstruction((formSpecialInstruction: FormSpecialInstruction) => ({
            ...formSpecialInstruction,
            neaBenefitSensitivity: {
                text: stringifyTrueFalseNull(!neaBenefits) as StringTrueFalseNull,
            },
        }));
    };

    useEffect(() => {
        setFormSpecialInstruction((formSpecialInstruction: FormSpecialInstruction) => ({
            ...formSpecialInstruction,
            neaBenefitSensitivity: {
                text: 'null',
            },
        }));
    }, []);
    return (
        <div className="content-divider my-4 px-4 pb-4">
            <CheckboxText
                label={t('neaBenefitsSensitivity')}
                checked={Boolean(neaBenefits)}
                onChange={handleNeaBenefitsChange}
                isDisabled={isFormStateReadOnly}
            />
        </div>
    );
};

export default NeaBenefits;
