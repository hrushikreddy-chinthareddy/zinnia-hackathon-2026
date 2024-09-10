import { TFunction } from 'next-i18next';
import { useTranslation } from 'next-i18next';
import * as React from 'react';

import ButtonGrp from '@deps/components/button-group/button-group';

import { MaskedAccountNumber, IMaskedAccountNumberProps } from './masked-account-number';

export enum BankInfoType {
    Full = 'full',
    Masked = 'masked',
}

type IBankInformationContainerProps = {
    children: React.ReactNode;
    selectedBankInfoOption?: BankInfoType;
    disabled?: boolean;
} & IMaskedAccountNumberProps;

const getBankInfoOptions = (t: TFunction) => [
    {
        label: t('fullBankInfo'),
        value: BankInfoType.Full,
    },
    {
        label: t('maskedBankInfo'),
        value: BankInfoType.Masked,
    },
];

const MaskedAccountNumberToggle = ({
    children,
    selectedBankInfoOption,
    maskedAccountNumber,
    setDisbursementInformation,
    disabled,
}: IBankInformationContainerProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.distributionMethod' });
    return selectedBankInfoOption ? (
        <>
            <ButtonGrp
                className="mt-4"
                activeValue={selectedBankInfoOption}
                toggle={val => {
                    setDisbursementInformation(fs => {
                        return {
                            ...fs,
                            isDirectDeposit: val === BankInfoType.Full ? true : false,
                        };
                    });
                }}
                labels={getBankInfoOptions(t)}
                disabled={disabled}
            />
            {selectedBankInfoOption === BankInfoType.Full ? (
                children
            ) : (
                <MaskedAccountNumber
                    maskedAccountNumber={maskedAccountNumber}
                    setDisbursementInformation={setDisbursementInformation}
                    disabled={disabled}
                />
            )}
        </>
    ) : null;
};

export default MaskedAccountNumberToggle;
