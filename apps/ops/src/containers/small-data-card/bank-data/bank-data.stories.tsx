import { Meta } from '@storybook/react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import { AccountStatus, AccountType } from '@zinnia/api-types/types/sor';

import BankDataCard from './bank-data';

export default {
    title: 'Containers/BankDataCard',
    container: BankDataCard,
} as Meta<typeof BankDataCard>;

const bankDetails = [
    {
        appliesToPartyID: '',
        financialInstitutionPartyId: '',
        startDate: '2023-11-17',
        endDate: '',
        nameOnAccount: '',
        accountStatus: 'ACTIVEBANKACCOUNT' as AccountStatus,
        accountType: 'SAVINGS' as AccountType,
        accountNumber: '123456789006569',
        routingNumber: '',
        ibaNumber: null,
        branchName: 'CHASE BANK',
        branchAddress: undefined,
        branchPhoneNumber: undefined,
    },
    {
        appliesToPartyID: '',
        financialInstitutionPartyId: '',
        startDate: '2023-11-17',
        endDate: '',
        nameOnAccount: '',
        accountStatus: 'ACTIVEBANKACCOUNT' as AccountStatus,
        accountType: 'CHECKING' as AccountType,
        accountNumber: '12345678905673',
        routingNumber: '',
        ibaNumber: null,
        branchName: 'BANK OF AMERICA',
        branchAddress: undefined,
        branchPhoneNumber: undefined,
    },
];

export const BankData = () => {
    const { t } = useTranslation();
    const [selectedId, setSelectedId] = useState<string | undefined>();
    const handleCardClick = (id: string | undefined) => {
        setSelectedId(id);
    };
    return (
        <div className="flex gap-4">
            {bankDetails.map((bankDetail) => (
                <BankDataCard
                    key={bankDetail.accountNumber}
                    bankDetails={bankDetail}
                    accessibilityClickText={t('ariaLabel.select')}
                    selectedId={selectedId as string}
                    onCardClick={handleCardClick}
                />
            ))}
        </div>
    );
};
