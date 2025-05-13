import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useMemo, useState } from 'react';

import { FieldSize } from '@deps/components/fields/field';
import SelectSimple from '@deps/components/select/select';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { getBankingDetails, getBankingDetailsLC, getBankOptions, getBankOptionsLC, getSelectedOption, getSelectedOptionLC } from '@deps/helpers/bank.helpers';
import { LifeCadBanking, LifeCadParty } from '@deps/models/case/lifecad-party';
import { AccountType } from '@deps/models/case/withdrawal/case';
import { DisbursementInformation } from '@deps/models/case/withdrawal/disbursement-types';
import { BankAccountBase, Party, PolicyParties } from '@deps/models/policy/sor-policy';
import { isFastFeatureEnabled } from '@deps/utils/optimizely/utils';

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
    const { parties, partyRoles, initialForm, featureFlagDecisions } = useContext(FormDataContext);
    const { setBankSelected } = useContext(SelectedBankContext);
    const OTHER_BANK_OPTION = 'other';
    const isLC = !isFastFeatureEnabled(initialForm?.taskType, featureFlagDecisions);

    const bankingDetails = useMemo(() => {
        return isLC
            ? getBankingDetailsLC(parties as LifeCadParty[])
            : getBankingDetails(parties as Party[], partyRoles as PolicyParties[]);
    }, [isLC, parties, partyRoles]);

    const bankOptions = isLC
        ? getBankOptionsLC(bankingDetails as LifeCadBanking[])
        : getBankOptions(bankingDetails as BankAccountBase[]);


    const [selectedBank, setSelectedBank] = useState('');
    if (bankOptions) {
        bankOptions.push({ label: t('caseWithdrawal.request.distributionMethod.other'), value: OTHER_BANK_OPTION });
    }

    useEffect(() => {
        if (isLC) {
            const selectedOption = bankingDetails.length > 0 ? bankingDetails[0] as LifeCadBanking : ({} as LifeCadBanking);
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
        } else {
            const selectedOption = bankingDetails.length > 0 ? bankingDetails[0] as BankAccountBase : ({} as BankAccountBase);
            if (
                (disbursementInformation.accountNumber === selectedOption.accountNumber &&
                    disbursementInformation.bankName === selectedOption.branchName &&
                    disbursementInformation.bankRoutingNumber === selectedOption.routingNumber) ||
                (!disbursementInformation.accountNumber &&
                    !disbursementInformation.bankName &&
                    !disbursementInformation.bankRoutingNumber &&
                    selectedOption.bankId)
            ) {
                setBankingOption(String(selectedOption?.bankId), false);
            } else {
                setBankingOption(OTHER_BANK_OPTION, false);
            }
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
            if (isLC) {
                const selectedOption = getSelectedOptionLC(bankingDetails as LifeCadBanking[], selectedBank);
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
            } else {
                const selectedOption = getSelectedOption(bankingDetails as BankAccountBase[], selectedBank);
                setBankSelected(true);
                onDataChange(ogData => ({
                    ...ogData,
                    accountType: (selectedOption?.accountType as AccountType) || '',
                    bankName: selectedOption?.branchName || '',
                    accountNumber: selectedOption?.accountNumber || '',
                    bankRoutingNumber: selectedOption?.routingNumber || '',
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
