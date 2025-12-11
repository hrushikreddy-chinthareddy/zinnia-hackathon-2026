import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';

interface BankCheckboxV2Props {
    fieldLabel: string;
    fieldName: string;
    classNames?: string;
    isFormStateReadOnly: boolean;
    onDataChange: (value: boolean, fieldName: string) => void;
    value: boolean;
}

const BankCheckboxV2 = ({
    fieldLabel,
    fieldName,
    classNames,
    isFormStateReadOnly,
    onDataChange,
    value,
}: BankCheckboxV2Props) => {
    return (
        <div className={classNames}>
            <CheckboxText
                label={fieldLabel}
                checked={value}
                onChange={() => onDataChange(!value, fieldName)}
                isDisabled={isFormStateReadOnly}
                key={fieldName}
            />
        </div>
    );
};

export default BankCheckboxV2;
