import { Transition } from '@headlessui/react';
import { Phone, PhoneType } from '@zinnia/api-types/types/sor';
import { countries } from 'countries-list';
import { useTranslation } from 'next-i18next';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldSelect from '@deps/components/fields/field-select/field-select';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import {
    countryOptions,
    frequentCountryOptions,
} from '@deps/containers/people-data-cards/phone-card/side-sheet/side-sheet-phone.helpers';
import { formatPhoneNumberRaw } from '@deps/helpers/phone.helpers';

import { useAddressChange } from '../../address-change-provider';

interface PhoneNumberProps {
    country: keyof typeof countries;
    phone: Phone;
    setCountry: (value: keyof typeof countries) => void;
    setPhone: (value: any) => void;
    title?: boolean;
    label?: string;
}

const PhoneNumber = ({
    country,
    phone,
    setCountry,
    setPhone,
    title = true,
    label,
}: PhoneNumberProps) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'addressChange.contactDetails.phoneNumber',
    });
    const { formErrors } = useAddressChange();

    return (
        <>
            {title && (
                <div className="flex flex-col">
                    <Typography variant={TypographyVariant.LabelLg}>
                        {t('title')}
                    </Typography>
                </div>
            )}
            <FieldSelect
                aria-label={t('fieldLabels.number') as string}
                className="w-[300px]"
                dropdownValue={countries[country].phone}
                formatOptions={{ format: '(###) ###-####' }}
                frequentOptions={frequentCountryOptions}
                label={label ?? (t('fieldLabels.number') as string)}
                leading={countries[country].emoji}
                onChange={(event) => {
                    setPhone((prevState: any) => ({
                        ...prevState,
                        areaCode: event.target.value.substring(0, 3),
                        dialNumber: event.target.value.substring(3, 10),
                    }));
                }}
                onDropdownChange={(value) => {
                    setCountry(value as keyof typeof countries);
                    setPhone((prevState: any) => ({
                        ...prevState,
                        countryCode:
                            countries[value as keyof typeof countries].phone,
                    }));
                }}
                options={countryOptions}
                prefix={`+${countries[country].phone}`}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                value={formatPhoneNumberRaw(phone)}
                variant={
                    formErrors?.phoneNumber
                        ? FieldVariant.Error
                        : FieldVariant.Default
                }
                message={formErrors?.phoneNumber}
            />
            <Transition
                as="div"
                className="w-full"
                enter="transition-all ease-in duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-all ease-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                show={phone.phoneType === PhoneType.BUSINESS}
            >
                <Field
                    aria-label={t('fieldLabels.extension') as string}
                    className="w-[120px]"
                    formatOptions={{ format: '####' }}
                    label={t('fieldLabels.extension') as string}
                    onChange={(event) =>
                        setPhone((prevState: any) => ({
                            ...prevState,
                            extension: event.target.value,
                        }))
                    }
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={phone.extension}
                    variant={FieldVariant.Default}
                />
            </Transition>
        </>
    );
};

export default PhoneNumber;
