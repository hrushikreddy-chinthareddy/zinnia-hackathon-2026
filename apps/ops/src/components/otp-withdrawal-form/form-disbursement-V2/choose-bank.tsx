import { useTranslation } from 'next-i18next';

import { FieldSize } from '@deps/components/fields/field';
import SelectSimple from '@deps/components/select/select';

interface ChooseBankProps {
    fieldLabel?: string;
    fieldName: string;
    classNames?: string;
    isFormStateReadOnly: boolean;
    bankOptions: any;
    onDataChange: (value: string) => void;
    selectedValue: string;
}

const ChooseBank = ({
    fieldLabel,
    fieldName,
    classNames,
    isFormStateReadOnly,
    bankOptions,
    onDataChange,
    selectedValue,
}: ChooseBankProps) => {
    const { t } = useTranslation();

    return (
        <SelectSimple
            disabled={isFormStateReadOnly}
            className={classNames}
            label={
                fieldLabel ||
                (t(
                    'caseWithdrawal.request.distributionMethod.chooseTheBank'
                ) as string)
            }
            options={bankOptions}
            onChange={(val) => onDataChange(val)}
            size={FieldSize.Small}
            value={selectedValue}
            data-testid="bankDropdown"
            key={fieldName}
        />
    );
};

export default ChooseBank;
