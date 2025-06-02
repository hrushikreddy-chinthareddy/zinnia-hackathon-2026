import { Address, AddressType, Policy } from '@zinnia/api-types/types/sor';
import { Link } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import ClickContainer from '@deps/components/click-container/click-container';
import DifferentAddress from '@deps/components/otp-send-document/components/different-address';
import { PartyAddressCard } from '@deps/containers/address-change-container/components/roles-contract/utils/roles-contract-types';
import { isEqualObjects } from '@deps/containers/death-claim-container/steps/notification-method/notification-method.helpers';
import { FormattedAddress } from '@deps/containers/people-data-cards/address-card/address-card.helpers';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { isEmptyObject } from '@deps/helpers/objects.helpers';

import EditAddress from './edit-address';
import { ClaimActionTypes } from '../../death-claim.types';

type ContactCenterAddressProps = {
    policy: Policy;
    setAddress: (val: any) => void;
    party: any;
};
const ContactAddress = ({ policy, setAddress, party }: ContactCenterAddressProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'deathClaims.notificationMethod' });
    const [partyCardsData, setPartyCardsData] = useState<PartyAddressCard[]>([]);
    const [prevAddress, setPrevAddress] = useState<Address>({});
    const [selectedAddress, setSelectedAddress] = useState<number>(-1);
    const [selectedNewAddress, setSelectedNewAddress] = useState(false);
    const sideSheet = useSideSheetContext();

    useEffect(() => {
        const currentParty = policy?.parties?.find(item => item.partyId === party?.partyId);
        const data = [
            {
                firstName: party?.firstName ?? '',
                lastName: party?.lastName ?? '',
                address: currentParty?.addresses?.[0] ?? {},
                partyRoles: [party?.roleType],
                roleIdentifiers: [],
                tags: [],
            },
        ];
        setPartyCardsData(data);
        setPrevAddress(currentParty?.addresses?.[0] || {});
    }, [party, policy?.parties]);

    function handleClick(id: number): void {
        setSelectedAddress(id);
        const selectedAddress = partyCardsData[id];
        const { address } = selectedAddress;
        let zipCode = '';

        if (address?.zipCode && address?.zipCodeExtension) {
            zipCode = `${address?.zipCode}${address?.zipCodeExtension}`;
        }
        let action = ClaimActionTypes.NONE;
        if (address?.addressId !== prevAddress?.addressId) {
            action = ClaimActionTypes.ADD;
        } else if (address?.addressId === prevAddress?.addressId) {
            const isEqual = isEqualObjects(address, prevAddress);

            action = isEqual ? ClaimActionTypes.NONE : ClaimActionTypes.UPDATE;
        }
        setAddress({
            action: action,
            addressType: address?.addressType || AddressType.RESIDENCE,
            addressLine1: address?.addressLine1 || '',
            addressLine2: address?.addressLine2 || '',
            addressLine3: address?.addressLine3 || '',
            city: address?.city || '',
            state: address?.state || '',
            zipCode: address?.zipCode || '',
            zipCodeExtension: address?.zipCodeExtension || '',
            country: address?.country || 'USA',
            addressId: address?.addressId || null,
        });
    }

    const handleSelectedAddress = (val: any) => {
        if (!Object.keys(val).length) {
            setSelectedNewAddress(false);
            sideSheet.handleOpen(false);
            return;
        }
        const { firstName, lastName, addressType, addressId, country, zipCodeExtension, ...address } = val;
        partyCardsData.push({
            firstName,
            lastName,
            address: { ...address, addressType, addressId, country, zipCodeExtension },
            partyRoles: [],
            roleIdentifiers: [],
            tags: [],
        });
        setSelectedNewAddress(true);
        setSelectedAddress(address.id);
        sideSheet.handleOpen(false);
    };

    const handleEditAddress = (val: any) => {
        if (!Object.keys(val).length) {
            setSelectedNewAddress(false);
            sideSheet.handleOpen(false);
            return;
        }
        const { firstName, lastName, addressType, addressId, country, zipCodeExtension, ...address } = val;
        const newData = [
            {
                firstName,
                lastName,
                address: { ...address, addressType, addressId, country, zipCodeExtension },
                partyRoles: [party?.roleType],
                roleIdentifiers: [],
                tags: [],
            },
        ];
        setPartyCardsData(newData);
        setSelectedNewAddress(true);
        setSelectedAddress(address.id);
        sideSheet.handleOpen(false);
    };

    function addDifferentAddress(): void {
        const content = <DifferentAddress carrierId={policy?.carrierId ?? ''} handleClose={handleSelectedAddress} showName={false} />;
        sideSheet.changeSideSheetContent(t('mailDetails.sendToDifferentAddress'), content);
        sideSheet.handleOpen(true);
    }

    function editAddress(value: any) {
        const content = <EditAddress carrierId={policy?.carrierId ?? ''} handleClose={handleEditAddress} partyCardData={value} />;
        sideSheet.changeSideSheetContent(t('mailDetails.updateAddress'), content);
        sideSheet.handleOpen(true);
    }

    return (
        <>
            {partyCardsData.map((partyCard, index) => {
                return (
                    !isEmptyObject(partyCard.address) && (
                        <div className="card-container" key={`select-address-section${index}`}>
                            <ClickContainer
                                classes={clsx(
                                    'flex w-min py-4',
                                    {
                                        'border-primary hover:border-primary ': selectedAddress === index,
                                    },
                                    'min-h-[120px] min-w-[300px]'
                                )}
                                ariaLabel={`Select address`}
                                onClick={() => handleClick(index)}
                                key={`select-address-${index}`}
                                isSelected={selectedAddress === index}
                            >
                                <FormattedAddress address={partyCard?.address || {}} />
                            </ClickContainer>
                            <div className="my-1 ml-[-11px] p-3">
                                <Link text={t('edit')} href="#" onClick={() => editAddress(partyCard)} />
                            </div>
                        </div>
                    )
                );
            })}
            {!selectedNewAddress && (
                <ClickContainer
                    classes={clsx(
                        'flex w-min items-center justify-center py-4',
                        {
                            'border-primary hover:border-primary ': selectedAddress === partyCardsData?.length,
                        },
                        'min-h-[120px] min-w-[300px]'
                    )}
                    ariaLabel={`different address`}
                    onClick={() => addDifferentAddress()}
                    key={`different-address`}
                    isSelected={selectedAddress === partyCardsData?.length}
                >
                    <div key={partyCardsData?.length} className="text-secondary">
                        + {t('mailDetails.sendToDifferentAddress')}
                    </div>
                </ClickContainer>
            )}
        </>
    );
};

export default ContactAddress;
