import { Meta } from '@storybook/react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import { Address, AddressType } from '@deps/models/policy/sor-policy';

import AddressDataCard from './address-data';

export default {
    title: 'Containers/AddressDataCard',
    container: AddressDataCard,
} as Meta<typeof AddressDataCard>;

const addresses: Address[] = [
    {
        addressId: '1',
        startDate: '2023-05-25',
        endDate: '2023-08-31',
        addressType: AddressType.RESIDENCE,
        addressLine1: 'Jean Baptiste Point du Sable Lake Shore Drive',
        addressLine2: 'Apt #2456',
        addressLine3: '',
        city: 'Village of Grosse Pointe Shores',
        state: 'MI',
        zipCode: '48236',
        zipCodeExtension: '6789',
        country: 'KI',
    },
    {
        addressId: '2',
        startDate: '2023-06-25',
        endDate: '2023-08-31',
        addressType: AddressType.BUSINESS,
        addressLine1: '123 Business Street',
        addressLine2: '',
        addressLine3: '',
        city: 'Business City',
        state: 'SC',
        zipCode: '12345',
        zipCodeExtension: '6789',
        country: 'US',
    },
];

export const AddressData = () => {
    const { t } = useTranslation();
    const [selectedId, setSelectedId] = useState<string | undefined>();
    const handleCardClick = (id: string | undefined) => {
        setSelectedId(id);
    };
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="flex gap-4">
                {addresses.map(address => (
                    <AddressDataCard
                        key={address.addressId}
                        address={address}
                        accessibilityClickText={t('ariaLabel.select')}
                        selectedId={selectedId}
                        onCardClick={handleCardClick}
                    />
                ))}
            </div>
        </div>
    );
};
