import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import Button, { ButtonSize, ButtonType } from '@deps/components/button/button';
import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import AddressEntry from '@deps/components/otp-withdrawal-form/address-entry';
import VerifyAddress from '@deps/containers/address-change-container/components/contact-details/address-validator';
import { formatAddress } from '@deps/containers/address-change-container/components/contact-details/contact-details.helpers';
import { PartyAddressCard } from '@deps/containers/address-change-container/components/roles-contract/utils/roles-contract-types';
import CardContainer from '@deps/containers/card-container/card-container';
import {
    AddressTypes,
    FormValidationErrors,
} from '@deps/models/case/withdrawal/case';
import { Address } from '@zinnia/api-types/types/sor';

type CommonEditAddressProps = {
    carrierId: string;
    handleClose: (selectedAddress: any) => void;
    isCancel?: boolean;
    isContainerClass?: boolean;
};

type EditAddressProps =
    | (CommonEditAddressProps & {
          partyCardData: PartyAddressCard;
          address?: never;
      })
    | (CommonEditAddressProps & {
          address: Address;
          partyCardData?: never;
      });

const EditAddress = (props: EditAddressProps) => {
    const {
        carrierId,
        handleClose,
        isCancel = true,
        isContainerClass = true,
    } = props;
    const { t } = useTranslation(undefined, {
        keyPrefix: 'deathClaims.notificationMethod',
    });
    const address =
        'partyCardData' in props ? props.partyCardData?.address : props.address;

    const [enteredAddress, setEnteredAddress] = useState<any>(address || {});
    const [isValidAddress, setIsValidAddress] = useState<boolean | null>(null);
    const [selectedId, setSelectedId] = useState<string | undefined>('');
    const [addresses, setAddressesData] = useState<any | null>({
        entered: address,
        validated: {},
    });
    const [addressValidator, setAddressValidator] =
        useState<FormValidationErrors>();
    const [formErrors, setFormErrors] = useState<FormValidationErrors>({});

    function formatAndSetEnteredAddress(address: any): void {
        const userEnteredAddress = formatAddress(address);
        setEnteredAddress({
            Address: [userEnteredAddress],
        });
    }

    const initialAddress = {
        addressLine1: address?.addressLine1 || '',
        addressLine2: address?.addressLine2 || null,
        addressLine3: address?.addressLine3 || null,
        addressLine4: null,
        addressType: 'DEFAULT' as AddressTypes,
        city: address?.city || null,
        country: address?.country || 'USA',
        state: address?.state || '',
        zip: address?.zipCode || '',
        zipPlusFour: address?.zipCodeExtension || null,
        isAddressChanged: false,
    };

    const validateAddress = () => {
        const errors: FormValidationErrors = {};
        if (!selectedId) {
            errors['address'] = t('errors.address');
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    function handleContinue() {
        if (validateAddress()) {
            const mergeAddress = [
                { ...addresses['entered'] },
                { ...addresses['validated'] },
            ];
            const newAddress = mergeAddress.find(
                (a) => a.addressId === selectedId
            );
            handleClose({
                ...newAddress,
                addressId: address?.addressId,
                addressType: address?.addressType,
            });
        }
    }

    function handleCancelClick(event: any) {
        event.preventDefault();
        handleClose({});
    }

    function handleSetAddresses(key: string, data: any): void {
        setAddressesData((prevState: any) => ({ ...prevState, [key]: data }));
    }

    return (
        <CardContainer
            classNames={'w-full'}
            containerClassNames={
                isContainerClass ? 'w-full content-divider' : 'w-full'
            }
        >
            <div className="col-span-4 py-4">
                <AddressEntry
                    isPayeeAddress={true}
                    showAddressLines={true}
                    onDataChange={formatAndSetEnteredAddress}
                    errors={addressValidator}
                    initialAddress={initialAddress}
                />
            </div>
            <div className="flex flex-col gap-4">
                <VerifyAddress
                    clientCode={carrierId}
                    address={enteredAddress}
                    isValidAddress={isValidAddress}
                    setIsValidAddress={setIsValidAddress}
                    selectedId={selectedId}
                    addresses={addresses}
                    setAddresses={handleSetAddresses}
                    setSelectedId={setSelectedId}
                    setAddressValidator={setAddressValidator}
                    isAddressValidationRequired={true}
                />
            </div>
            {formErrors?.address && (
                <AssistiveText
                    text={formErrors?.address}
                    variant={AssistiveTextVariant.Error}
                    className="my-4"
                />
            )}

            <div className="mt-4 flex">
                <Button
                    className="mr-4"
                    onClick={handleContinue}
                    size={ButtonSize.Small}
                    type={ButtonType.Primary}
                >
                    {t('formActions.continue')}
                </Button>
                {isCancel && (
                    <NavElement
                        aria-label={t('cancel') as string}
                        onClick={handleCancelClick}
                        size={NavElementSize.Small}
                        type={NavElementType.Button}
                        variant={NavElementVariant.Default}
                    >
                        {t('formActions.cancel')}
                    </NavElement>
                )}
            </div>
        </CardContainer>
    );
};

export default EditAddress;
