import { PartyRole, PartyType, Policy } from '@zinnia/api-types/types/sor';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import React, { useMemo, useState } from 'react';

import ClickContainer from '@deps/components/click-container/click-container';
import { RoleAddressCard } from '@deps/containers/address-change-container/components/roles-contract/components/role-address-cards';
import { groupPartiesByAddress } from '@deps/containers/address-change-container/components/roles-contract/utils/roles-contract-helpers';
import { PartyAddressCard } from '@deps/containers/address-change-container/components/roles-contract/utils/roles-contract-types';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { PaperMail } from '@deps/models/case/correspondence';
import { AllowedRoleTypes } from '@deps/models/case/send-document';

import DifferentAddress from './different-address';

type ContactCenterAddressProps = {
    policy: Policy;
    setAddress: (val: PaperMail) => void;
};
const ContactCenterAddress = ({ policy, setAddress }: ContactCenterAddressProps) => {
    const { t: addressChangeT } = useTranslation(undefined, { keyPrefix: 'addressChange' });
    const { t: contactCenterT } = useTranslation(undefined, { keyPrefix: 'sendDocument.correspondence' });

    const [selectedAddress, setSelectedAddress] = useState<number>(-1);
    const sideSheet = useSideSheetContext();
    const extractedParties = useMemo(() => policy?.parties || [], [policy]);

    const checkCustodialContract = policy?.parties?.find((party, index) => {
        if (party.partyType === PartyType.ORGANIZATION) {
            const correspondingRole = policy?.partyRoles?.[index];
            return correspondingRole?.partyRole === PartyRole.OWNER;
        }
        return false;
    });

    const roleTypes = useMemo(() => (checkCustodialContract ? [PartyRole.INSURED] : AllowedRoleTypes), [checkCustodialContract]);

    const extractedPartyRoles = useMemo(
        () => policy?.partyRoles?.filter(role => roleTypes.includes(role?.partyRole ?? '')) || [],
        [policy?.partyRoles, roleTypes]
    );
    const [selectedNewAddress, setSelectedNewAddress] = useState(false);
    const qualificationType = React.useMemo(() => policy?.qualificationType ?? '', [policy]);

    const partyCardsData: PartyAddressCard[] = useMemo(
        () => groupPartiesByAddress(extractedPartyRoles, extractedParties, qualificationType, addressChangeT, false),
        [extractedPartyRoles, extractedParties, qualificationType, addressChangeT]
    );

    function handleClick(id: number): void {
        setSelectedAddress(id);
        const selectedAddress = partyCardsData[id];
        const { address, firstName, lastName } = selectedAddress;

        let zipCode = '';

        if (address?.zipCode && address?.zipCodeExtension) {
            zipCode = `${address?.zipCode}${address?.zipCodeExtension}`;
        }

        setAddress({
            dob: '',
            addressLine1: address?.addressLine1 ?? '',
            addressLine2: address?.addressLine2 ?? '',
            addressLine3: address?.addressLine3 ?? '',
            city: address?.city ?? '',
            state: address?.state,
            zipCode,
            type: 'owner',
            firstName: firstName ?? '',
            lastName: lastName ?? '',
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

    function addDifferentAddress(): void {
        const content = <DifferentAddress carrierId={policy?.carrierId ?? ''} handleClose={handleSelectedAddress} />;
        sideSheet.changeSideSheetContent(contactCenterT('mailDetails.sendToDifferentAddress'), content);
        sideSheet.handleOpen(true);
    }

    return (
        <>
            <RoleAddressCard
                partyCardsLits={partyCardsData}
                title={''}
                handleClick={handleClick}
                selectedIds={[selectedAddress]}
                isAddressChange={false}
            ></RoleAddressCard>
            {!selectedNewAddress && (
                <ClickContainer
                    classes={clsx(
                        'flex w-min items-center justify-center py-4',
                        {
                            'border-primary hover:border-primary ': selectedAddress === partyCardsData.length,
                        },
                        'min-h-[120px] min-w-[300px]'
                    )}
                    ariaLabel={`different address`}
                    onClick={() => addDifferentAddress()}
                    key={`different-address`}
                    isSelected={selectedAddress === partyCardsData.length}
                >
                    <div key={partyCardsData.length} className="text-secondary">
                        + {contactCenterT('mailDetails.sendToDifferentAddress')}
                    </div>
                </ClickContainer>
            )}
        </>
    );
};

export default ContactCenterAddress;
