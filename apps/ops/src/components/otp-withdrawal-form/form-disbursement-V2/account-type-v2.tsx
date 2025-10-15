import { useTranslation } from 'next-i18next';

import { FieldSize, FieldVariant } from '@deps/components/fields/field';
import SelectSimple from '@deps/components/select/select';
import { AccountType } from '@deps/models/case/withdrawal/case';

interface AccountTypesV2Props {
    fieldLabel?: string;
    fieldName: string;
    classNames?: string;
    isFormStateReadOnly: boolean;
    onDataChange: any;
    error?: string;
    value: string;
}

const AccountTypesV2 = ({
    fieldLabel,
    fieldName,
    classNames,
    isFormStateReadOnly,
    onDataChange,
    error,
    value,
}: AccountTypesV2Props) => {
    const { t } = useTranslation();

    const accountTypeOptions = [
        {
            label: t('caseWithdrawal.request.distributionMethod.savings'),
            value: AccountType.Savings,
        },
        {
            label: t('caseWithdrawal.request.distributionMethod.checking'),
            value: AccountType.Checking,
        },
    ];

    return (
        <SelectSimple
            disabled={isFormStateReadOnly}
            className={classNames}
            label={
                fieldLabel ||
                (t(
                    'caseWithdrawal.request.distributionMethod.accountType'
                ) as string)
            }
            options={accountTypeOptions}
            onChange={(val: string) => onDataChange({ text: val }, fieldName)}
            size={FieldSize.Small}
            value={value}
            data-testid="accountType"
            key={fieldName}
            message={error}
            variant={error ? FieldVariant.Error : FieldVariant.Default}
        />
    );
};

export default AccountTypesV2;
