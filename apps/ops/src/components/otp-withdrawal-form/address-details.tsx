import { useTranslation } from 'next-i18next';
import { useState, useEffect } from 'react';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import {
    AddressTypes,
    FormValidationErrors,
    Party,
} from '@deps/models/case/withdrawal/case';

interface AddressDetailsProps {
    errors: FormValidationErrors;
    formData: Party['addresses'];
    onDataChange: (value: Party['addresses']) => void;
}

const DEFAULT_ADDRESS = {
    addressLine1: '',
    addressLine2: null,
    addressLine3: null,
    addressLine4: null,
    addressType: 'DEFAULT',
    city: null,
    country: null,
    state: '',
    zip: '',
    zipPlusFour: null,
};

const AddressDetails = ({
    errors,
    formData,
    onDataChange,
}: AddressDetailsProps) => {
    const { t } = useTranslation();
    const address = formData[0] || DEFAULT_ADDRESS;
    const BASE_TRANSLATION_KEY = 'caseWithdrawal.request.addressDetails.';
    const zipFormat = { format: '#############' };
    const [addressLine1, setAddressLine1] = useState(
        address?.addressLine1 || ''
    );
    const [addressLine2, setAddressLine2] = useState(
        address?.addressLine2 || ''
    );
    const [city, setCity] = useState(address?.city || '');
    const [state, setState] = useState(address?.state || '');
    const [zip, setZip] = useState(address?.zip);

    useEffect(() => {
        const addresses = formData?.length ? formData : [];
        addresses[0] = {
            ...address,
            addressLine1,
            addressLine2,
            city,
            state,
            zip,
            addressType: 'DEFAULT' as AddressTypes,
        };
        onDataChange(addresses);
    }, [addressLine1, addressLine2, city, state, zip]);

    return (
        <CardContainer
            classNames="w-full"
            containerClassNames="border-b-2 border-gray-100"
        >
            <Typography variant={TypographyVariant.H3} className="mb-4">
                {t(`${BASE_TRANSLATION_KEY}title`)}
            </Typography>
            <div className="my-4  flex max-w-lg">
                <Field
                    label={t(`${BASE_TRANSLATION_KEY}mailingAddress`) as string}
                    message={errors.addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={addressLine1}
                    variant={
                        errors.addressLine1
                            ? FieldVariant.Error
                            : FieldVariant.Default
                    }
                />
            </div>
            {address.addressLine2 && (
                <div className="my-4  flex max-w-lg">
                    <Field
                        label={
                            t(
                                `${BASE_TRANSLATION_KEY}mailingAddressLine2`
                            ) as string
                        }
                        message={errors.addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        value={addressLine2}
                        variant={
                            errors.addressLine2
                                ? FieldVariant.Error
                                : FieldVariant.Default
                        }
                    />
                </div>
            )}
            <div className="my-t grid max-w-lg grid-rows-3 gap-8 md:flex md:max-w-none md:flex-row">
                <Field
                    label={t(`${BASE_TRANSLATION_KEY}city`) as string}
                    message={errors.city}
                    onChange={(e) => setCity(e.target.value)}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={city}
                    variant={
                        errors.city ? FieldVariant.Error : FieldVariant.Default
                    }
                />
                <Field
                    label={t(`${BASE_TRANSLATION_KEY}state`) as string}
                    message={errors.state}
                    onChange={(e) => setState(e.target.value)}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={state}
                    variant={
                        errors.state ? FieldVariant.Error : FieldVariant.Default
                    }
                />
                <Field
                    label={t(`${BASE_TRANSLATION_KEY}zip`) as string}
                    message={errors.zip}
                    onChange={(e) => setZip(e.target.value)}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={zip}
                    formatOptions={zipFormat}
                    variant={
                        errors.zip ? FieldVariant.Error : FieldVariant.Default
                    }
                />
            </div>
        </CardContainer>
    );
};

export default AddressDetails;
