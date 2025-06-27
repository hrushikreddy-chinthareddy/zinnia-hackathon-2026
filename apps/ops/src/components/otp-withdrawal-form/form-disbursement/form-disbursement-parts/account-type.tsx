import { toTitleCase } from '@xd/utils/dist';
import { useTranslation } from 'next-i18next';

import { FieldSize, FieldVariant } from '@deps/components/fields/field';
import SelectSimple from '@deps/components/select/select';
import { AccountType } from '@deps/models/case/withdrawal/case';
import { DisbursementInformation } from '@deps/models/case/withdrawal/disbursement-types';

const AccountTypes = ({
    fieldLabel,
    fieldName,
    classNames,
    isFormStateReadOnly,
    disbursementInformation,
    onDataChange,
    error,
}: DisbursementInformation) => {
    const { t } = useTranslation();
    const accountType = toTitleCase(disbursementInformation.accountType);
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

    const setDataChange = (val: AccountType) => {
        onDataChange((ogData) => ({
            ...ogData,
            accountType: val,
        }));
    };

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
            onChange={(val: string) => setDataChange(val as AccountType)}
            size={FieldSize.Small}
            value={accountType}
            data-testid="accountType"
            key={fieldName}
            message={error}
            variant={error ? FieldVariant.Error : FieldVariant.Default}
        />
    );
};

export default AccountTypes;
