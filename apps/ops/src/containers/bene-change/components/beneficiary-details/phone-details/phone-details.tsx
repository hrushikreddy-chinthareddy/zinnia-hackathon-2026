import { countries } from 'countries-list';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import FieldSelect from '@deps/components/fields/field-select/field-select';
import SelectSimple from '@deps/components/select/select';
import { TranslationFiles } from '@deps/config/translations';
import { countryOptions, frequentCountryOptions } from '@deps/containers/people-data-cards/phone-card/side-sheet/side-sheet-phone.helpers';

import { EnterprisePhone, formatPhoneNumber, getPhoneTypeOptions, INITIAL_PHONE } from './phone-details.helpers';

export interface PhoneDetailsProps {
    setCurrentPhones: Dispatch<SetStateAction<EnterprisePhone[]>>;
    updatePhone?: EnterprisePhone;
    index: number;
    isReadOnly?: boolean;
}

export default function PhoneDetails({ index, updatePhone, setCurrentPhones, isReadOnly }: PhoneDetailsProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'beneChange.beneDetails.phone' });
    const [phone, setPhone] = useState<EnterprisePhone>(updatePhone ?? INITIAL_PHONE);
    const [country, setCountry] = useState('US' as keyof typeof countries);
    const phoneTypeOptions = getPhoneTypeOptions({ t });

    useEffect(() => {
        setCurrentPhones(prevState => {
            prevState.splice(index, 1, { ...prevState[index], ...phone });
            return prevState;
        });
    }, [phone, index, setCurrentPhones]);

    return (
        <div>
            <div className="mb-3 grid w-full grid-cols-4">
                <SelectSimple
                    aria-label={t('labels.phoneType') as string}
                    label={t('labels.phoneType') as string}
                    onChange={value => {
                        setPhone((prevState: any) => ({ ...prevState, phoneType: value }));
                    }}
                    options={phoneTypeOptions}
                    size={FieldSize.Small}
                    value={phone?.phoneType}
                    variant={isReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
                    disabled={isReadOnly}
                />
            </div>
            <div className="mb-3 grid w-full grid-cols-6">
                <FieldSelect
                    aria-label={t('labels.number') as string}
                    className="w-[300px]"
                    dropdownValue={countries[country].phone}
                    formatOptions={{ format: '(###) ###-####' }}
                    frequentOptions={frequentCountryOptions}
                    label={t('labels.number') as string}
                    leading={countries[country].emoji}
                    onChange={event => {
                        setPhone(prevState => ({
                            ...prevState,
                            areaCode: event.target.value.substring(0, 3),
                            dialNumber: event.target.value.substring(3, 10),
                        }));
                    }}
                    onDropdownChange={value => {
                        setCountry(value as keyof typeof countries);
                        setPhone(prevState => ({ ...prevState, countryCode: countries[value as keyof typeof countries].phone }));
                    }}
                    options={countryOptions}
                    prefix={`+${countries[country].phone}`}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={formatPhoneNumber(phone)}
                    variant={isReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
                    disabled={isReadOnly}
                />
            </div>
        </div>
    );
}
