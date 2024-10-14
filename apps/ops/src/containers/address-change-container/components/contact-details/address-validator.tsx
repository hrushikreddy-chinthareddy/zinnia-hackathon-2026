import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';

import NavElement, { NavElementSize, NavElementType } from '@deps/components/nav-element/nav-element';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import AddressDataCard from '@deps/containers/small-data-card/address-data/address-data';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { ReactComponent as ShieldIcon } from '@deps/styles/elements/icons/icons_outlined/shield-check.svg';
import loadingImage from '@deps/styles/images/loader.png';

import { AddressError } from './address-error';
import { getAddressCardDetails, useVerifyAddress, validateAddressFields } from './contact-details.helper';

interface VerifyAddressProps {
    clientCode: string;
    address: any;
    isValidAddress: boolean | null;
    setIsValidAddress: (value: boolean | null) => void;
    selectedId: string | undefined;
    setSelectedId: (value: string | undefined) => void;
    addresses: any;
    setAddresses: (key: string, data: any) => void;
    setAddressValidator?: (value: FormValidationErrors) => void;
    isAddressValidationRequired?: boolean;
}

export default function VerifyAddress({
    clientCode,
    address,
    isValidAddress,
    setIsValidAddress,
    addresses,
    setAddresses,
    selectedId,
    setSelectedId,
    isAddressValidationRequired,
    setAddressValidator,
}: VerifyAddressProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'addressChange.contactDetails' });
    const [loading, getVerifiedAddress, verifiedAddress] = useVerifyAddress(clientCode, address);

    useEffect(() => {
        if (!loading && verifiedAddress) {
            if (verifiedAddress.Error) {
                setAddresses('entered', getAddressCardDetails(address.Address[0], 1));
                setIsValidAddress(false);
                setAddresses('validated', {});
            } else {
                setIsValidAddress(true);
                setAddresses('entered', getAddressCardDetails(address.Address[0], 1));
                if (!verifiedAddress.AddressLine1 && verifiedAddress.AddressLine2) {
                    verifiedAddress.AddressLine1 = verifiedAddress.AddressLine2;
                    verifiedAddress.AddressLine2 = null;
                }
                setAddresses('validated', getAddressCardDetails(verifiedAddress, 2));
            }
        }
    }, [verifiedAddress, address]);

    const handleCardClick = (id: string | undefined) => {
        setSelectedId(id);
    };

    const handleAddressVerification = () => {
        if (isAddressValidationRequired && setAddressValidator) {
            const addressErrors = validateAddressFields(address?.Address[0], t, true, true);
            if (Object.keys(addressErrors).length > 0 ) {
                setAddressValidator(addressErrors);
                return;
            }
            setAddressValidator({});
        }
        if (clientCode) {
            setAddresses('validated', {});
            getVerifiedAddress();
        }
    };

    return (
        <>
            <NavElement
                className="flex max-w-[234px] gap-1 text-left"
                onClick={handleAddressVerification}
                size={NavElementSize.Small}
                type={NavElementType.Button}
            >
                {!loading && <ShieldIcon key="verify-address-btn" className="shrink-0" role="presentation" width={20} height={20} />}
                {loading && (
                    <Image
                        alt={t('actionButtons.verifyAddress')}
                        className="transform-origin-center duration-2000 animate-spin ease-linear"
                        height={20}
                        src={loadingImage}
                        width={20}
                    />
                )}
                {t('actionButtons.verifyAddress')}
            </NavElement>

            {isValidAddress !== null && (
                <div className="bg-gray-50 p-4">
                    <div className="flex flex-col">
                        <Typography variant={TypographyVariant.H4}>{t('selectAddress')}</Typography>
                        <p className="my-1 text-sm font-light">{t('selectingVerifiedAddress')}</p>
                    </div>
                    <div className="mb-2 max-w-[425px]">
                        {isValidAddress === true ? (
                            <AddressDataCard
                                key={addresses?.validated?.addressId}
                                address={addresses?.validated}
                                accessibilityClickText={t('ariaLabel.select')}
                                selectedId={selectedId}
                                onCardClick={handleCardClick}
                                addressStatus={t('addressList.status.verifiedAddress')}
                                isAddressChange={true}
                            />
                        ) : (
                            <AddressError />
                        )}
                    </div>
                    <div className="my-1 max-w-lg">
                        <AddressDataCard
                            key={addresses.entered.addressId}
                            address={addresses?.entered}
                            accessibilityClickText={t('ariaLabel.select')}
                            selectedId={selectedId}
                            onCardClick={handleCardClick}
                            addressStatus={t('addressList.status.enteredAddress')}
                            isAddressChange={true}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
