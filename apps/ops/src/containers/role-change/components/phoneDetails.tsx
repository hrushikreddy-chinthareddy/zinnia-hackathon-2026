import { Transition } from '@headlessui/react';
import { countries } from 'countries-list';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldSelect from '@deps/components/fields/field-select/field-select';
import Radio, {
    RadioOrientation,
    RadioVariant,
} from '@deps/components/radio/radio';
import SelectSimple from '@deps/components/select/select';
import { TranslationFiles } from '@deps/config/translations';
import { FormatPatterns, PhoneField } from '@deps/constants/policy';
import {
    countryOptions,
    frequentCountryOptions,
    getBestTimeOptions,
    getPhoneTypeOptions,
    getTimeZoneOptions,
} from '@deps/containers/people-data-cards/phone-card/side-sheet/side-sheet-phone.helpers';
import { ExtendedPhone, useRoleChange } from '@deps/contexts/RoleChangeContext';
import { formatPhoneNumberRaw } from '@deps/helpers/phone.helpers';
import {
    ZAHARA_API_DATE_FORMAT,
    DIAL_NUMBER_MAX_LEN,
} from '@deps/types/constants';
import { Phone, PhoneType } from '@zinnia/api-types/types/sor';

import {
    ANYTIME,
    DEFAULT_COUNTRY_CODE,
    getVariant,
} from '../role-change-helper';

export type PhoneProps = {
    phoneDetails: ExtendedPhone;
    handlePhoneChange: any;
    index: number;
    isReadOnly: boolean;
    isRequired?: boolean;
    onPreferredPhoneChange?: (id: string, checked: boolean) => void;
    disablePreferredPhone?: boolean;
    showPreferredCheckbox?: boolean;
};

