import { Phone } from '@zinnia/api-types/types/sor';
import { countries } from 'countries-list';
import { useTranslation } from 'next-i18next';

import { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import FieldSelect from '@deps/components/fields/field-select/field-select';
import { countryOptions, frequentCountryOptions } from '@deps/containers/people-data-cards/phone-card/side-sheet/side-sheet-phone.helpers';
import { formatPhoneNumberRaw } from '@deps/helpers/phone.helpers';

interface PhoneNumberProps {
    country: keyof typeof countries;
    phone: Phone;
    setCountry: (value: keyof typeof countries) => void;
    setPhone: (value: any) => void;
    formErrors: any;
}

const PhoneNumber = ({ country, phone, setCountry, setPhone, formErrors }: PhoneNumberProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'deathClaims.deathClaimNotification' });

    return (
        <FieldSelect
            aria-label={t('labels.phoneNumber') as string}
            className="w-[300px]"
            dropdownValue={countries[country].phone}
            formatOptions={{ format: '(###) ###-####' }}
            frequentOptions={frequentCountryOptions}
            label={t('labels.phoneNumber') as string}
            leading={countries[country].emoji}
            onChange={event => {
                setPhone((prevState: any) => ({
                    ...prevState,
                    areaCode: event.target.value.substring(0, 3),
                    dialNumber: event.target.value.substring(3, 10),
                }));
            }}
            onDropdownChange={value => {
                setCountry(value as keyof typeof countries);
                setPhone((prevState: any) => ({
                    ...prevState,
                    countryCode: countries[value as keyof typeof countries].phone,
                }));
            }}
            options={countryOptions}
            prefix={`+${countries[country].phone}`}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={formatPhoneNumberRaw(phone)}
            variant={formErrors?.phoneNumber ? FieldVariant.Error : FieldVariant.Default}
            message={formErrors?.phoneNumber}
        />
    );
};

export default PhoneNumber;
