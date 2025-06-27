import clsx from 'clsx';
import xss from 'xss';

import Autocomplete from '@deps/components/autocomplete/autocomplete';
import Field, { FieldSize, FieldType } from '@deps/components/fields/field';
import { selectVarientByConfig } from '@deps/components/otp-withdrawal-form/form-party/form-party';
import { USStates } from '@deps/constants/geography/us-states';

import { AddressDetailsProps } from './address-details.type';

const usStates = Object.keys(USStates).map((key) => ({
    label: key,
    value: USStates[key as keyof typeof USStates],
}));

const zipFormat = { format: '#####' };

const AddressDetails = ({
    userData,
    errors,
    setUserData,
    addressFieldConfig,
    isFormStateReadOnly,
}: AddressDetailsProps) => {
    return (
        <>
            <div className="my-4 max-w-lg">
                <Field
                    disabled={isFormStateReadOnly}
                    label={addressFieldConfig.fields?.streetAddress.fieldLabel}
                    message={errors?.addressLine1}
                    onChange={(e) => {
                        setUserData({
                            ...userData,
                            addressDetails: {
                                ...userData.addressDetails,
                                addressLine1: xss(e.target.value),
                            },
                        });
                    }}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={userData?.addressDetails?.addressLine1 || ''}
                    variant={selectVarientByConfig({
                        value: userData?.addressDetails?.addressLine1,
                        isFormStateReadOnly,
                        error: errors?.addressLine1,
                    })}
                    maxLength={35}
                    required
                    data-testid="addressLine1"
                />
            </div>
            <div className="my-4 max-w-lg">
                <Field
                    label={addressFieldConfig.fields?.streetAddress2.fieldLabel}
                    onChange={(e) => {
                        setUserData({
                            ...userData,
                            addressDetails: {
                                ...userData.addressDetails,
                                addressLine2: xss(e.target.value),
                            },
                        });
                    }}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={userData?.addressDetails?.addressLine2 || ''}
                    maxLength={35}
                    data-testid="addressLine2"
                    variant={selectVarientByConfig({
                        value: userData?.addressDetails?.addressLine2,
                        isFormStateReadOnly,
                        error: errors?.addressLine2,
                    })}
                />
            </div>
            <div className="my-4 max-w-lg">
                <Field
                    label={addressFieldConfig.fields?.streetAddress3.fieldLabel}
                    onChange={(e) => {
                        setUserData({
                            ...userData,
                            addressDetails: {
                                ...userData.addressDetails,
                                addressLine3: xss(e.target.value),
                            },
                        });
                    }}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={userData?.addressDetails?.addressLine3 || ''}
                    data-testid="addressLine3"
                    variant={selectVarientByConfig({
                        value: userData?.addressDetails?.addressLine3,
                        isFormStateReadOnly,
                        error: errors?.addressLine3,
                    })}
                />
            </div>
            <div className={clsx('my-4 grid w-full grid-cols-3 gap-4')}>
                <Field
                    label={addressFieldConfig.fields?.city.fieldLabel}
                    message={errors?.city}
                    onChange={(e) => {
                        setUserData({
                            ...userData,
                            addressDetails: {
                                ...userData.addressDetails,
                                city: xss(e.target.value),
                            },
                        });
                    }}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={userData?.addressDetails?.city || ''}
                    variant={selectVarientByConfig({
                        value: userData?.addressDetails?.city,
                        isFormStateReadOnly,
                        error: errors?.city,
                    })}
                    maxLength={20}
                    className="flex flex-col"
                    data-testid="city"
                    required
                />
                <Autocomplete
                    disabled={isFormStateReadOnly}
                    onChange={(value: string) => {
                        setUserData({
                            ...userData,
                            addressDetails: {
                                ...userData.addressDetails,
                                state: value,
                            },
                        });
                    }}
                    value={userData?.addressDetails?.state || ''}
                    label={addressFieldConfig.fields?.state.fieldLabel}
                    options={usStates}
                    variant={selectVarientByConfig({
                        value: userData?.addressDetails?.state,
                        isFormStateReadOnly,
                        error: errors?.state,
                    })}
                    message={errors?.state}
                    type={FieldType.BaseActive}
                    className="flex flex-col"
                    required
                    data-testid="state"
                />
                <Field
                    label={addressFieldConfig.fields?.zip.fieldLabel}
                    message={errors?.zipCode}
                    onChange={(e) => {
                        setUserData({
                            ...userData,
                            addressDetails: {
                                ...userData.addressDetails,
                                zipCode: xss(e.target.value),
                            },
                        });
                    }}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={userData?.addressDetails?.zipCode || ''}
                    formatOptions={zipFormat}
                    variant={selectVarientByConfig({
                        value: userData?.addressDetails?.zipCode,
                        isFormStateReadOnly,
                        error: errors?.zipCode,
                    })}
                    className="flex flex-col"
                    data-testid="zipCode"
                    required
                />
            </div>
        </>
    );
};

export default AddressDetails;
