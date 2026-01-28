import { Transition } from '@headlessui/react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import Field, {
    FieldType,
    FieldSize,
    FieldVariant,
} from '@deps/components/fields/field';
import NavElement, {
    NavElementSize,
    NavElementType,
} from '@deps/components/nav-element/nav-element';
import Radio, {
    RadioOrientation,
    RadioVariant,
} from '@deps/components/radio/radio';
import SelectSimple from '@deps/components/select/select';
import { TranslationFiles } from '@deps/config/translations';
import { AddressField, FormatPatterns } from '@deps/constants/policy';
import {
    AdditionalAddressLine,
    getNewAddressTypeOptions,
} from '@deps/containers/people-data-cards/address-card/side-sheet/side-sheet-address.helpers';
import {
    ExtendedAddress,
    useRoleChange,
} from '@deps/contexts/RoleChangeContext';
import { getStateCodes } from '@deps/helpers/states.helpers';
import { ReactComponent as AddIcon } from '@deps/styles/elements/icons/content/add-small.svg';
import {
    Address,
    AddressType,
    Country,
    State,
} from '@zinnia/api-types/types/sor';

import { getVariant, getVisibleAddressLines } from '../role-change-helper';

type AddressDetailsProps = {
    addressDetails: ExtendedAddress;
    handleAddressChange: any;
    index: number;
    isReadOnly: boolean;
    role: string;
    onPreferredAddressChange?: (id: string, checked: boolean) => void;
    disablePreferredAddress?: boolean;
    showPreferredCheckbox?: boolean;
};

