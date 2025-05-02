import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction } from 'react';

import { FieldSize } from '@deps/components/fields/field';
import SelectSimple from '@deps/components/select/select';
import { RmdFormType } from '@deps/models/case/enums';

export const rmdFormTypeOptions = () => [
    {
        label: 'RMD',
        value: RmdFormType.RMD,
    },
    {
        label: 'QCD',
        value: RmdFormType.QCD,
    },
];

interface SelectFormTypeProps {
    formType: string;
    isFormStateReadOnly: boolean;
    onFormTypeChange: Dispatch<SetStateAction<RmdFormType>>;
}

const SelectFormType: React.FC<SelectFormTypeProps> = ({ formType, isFormStateReadOnly, onFormTypeChange }) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });

    const handleChange = (val: string) => {
        onFormTypeChange(val as RmdFormType);
    };
    return (
        <div>
            <SelectSimple
                className="max-w-lg my-3"
                label={t('formType') as string}
                options={rmdFormTypeOptions()}
                onChange={value => handleChange(value)}
                size={FieldSize.Small}
                value={formType}
                name="sswRequest"
                disabled={isFormStateReadOnly}
            />
        </div>
    );
};

export default SelectFormType;
