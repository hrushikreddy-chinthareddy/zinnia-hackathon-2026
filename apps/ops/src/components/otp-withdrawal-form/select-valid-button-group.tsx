import { useTranslation } from 'next-i18next';

import { stringifyTrueFalseNull } from '@deps/helpers/string.helpers';

import ButtonGrp from '../button-group/button-group';

interface SelectValidButtonGroupProps {
    options?: {
        label: string;
        value: string;
    }[];
    label: string;
    isValid: string;
    setIsValid: (val: string) => void;
    disabled?: boolean;
}

const SelectValidButtonGroup = ({ options, label, isValid, disabled, setIsValid }: SelectValidButtonGroupProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.oftProcess' });
    const defaultOptions = [
        { label: t('valid'), value: stringifyTrueFalseNull(true) },
        { label: t('notValid'), value: stringifyTrueFalseNull(false) },
    ];

    return (
        <ButtonGrp
            activeValue={isValid}
            groupLabel={label || t(`caseWithdrawal.request.distributionMethod.isVoidCheckAttached`)}
            toggle={setIsValid}
            labels={options || defaultOptions}
            disabled={disabled}
        />
    );
};

export default SelectValidButtonGroup;