function PhoneDetails({
    phoneDetails,
    handlePhoneChange,
    index,
    isReadOnly,
    isRequired = true,
    onPreferredPhoneChange,
    disablePreferredPhone,
    showPreferredCheckbox = false,
}: PhoneProps) {
    const INITIAL_PHONE: Phone = {
        bestTime: ANYTIME,
        countryCode: DEFAULT_COUNTRY_CODE,
        phoneType: PhoneType.MOBILE,
        startDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
        dialNumber: '',
    };

    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'people.sideSheet.phone',
    });
    const { currentErrors } = useRoleChange();
    const { t: defaultT } = useTranslation();

    const [country, setCountry] = useState('US' as keyof typeof countries);

    const bestTimeOptions = getBestTimeOptions({ t: defaultT });
    const phoneTypeOptions = getPhoneTypeOptions({ t: defaultT });
    const timeZoneOptions = getTimeZoneOptions({ t: defaultT });
    const { setCurrentErrors } = useRoleChange();

    const phone = phoneDetails || INITIAL_PHONE;
    const isDelete = phone?.remove == true;
    const disabled = isDelete || isReadOnly;

    const phoneChangeHandler = (key: PhoneField, value: string | boolean) => {
        handlePhoneChange(PhoneField.Phones, index, key, value);
    };

    const handleCombinedPhoneChange = (value: string) => {
        if (setCurrentErrors) {
            setCurrentErrors((prev: any) => {
                const { phoneNumber, ...rest } = prev || {};
                return rest;
            });
        }

        phoneChangeHandler(PhoneField.AreaCode, value.slice(0, 3));
        phoneChangeHandler(PhoneField.DialNumber, value.slice(3, 10));
    };

    const handleCountryDropdownChange = (
        value: string,
        setCountry: any,
        phoneChangeHandler: (field: PhoneField, value: string) => void,
        countries: Record<string, { phone: string }>
    ) => {
        setCountry(value as keyof typeof countries);
        phoneChangeHandler(
            PhoneField.CountryCode,
            countries[value as keyof typeof countries].phone
        );
    };

    const preferredPhoneId = `preferredPhone-${index}`;

    return (
        <div key={`phoneType-${index}`}>
            <div
                className="flex justify-between"
                key={`phoneType-${index}-${phone.phoneType}`}
            >
                <div>
                    <Radio
                        aria-label={t('fieldLabels.type') as string}
                        items={phoneTypeOptions}
                        label={t('fieldLabels.type') as string}
                        onChange={(event) =>
                            phoneChangeHandler(
                                PhoneField.PhoneType,
                                event.target.value as PhoneType
                            )
                        }
                        orientation={RadioOrientation.Horizontal}
                        value={phone.phoneType}
                        name={`phoneType-${index}-${Math.random()}`}
                        disabled={disabled}
                        variant={
                            disabled
                                ? RadioVariant.Inactive
                                : RadioVariant.Default
                        }
                        id={`phoneType-${index}`}
                    />
                    <div className="flex gap-4 mt-4">
                        <FieldSelect
                            aria-label={t('fieldLabels.number') as string}
                            className="w-[300px]"
                            dropdownValue={countries[country].phone}
                            formatOptions={{ format: FormatPatterns.PHONE }}
                            frequentOptions={frequentCountryOptions}
                            label={t('fieldLabels.number') as string}
                            leading={countries[country].emoji}
                            message={
                                !phone?.dialNumber?.trim()?.length ||
                                (phone?.dialNumber?.trim()?.length <
                                    DIAL_NUMBER_MAX_LEN &&
                                    !disabled)
                                    ? currentErrors?.phone
                                    : ''
                            }
                            onChange={(e) =>
                                handleCombinedPhoneChange(e.target.value)
                            }
                            onDropdownChange={(value) =>
                                handleCountryDropdownChange(
                                    value,
                                    setCountry,
                                    phoneChangeHandler,
                                    countries
                                )
                            }
                            options={countryOptions}
                            prefix={`+${countries[country].phone}`}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={formatPhoneNumberRaw(phone as Phone)}
                            variant={getVariant(
                                PhoneField.DialNumber,
                                currentErrors?.phone
                                    ? phone
                                    : {
                                          [PhoneField.DialNumber]:
                                              'placeholder',
                                      },
                                disabled
                            )}
                            disabled={disabled}
                            required={isRequired}
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
                                aria-label={
                                    t('fieldLabels.extension') as string
                                }
                                className="w-[120px]"
                                formatOptions={{
                                    format: FormatPatterns.EXTENSION,
                                }}
                                label={t('fieldLabels.extension') as string}
                                onChange={(event) =>
                                    phoneChangeHandler(
                                        PhoneField.Extension,
                                        event.target.value
                                    )
                                }
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                                value={phone.extension}
                                variant={
                                    disabled
                                        ? FieldVariant.Inactive
                                        : FieldVariant.Default
                                }
                                disabled={disabled}
                            />
                        </Transition>
                    </div>
                    <div className="flex flex-col gap-4 mt-4">
                        <div className="flex gap-6">
                            <SelectSimple
                                aria-label={t('fieldLabels.bestTime') as string}
                                className="!w-1/2"
                                disabled={disabled}
                                label={t('fieldLabels.bestTime') as string}
                                onChange={(value) =>
                                    phoneChangeHandler(
                                        PhoneField.BestTime,
                                        value
                                    )
                                }
                                options={bestTimeOptions}
                                size={FieldSize.Small}
                                value={phone.bestTime}
                                variant={
                                    disabled
                                        ? FieldVariant.Inactive
                                        : FieldVariant.Default
                                }
                            />
                            <SelectSimple
                                aria-label={t('fieldLabels.timeZone') as string}
                                className="!w-1/2"
                                disabled={disabled}
                                label={t('fieldLabels.timeZone') as string}
                                onChange={(value) =>
                                    phoneChangeHandler(
                                        PhoneField.Timezone,
                                        value
                                    )
                                }
                                options={timeZoneOptions}
                                size={FieldSize.Small}
                                value={phone.timezone ?? ''}
                                variant={
                                    disabled
                                        ? FieldVariant.Inactive
                                        : FieldVariant.Default
                                }
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 mt-4">
                        {showPreferredCheckbox && (
                            <CheckboxText
                                id={preferredPhoneId}
                                checked={!!phone.isPreferred}
                                label={t('fieldLabels.preferredPhone')}
                                onChange={(checked) =>
                                    onPreferredPhoneChange?.(
                                        preferredPhoneId,
                                        checked
                                    )
                                }
                                isDisabled={disabled || disablePreferredPhone}
                                readonly={phone.isPreferred ? true : isReadOnly}
                            />
                        )}
                    </div>
                </div>
                <CheckboxText
                    checked={isDelete}
                    label={t('fieldLabels.removePhone')}
                    onChange={(e) => {
                        phoneChangeHandler(PhoneField.Remove, e);
                    }}
                    isDisabled={isReadOnly}
                />
            </div>
        </div>
    );
}

export default PhoneDetails;
