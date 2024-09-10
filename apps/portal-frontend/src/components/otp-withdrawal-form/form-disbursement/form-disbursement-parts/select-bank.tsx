import { useTranslation } from 'next-i18next';
import React, { useContext, useEffect, useMemo, useState } from 'react';

import { FieldSize } from '@deps/components/fields/field';
import SelectSimple from '@deps/components/select/select';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { LifeCadBanking, LifeCadParty } from '@deps/models/case/lifecad-party';
import { AccountType } from '@deps/models/case/withdrawal/case';
import { DisbursementInformation } from '@deps/models/case/withdrawal/disbursement-types';

import { SelectedBankContext } from './pre-populate-banking-details';
const SelectBank = ({
    fieldLabel,
    fieldName,
    classNames,
    disbursementInformation,
    isFormStateReadOnly,
    onDataChange,
}: DisbursementInformation) => {
    const { t } = useTranslation();
    const { parties } = useContext(FormDataContext);
    const { setBankSelected } = useContext(SelectedBankContext);
    const OTHER_BANK_OPTION = 'other';

    const bankingDetails = useMemo(
        () => parties?.filter((party: LifeCadParty) => party.Role === 'Primary Owner')[0]?.Banking || [],
        [parties]
    );

    const bankOptions = bankingDetails.map(bank => ({ label: bank.BankName, value: String(bank.BankId) }));
    const [selectedBank, setSelectedBank] = useState('');
    if (bankOptions) {
        bankOptions.push({ label: t('caseWithdrawal.request.distributionMethod.other'), value: OTHER_BANK_OPTION });
    }

    useEffect(() => {
        const selectedOption = bankingDetails.length > 0 ? bankingDetails[0] : ({} as LifeCadBanking);
        if (
            (disbursementInformation.accountNumber === selectedOption.AccountNumber &&
                disbursementInformation.bankName === selectedOption.BankName &&
                disbursementInformation.bankRoutingNumber === selectedOption.RoutingNumber) ||
            (!disbursementInformation.accountNumber &&
                !disbursementInformation.bankName &&
                !disbursementInformation.bankRoutingNumber &&
                selectedOption.BankId)
        ) {
            setBankingOption(String(selectedOption?.BankId), false);
        } else {
            setBankingOption(OTHER_BANK_OPTION, false);
        }
    }, []);

    const setBankingOption = (selectedBank: string, userSelectedOption: boolean) => {
        setSelectedBank(selectedBank);
        if (selectedBank === OTHER_BANK_OPTION) {
            setBankSelected(false);

            onDataChange(ogData => ({
                ...ogData,
                accountType: !userSelectedOption ? disbursementInformation.accountType : AccountType.Checking,
                bankName: !userSelectedOption ? disbursementInformation.bankName : '',
                accountNumber: !userSelectedOption ? disbursementInformation.accountNumber : '',
                bankRoutingNumber: !userSelectedOption ? disbursementInformation.bankRoutingNumber : '',
                isVoidCheckAttached: !userSelectedOption ? disbursementInformation.isVoidCheckAttached : null,
                isWireApprovalPresent: !userSelectedOption ? disbursementInformation.isWireApprovalPresent : false,
                doesCheckMeetSecurityRequirements: !userSelectedOption ? disbursementInformation.doesCheckMeetSecurityRequirements : null,
                accountHolder: !userSelectedOption ? disbursementInformation.accountHolder : '',
                bankFurtherCreditAccount: !userSelectedOption
                    ? disbursementInformation.bankFurtherCreditAccount
                    : !userSelectedOption
                    ? disbursementInformation.bankFurtherCreditAccount
                    : '',
                bankFurtherCreditName: !userSelectedOption ? disbursementInformation.bankFurtherCreditName : '',
            }));
        } else if (selectedBank !== '') {
            const selectedOption = bankingDetails.find(bankDetail => String(bankDetail.BankId) === selectedBank);
            setBankSelected(true);
            onDataChange(ogData => ({
                ...ogData,
                accountType: (selectedOption?.AccountType as AccountType) || '',
                bankName: selectedOption?.BankName || '',
                accountNumber: selectedOption?.AccountNumber || '',
                bankRoutingNumber: selectedOption?.RoutingNumber || '',
                isVoidCheckAttached: !userSelectedOption ? disbursementInformation.isVoidCheckAttached : null,
                isWireApprovalPresent: !userSelectedOption ? disbursementInformation.isWireApprovalPresent : false,
                doesCheckMeetSecurityRequirements: !userSelectedOption ? disbursementInformation.doesCheckMeetSecurityRequirements : null,
                accountHolder: !userSelectedOption ? disbursementInformation.accountHolder : '',
                bankFurtherCreditAccount: !userSelectedOption
                    ? disbursementInformation.bankFurtherCreditAccount
                    : !userSelectedOption
                    ? disbursementInformation.bankFurtherCreditAccount
                    : '',
                bankFurtherCreditName: !userSelectedOption ? disbursementInformation.bankFurtherCreditName : '',
            }));
        }
    };

    return (
        <SelectSimple
            disabled={isFormStateReadOnly}
            className={classNames}
            label={fieldLabel || (t('caseWithdrawal.request.distributionMethod.chooseTheBank') as string)}
            options={bankOptions}
            onChange={val => setBankingOption(val, true)}
            size={FieldSize.Small}
            value={selectedBank}
            data-testid="bankDropdown"
            key={fieldName}
        />
    );
};

export default SelectBank;
