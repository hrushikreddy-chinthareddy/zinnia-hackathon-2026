import { Tag } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';

import ClickContainer from '@deps/components/click-container/click-container';
import Content, { ContentVariant } from '@deps/components/content/content';
import Label, { LabelVariant } from '@deps/components/label/label';
import { formatAddress, formatAddressV2 } from '@deps/helpers/address.helper';
import { getAddressType } from '@deps/helpers/party-info-helper';
import { toTitleCase } from '@deps/helpers/string.helper';
import { Address } from '@deps/models/policy/sor-policy';

export interface AddressDataCardProps {
    address: Address;
    accessibilityClickText: string;
    onCardClick?: (id: string | undefined) => void;
    selectedId?: string;
    addressStatus?: string | null;
    isAddressChange?: boolean;
}
let fullAddress: string | JSX.Element;
export const formatAddressToContainer = (address: Address, skipCountryCode: boolean) => {
    let formatted = formatAddress(address);
    if (skipCountryCode) {
        formatted = formatAddressV2(address);
    }

    fullAddress = (
        <div className="font-secondary text-md font-normal leading-[22px]">
            {formatted.map((line, index) => (
                <div className={index < 2 ? 'mb-1' : ''} key={index}>
                    {line}
                </div>
            ))}
        </div>
    );

    return formatted;
};

interface AddressTypeAndAddressProps {
    address: Address;
    addressType: string;
    isAddressChange?: boolean;
}

export const AddressTypeAndAddress = ({ address, addressType, isAddressChange = false }: AddressTypeAndAddressProps) => {
    const formattedAddress = formatAddressToContainer(address, isAddressChange);

    return (
        <div className="flex flex-col items-start text-gray-900">
            {!isAddressChange && addressType && (
                <Label className="h-6 leading-4.5" label={toTitleCase(addressType)} variant={LabelVariant.FieldLabel} />
            )}
            {isAddressChange && addressType && <Tag text={toTitleCase(addressType)} className="my-1" />}

            <div className={`leading-[18px] ${!addressType && 'pt-2'} text-bold`}>
                {formattedAddress.map((line, index) => (
                    <Content
                        key={index}
                        truncate
                        details={line}
                        variant={isAddressChange ? ContentVariant.BodySmBold : ContentVariant.BodySm}
                        popoverBody={fullAddress}
                        popoverClassName="w-full "
                        pii={true}
                    />
                ))}
            </div>
        </div>
    );
};

const AddressDataCard = ({
    address,
    accessibilityClickText = '',
    onCardClick,
    selectedId,
    addressStatus = null,
    isAddressChange = false,
}: AddressDataCardProps) => {
    const { t } = useTranslation();
    const addressType = addressStatus || getAddressType(address?.addressType, t);
    const addressString = t('people.card.address');

    const handleClick = () => {
        if (onCardClick) {
            onCardClick(address.addressId);
        }
    };

    const isSelected = address.addressId === selectedId;
    const selectedClass = clsx(
        ' w-min',
        {
            'border-primary hover:border-primary ': isSelected,
        },
        isAddressChange ? 'min-w-[425px]' : 'min-w-[300px]'
    );

    return (
        <ClickContainer
            classes={selectedClass}
            onClick={handleClick}
            ariaLabel={`${accessibilityClickText} ${addressType} ${addressString}`}
        >
            <AddressTypeAndAddress address={address} addressType={addressType || ''} isAddressChange={isAddressChange} />
        </ClickContainer>
    );
};

export default AddressDataCard;
