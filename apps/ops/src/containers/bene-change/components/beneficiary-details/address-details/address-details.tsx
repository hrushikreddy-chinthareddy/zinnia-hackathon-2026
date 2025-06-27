import { PartyType, State } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import SelectSimple from '@deps/components/select/select';
import { TranslationFiles } from '@deps/config/translations';
import { getStateCodes } from '@deps/helpers/states.helpers';

import {
    ENTERPRISE_ADDRESS_TYPE,
    EnterpriseAddress,
    Errors,
    INITIAL_ADDRESS,
} from './address-details.helpers';

export interface AddressDetailsProps {
    setCurrentAddresses: Dispatch<SetStateAction<EnterpriseAddress[]>>;
    updateAddress?: EnterpriseAddress;
    index: number;
    isReadOnly?: boolean;
    partyType: PartyType;
}

export default function AddressDetails({
    setCurrentAddresses,
    updateAddress,
    index,
    isReadOnly,
    partyType,
}: AddressDetailsProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'beneChange.beneDetails.address',
    });
    const stateOptions = getStateCodes().map((state) => ({
        label: state,
        value: state,
    }));
    const addressTypeOptions = [
        { label: t('addressType.home'), value: ENTERPRISE_ADDRESS_TYPE.HOME },
        {
            label: t('addressType.business'),
            value: ENTERPRISE_ADDRESS_TYPE.BUSINESS,
        },
        {
            label: t('addressType.secondary'),
            value: ENTERPRISE_ADDRESS_TYPE.SECONDARY,
        },
        {
            label: t('addressType.default'),
            value: ENTERPRISE_ADDRESS_TYPE.DEFAULT,
        },
    ];
    const addressLine1Label =
        partyType === PartyType.TRUST
            ? t('labels.trusteeName')
            : t('labels.addressLine1');
    const addressLine1MaxLength = partyType === PartyType.TRUST ? 31 : 35;
    const [address, setAddress] = useState<EnterpriseAddress>(
        updateAddress ?? INITIAL_ADDRESS
    );
    const [currentErrors, setCurrentErrors] = useState<Errors>();

    useEffect(() => {
        setCurrentAddresses((prevState) => {
            prevState.splice(index, 1, { ...prevState[index], ...address });
            return prevState;
        });

        if (address.addressLine1 || address.addressLine2) {
            if (!address.zipCode) {
                setCurrentErrors((prevState: any) => ({
                    ...prevState,
                    zipCode: t('formValidations.zipCode'),
                }));
            }
            if (!address.state) {
                setCurrentErrors((prevState: any) => ({
                    ...prevState,
                    state: t('formValidations.state'),
                }));
            }
            if (!address.city) {
                setCurrentErrors((prevState: any) => ({
                    ...prevState,
                    city: t('formValidations.city'),
                }));
            }
        }
        if (!address.addressLine1 && !address.addressLine2) {
            setCurrentErrors((prevState: any) => ({
                ...prevState,
                city: null,
                state: null,
                zipCode: null,
            }));
        }
    }, [address, index, setCurrentAddresses, t]);

    return (
        <>
            <div className="grid grid-cols-2">
                <div className="mb-3 flex w-full flex-col">
                    <div className="my-3">
                        <SelectSimple
                            aria-label={t('labels.addressType') as string}
                            label={t('labels.addressType') as string}
                            onChange={(value) => {
                                setAddress((prevState: any) => ({
                                    ...prevState,
                                    addressType: value,
                                }));
                            }}
                            options={addressTypeOptions}
                            size={FieldSize.Small}
                            value={address?.addressType}
                            variant={
                                isReadOnly
                                    ? FieldVariant.Inactive
                                    : FieldVariant.Default
                            }
                            disabled={isReadOnly}
                        />
                    </div>
                    <div className="my-3">
                        <Field
                            aria-label={addressLine1Label}
                            label={addressLine1Label as string}
                            onChange={(event) => {
                                setAddress((prevState: any) => ({
                                    ...prevState,
                                    addressLine1: event.target.value,
                                }));
                            }}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={address?.addressLine1 || ''}
                            maxLength={addressLine1MaxLength}
                            variant={
                                isReadOnly
                                    ? FieldVariant.Inactive
                                    : FieldVariant.Default
                            }
                        />
                    </div>
                    <div>
                        <Field
                            aria-label={t('labels.addressLine2') as string}
                            label={t('labels.addressLine2') as string}
                            onChange={(event) => {
                                setAddress((prevState: any) => ({
                                    ...prevState,
                                    addressLine2: event.target.value,
                                }));
                            }}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={address?.addressLine2 || ''}
                            maxLength={35}
                            variant={
                                isReadOnly
                                    ? FieldVariant.Inactive
                                    : FieldVariant.Default
                            }
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2">
                <div className="flex gap-4">
                    <div className="flex-grow">
                        <Field
                            aria-label={t('labels.city') as string}
                            label={t('labels.city') as string}
                            message={currentErrors?.city}
                            onChange={(event) => {
                                setCurrentErrors((prevState: any) => {
                                    const { city, ...errors } = prevState ?? {};
                                    return errors;
                                });
                                setAddress((prevState: any) => ({
                                    ...prevState,
                                    city: event.target.value,
                                }));
                            }}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={address?.city}
                            maxLength={40}
                            variant={
                                isReadOnly
                                    ? FieldVariant.Inactive
                                    : currentErrors?.city
                                    ? FieldVariant.Error
                                    : FieldVariant.Default
                            }
                        />
                    </div>
                    <div className="basis-1/4">
                        <SelectSimple
                            aria-label={t('labels.state') as string}
                            label={t('labels.state') as string}
                            message={currentErrors?.state}
                            onChange={(value) => {
                                setCurrentErrors((prevState: any) => {
                                    const { state, ...errors } =
                                        prevState ?? {};
                                    return errors;
                                });
                                setAddress((prevState: any) => ({
                                    ...prevState,
                                    state: value as State,
                                }));
                            }}
                            options={stateOptions}
                            size={FieldSize.Small}
                            value={address?.state}
                            variant={
                                isReadOnly
                                    ? FieldVariant.Inactive
                                    : currentErrors?.state
                                    ? FieldVariant.Error
                                    : FieldVariant.Default
                            }
                            disabled={isReadOnly}
                        />
                    </div>
                    <div className="basis-1/4">
                        <Field
                            aria-label={t('labels.zip') as string}
                            formatOptions={{ format: '#####' }}
                            label={t('labels.zip') as string}
                            message={currentErrors?.zipCode}
                            onChange={(event) => {
                                setCurrentErrors((prevState: any) => {
                                    const { zipCode, ...errors } =
                                        prevState ?? {};
                                    return errors;
                                });
                                setAddress((prevState: any) => ({
                                    ...prevState,
                                    zipCode: event.target.value,
                                }));
                            }}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={address.zipCode ?? ''}
                            maxLength={5}
                            variant={
                                isReadOnly
                                    ? FieldVariant.Inactive
                                    : currentErrors?.zipCode
                                    ? FieldVariant.Error
                                    : FieldVariant.Default
                            }
                        />
                    </div>
                    <div className="basis-1/4">
                        <Field
                            aria-label={t('labels.zipPlusFour') as string}
                            formatOptions={{ format: '####' }}
                            label={t('labels.zipPlusFour') as string}
                            onChange={(event) => {
                                setAddress((prevState: any) => ({
                                    ...prevState,
                                    zipCodeExtension: event.target.value,
                                }));
                            }}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={address.zipCodeExtension ?? ''}
                            maxLength={4}
                            variant={
                                isReadOnly
                                    ? FieldVariant.Inactive
                                    : FieldVariant.Default
                            }
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
