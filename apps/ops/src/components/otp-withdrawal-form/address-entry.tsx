import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import xss from 'xss';

import Field, { FieldSize, FieldType } from '@deps/components/fields/field';
import { getStateCodes } from '@deps/helpers/states.helper';
import { Address, AddressTypes, FormValidationErrors } from '@deps/models/case/withdrawal/case';

import { selectVarientByConfig } from './form-party/form-party';
import Autocomplete from '../autocomplete/autocomplete';

type AddressProps = {
    initialAddress?: Address;
    errors?: FormValidationErrors;
    onDataChange: (value: Address) => void;
    isPayeeAddress?: boolean;
    isFormStateReadOnly?: boolean;
    showAddressLines?: boolean;
    isOL4753?: boolean;
    combinedAddress?: string;
};

export const DEFAULT_ADDRESS = {
    addressLine1: '',
    addressLine2: null,
    addressLine3: null,
    addressLine4: null,
    addressType: 'DEFAULT' as AddressTypes,
    city: null,
    country: null,
    state: '',
    zip: '',
    zipPlusFour: null,
    isAddressChanged: false,
};

const zipFormat = { format: '#####' };
export default function AddressEntry({
    initialAddress = {} as Address,
    errors = {},
    onDataChange,
    isFormStateReadOnly = false,
    isPayeeAddress = false,
    showAddressLines = false,
    isOL4753 = false,
    combinedAddress = '',
}: AddressProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.addressDetails' });

    const [addressLine1, setAddressLine1] = useState(isOL4753 ? combinedAddress : initialAddress.addressLine1 || '');
    const [addressLine2, setAddressLine2] = useState(initialAddress.addressLine2 || '');
    const [addressLine3, setAddressLine3] = useState(initialAddress.addressLine3 || '');
    const [city, setCity] = useState(initialAddress.city || '');
    const [state, setState] = useState(initialAddress.state || '');
    const [zip, setZip] = useState(initialAddress.zip || '');
    const [zipPlusFour, setZipPlusFour] = useState(initialAddress.zipPlusFour || '');
    const stateOptions = getStateCodes().map(state => ({ label: state, value: state }));
    useEffect(() => {
        onDataChange({ ...DEFAULT_ADDRESS, ...initialAddress, addressLine1, addressLine2, addressLine3, city, state, zip, zipPlusFour });
        if (isOL4753) {
            setAddressLine2('');
        }
    }, [addressLine1, addressLine2, addressLine3, city, state, zip, zipPlusFour]);

    return (
        <>
            <div className="max-w-lg">
                <Field
                    label={t(`mailingAddress`) as string}
                    message={errors.addressLine1}
                    onChange={e => setAddressLine1(xss(e.target.value?.toUpperCase?.()))}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={addressLine1}
                    variant={selectVarientByConfig({ value: addressLine1, isFormStateReadOnly, error: errors.addressLine1 })}
                    maxLength={isOL4753 ? 105 : 35}
                    data-testid="mailingAddress"
                />
            </div>
            {((!isOL4753 && initialAddress.addressLine2) || showAddressLines) && (
                <div className="my-4 max-w-lg">
                    <Field
                        label={t(`mailingAddressLine2`) as string}
                        message={errors.addressLine2}
                        onChange={e => setAddressLine2(xss(e.target.value.toUpperCase()))}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        value={addressLine2}
                        variant={selectVarientByConfig({ value: addressLine2, isFormStateReadOnly, error: errors.addressLine2 })}
                        maxLength={35}
                        data-testid="mailingAddressLine2"
                    />
                </div>
            )}
            {(initialAddress.addressLine3 || showAddressLines) && (
                <div className="my-4 max-w-lg">
                    <Field
                        label={t(`mailingAddressLine3`) as string}
                        message={errors.addressLine3}
                        onChange={e => setAddressLine3(xss(e.target.value))}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        value={addressLine3}
                        variant={selectVarientByConfig({ value: addressLine3, isFormStateReadOnly, error: errors.addressLine3 })}
                        maxLength={35}
                        data-testid="mailingAddressLine3"
                    />
                </div>
            )}
            <div className="my-4 flex max-w-lg gap-4 md:flex-row">
                <Field
                    label={t(`city`) as string}
                    message={errors.city}
                    onChange={e => setCity(xss(e.target.value.toUpperCase()))}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={city}
                    variant={selectVarientByConfig({ value: city, isFormStateReadOnly, error: errors.city })}
                    maxLength={20}
                    disabled={isFormStateReadOnly}
                    data-testid="city"
                />

                <Autocomplete
                    className="max-w-[100px]"
                    label={t(`state`) as string}
                    options={stateOptions}
                    onChange={(val: string) => setState(val)}
                    size={FieldSize.Small}
                    value={state || ''}
                    data-testid="state"
                    disabled={isFormStateReadOnly}
                    message={errors.state}
                    placeholder={t(`selectState`) as string}
                    variant={selectVarientByConfig({ value: state, isFormStateReadOnly, error: errors.state })}
                />
                <Field
                    label={t(`zip`) as string}
                    message={errors.zip}
                    onChange={e => setZip(xss(e.target.value))}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={zip}
                    formatOptions={zipFormat}
                    variant={selectVarientByConfig({ value: zip, isFormStateReadOnly, error: errors.zip })}
                    disabled={isFormStateReadOnly}
                    data-testid="zip"
                />
                {isPayeeAddress && (
                    <Field
                        label={t(`zipPlusFour`) as string}
                        message={errors.zipPlusFour}
                        onChange={e => setZipPlusFour(xss(e.target.value))}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        value={zipPlusFour}
                        variant={selectVarientByConfig({ value: zipPlusFour, isFormStateReadOnly, error: errors.zipPlusFour })}
                        maxLength={4}
                        disabled={isFormStateReadOnly}
                        data-testid="zipPlusFour"
                    />
                )}
            </div>
        </>
    );
}