function AddressDetails({
    addressDetails,
    handleAddressChange,
    index,
    isReadOnly,
    role,
    onPreferredAddressChange,
    disablePreferredAddress,
    showPreferredCheckbox = false,
}: AddressDetailsProps) {
    const INITIAL_ADDRESS: Address = {
        addressType: AddressType.RESIDENCE,
        country: Country.US,
    };

    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'people.sideSheet.address',
    });
    const { t: defaultT } = useTranslation();

    const { currentErrors } = useRoleChange();
    const addressTypeOptions = getNewAddressTypeOptions({ t: defaultT });
    const stateOptions = getStateCodes().map((state) => ({
        label: state,
        value: state,
    }));

    const address = addressDetails || INITIAL_ADDRESS;
    const addressType = address.addressType || AddressType.RESIDENCE;

    const [addressLines, setAddressLines] = useState(
        getVisibleAddressLines(address)
    );

    const isDelete = address?.remove == true;
    const disabled = isDelete || isReadOnly;

    const roleCheck = role.toLowerCase().includes('owner');

    const addressChangeHandler = (
        key: AddressField,
        value: string | boolean
    ) => {
        handleAddressChange(AddressField.Addresses, index, key, value);
    };

    const preferredAddressId = `preferredAddress-${index}`;

    return (
        <div>
            <div
                className="flex justify-between"
                key={`address-${index}-${address.addressType}`}
            >
                <div>
                    <Radio
                        aria-label={t('labels.addressType') as string}
                        items={addressTypeOptions}
                        label={t('labels.addressType') as string}
                        onChange={(event) => {
                            addressChangeHandler(
                                AddressField.AddressType,
                                event.target.value as AddressType
                            );
                        }}
                        value={addressType}
                        orientation={RadioOrientation.Horizontal}
                        name={`addressType-${index}-${Math.random()}`}
                        disabled={disabled}
                        variant={
                            disabled
                                ? RadioVariant.Inactive
                                : RadioVariant.Default
                        }
                        id={`addressType-${index}`}
                    />
                    <div className="flex flex-col gap-6 mt-6">
                        <div className="flex w-full flex-col items-start">
                            <div className="flex w-full flex-col gap-6">
                                <Field
                                    aria-label={t('labels.address') as string}
                                    label={t('labels.address') as string}
                                    onChange={(e) => {
                                        addressChangeHandler(
                                            AddressField.AddressLine1,
                                            e.target.value
                                        );
                                    }}
                                    size={FieldSize.Small}
                                    type={FieldType.BaseActive}
                                    value={address?.addressLine1}
                                    disabled={disabled}
                                    variant={
                                        roleCheck
                                            ? getVariant(
                                                  'addressLine1',
                                                  address,
                                                  disabled
                                              )
                                            : disabled
                                            ? FieldVariant.Inactive
                                            : FieldVariant.Default
                                    }
                                    message={
                                        currentErrors?.addressLine1
                                            ? t('errors.address')
                                            : ''
                                    }
                                    required={roleCheck ? true : false}
                                />
                                <AdditionalAddressLine
                                    aria-label={
                                        t('labels.addressLine2') as string
                                    }
                                    disabled={disabled}
                                    label={t('labels.addressLine2') as string}
                                    onChange={(e) =>
                                        addressChangeHandler(
                                            AddressField.AddressLine2,
                                            e.target.value
                                        )
                                    }
                                    removeAddressLine={() => {
                                        setAddressLines(
                                            (prevState) => prevState - 1
                                        );
                                    }}
                                    show={addressLines >= 2}
                                    value={address?.addressLine2 || ''}
                                    data-testid={'address-line2'}
                                />
                                <AdditionalAddressLine
                                    aria-label={
                                        t('labels.addressLine3') as string
                                    }
                                    disabled={disabled}
                                    label={t('labels.addressLine3') as string}
                                    onChange={(event) =>
                                        addressChangeHandler(
                                            AddressField.AddressLine3,
                                            event.target.value
                                        )
                                    }
                                    removeAddressLine={() => {
                                        setAddressLines(
                                            (prevState) => prevState - 1
                                        );
                                    }}
                                    show={addressLines >= 3}
                                    value={address?.addressLine3 ?? ''}
                                    data-testid={'address-line3'}
                                />
                            </div>
                            <Transition
                                as="div"
                                className="mt-2"
                                show={addressLines < 3}
                                enter="transition ease-in-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <NavElement
                                    disabled={disabled}
                                    onClick={() =>
                                        setAddressLines(
                                            (prevState) => prevState + 1
                                        )
                                    }
                                    size={NavElementSize.Small}
                                    startIcon={
                                        <AddIcon height={20} width={20} />
                                    }
                                    type={NavElementType.Button}
                                >
                                    {t('general.addAdressLine')}
                                </NavElement>
                            </Transition>
                        </div>
                        <div className="flex gap-4">
                            <div className="basis-1/4">
                                <Field
                                    aria-label={t('labels.zip') as string}
                                    disabled={disabled}
                                    formatOptions={{
                                        format: FormatPatterns.ZIP_CODE,
                                    }}
                                    label={t('labels.zip') as string}
                                    message={
                                        currentErrors?.zipCode
                                            ? t('errors.zipCode')
                                            : ''
                                    }
                                    onChange={(event) => {
                                        addressChangeHandler(
                                            AddressField.ZipCode,
                                            event.target.value.substring(0, 5)
                                        );
                                        addressChangeHandler(
                                            AddressField.ZipCodeExtension,
                                            event.target.value.substring(5, 9)
                                        );
                                    }}
                                    size={FieldSize.Small}
                                    type={FieldType.BaseActive}
                                    value={
                                        (address.zipCode ?? '') +
                                        (address.zipCodeExtension ?? '')
                                    }
                                    variant={
                                        currentErrors?.zipCode
                                            ? FieldVariant.Error
                                            : disabled
                                            ? FieldVariant.Inactive
                                            : FieldVariant.Default
                                    }
                                />
                            </div>
                            <div className="flex-grow">
                                <Field
                                    aria-label={t('labels.city') as string}
                                    label={t('labels.city') as string}
                                    message={
                                        currentErrors?.city
                                            ? t('errors.city')
                                            : ''
                                    }
                                    onChange={(event) => {
                                        addressChangeHandler(
                                            AddressField.City,
                                            event.target.value
                                        );
                                    }}
                                    size={FieldSize.Small}
                                    type={FieldType.BaseActive}
                                    value={address?.city}
                                    variant={
                                        currentErrors?.city
                                            ? FieldVariant.Error
                                            : disabled
                                            ? FieldVariant.Inactive
                                            : FieldVariant.Default
                                    }
                                    disabled={disabled}
                                />
                            </div>
                            <div className="basis-1/4">
                                <SelectSimple
                                    aria-label={t('labels.state') as string}
                                    disabled={disabled}
                                    label={t('labels.state') as string}
                                    message={
                                        currentErrors?.state
                                            ? t('errors.state')
                                            : ''
                                    }
                                    onChange={(value) => {
                                        addressChangeHandler(
                                            AddressField.State,
                                            value as State
                                        );
                                    }}
                                    options={stateOptions}
                                    size={FieldSize.Small}
                                    value={address.state as State}
                                    variant={
                                        currentErrors?.state
                                            ? FieldVariant.Error
                                            : disabled
                                            ? FieldVariant.Inactive
                                            : FieldVariant.Default
                                    }
                                />
                            </div>
                        </div>
                        {showPreferredCheckbox && (
                            <CheckboxText
                                id={preferredAddressId}
                                label={t('labels.preferredAddress')}
                                checked={!!address.isPreferred}
                                onChange={(checked) =>
                                    onPreferredAddressChange?.(
                                        preferredAddressId,
                                        checked
                                    )
                                }
                                isDisabled={disabled || disablePreferredAddress}
                                readonly={
                                    address.isPreferred ? true : isReadOnly
                                }
                            />
                        )}
                    </div>
                </div>
                <CheckboxText
                    checked={isDelete}
                    label={t('labels.removeAddress')}
                    onChange={(e) => {
                        addressChangeHandler(AddressField.Remove, e);
                    }}
                    isDisabled={isReadOnly}
                />
            </div>
        </div>
    );
}

export default AddressDetails;
