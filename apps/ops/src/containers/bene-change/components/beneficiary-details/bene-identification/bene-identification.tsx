import { PartyType } from '@zinnia/api-types/types/sor';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldDateSelect, {
    DATE_PICKER_FORMAT,
} from '@deps/components/fields/field-date-select/field-date-select';
import Radio, { RadioVariant } from '@deps/components/radio/radio';
import SelectSimple from '@deps/components/select/select';
import { TranslationFiles } from '@deps/config/translations';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import {
    Errors,
    formatPrefix,
    genderOption,
    prefixOption,
    suffixOptions,
    trustOption,
    TrustType,
} from './bene-identification.helpers';
import PartyTypes from './party-type';

const DEFAULT_PARTY_INSTANCE = {
    partyType: PartyType.INDIVIDUAL,
    firstName: '',
    middleName: null,
    lastName: '',
    fullName: '',
    prefix: null,
    suffix: null,
    gender: '',
    ssn: '',
    dateOfBirth: null,
    trustType: TrustType.Individual,
};

export interface BeneficiaryIdentificationProps {
    setCurrentParty: Dispatch<SetStateAction<any>>;
    updateParty?: any;
    isReadOnly?: boolean;
    existingBene?: boolean;
}

const BeneficiaryIdentification = ({
    setCurrentParty,
    updateParty,
    isReadOnly,
    existingBene = false,
}: BeneficiaryIdentificationProps) => {
    const containerClasses = clsx(
        'flex flex-col',
        'w-full  ',
        'rounded border-2 border-gray-100',
        'my-3 bg-gray-50'
    );
    const sectionClasses = 'flex flex-col p-4 md:p-6 lg:p-8';

    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'beneChange.beneDetails.identification',
    });

    const [partyIdentification, setPartyIdentification] = useState<PartyType>(
        updateParty?.partyType || PartyType.INDIVIDUAL
    );
    const [party, setParty] = useState<any>(
        updateParty ?? DEFAULT_PARTY_INSTANCE
    );
    const [currentErrors, setCurrentErrors] = useState<Errors>();

    useEffect(() => {
        if (
            partyIdentification === PartyType.TRUST ||
            partyIdentification === PartyType.ORGANIZATION
        ) {
            setParty((prevState: any) => ({
                ...prevState,
                partyType: partyIdentification,
            }));
        } else if (partyIdentification === PartyType.INDIVIDUAL) {
            setParty((prevState: any) => ({
                ...prevState,
                partyType: partyIdentification,
                lastName: updateParty ? updateParty.lastName : '',
            }));
        } else {
            setParty((prevState: any) => ({
                ...prevState,
                partyType: partyIdentification,
            }));
        }
    }, [partyIdentification]);

    const dob =
        party?.dateOfBirth &&
        dayjs(party?.dateOfBirth, ZAHARA_API_DATE_FORMAT).isValid()
            ? dayjs(party?.dateOfBirth, ZAHARA_API_DATE_FORMAT).format(
                  DATE_PICKER_FORMAT
              )
            : '';
    const [dateOfBirth, setDateOfBirth] = useState(dob);

    useEffect(() => {
        setCurrentParty((prevState: any) => ({ ...prevState, ...party }));
        if (
            partyIdentification === PartyType.INDIVIDUAL &&
            !party?.firstName?.trim()
        ) {
            setCurrentErrors((prevState: any) => ({
                ...prevState,
                firstName: t('formValidations.firstName'),
            }));
        }
        if (
            (partyIdentification === PartyType.TRUST ||
                partyIdentification === PartyType.ORGANIZATION) &&
            !party.lastName
        ) {
            setCurrentErrors((prevState: any) => ({
                ...prevState,
                lastName: t('formValidations.lastName'),
            }));
        }
    }, [party, setCurrentParty, partyIdentification, t]);

    useEffect(() => {
        const dob = dateOfBirth
            ? dayjs(dateOfBirth, DATE_PICKER_FORMAT).format(
                  ZAHARA_API_DATE_FORMAT
              )
            : null;
        setParty((prevState: any) => ({ ...prevState, dateOfBirth: dob }));
    }, [dateOfBirth]);

    const getVariant = (key: string) => {
        return isReadOnly
            ? FieldVariant.Inactive
            : !party?.[key]?.trim()
            ? FieldVariant.Error
            : FieldVariant.Default;
    };

    return (
        <div>
            <div className={containerClasses}>
                <div className={sectionClasses}>
                    <PartyTypes
                        partyIdentification={partyIdentification}
                        onPartyChange={setPartyIdentification}
                        isReadOnly={isReadOnly || existingBene}
                    />
                </div>
            </div>
            <div className={containerClasses}>
                <div className={sectionClasses}>
                    {partyIdentification === PartyType.INDIVIDUAL && (
                        <div className="my-4 grid w-full grid-cols-5 gap-4">
                            <SelectSimple
                                label={t('prefix') as string}
                                options={prefixOption(t)}
                                onChange={(value) =>
                                    setParty((prevState: any) => ({
                                        ...prevState,
                                        prefix: value,
                                    }))
                                }
                                size={FieldSize.Small}
                                value={formatPrefix(party?.prefix) || ''}
                                variant={FieldVariant.Default}
                                disabled={isReadOnly}
                            />
                            <Field
                                label={t('firstName') as string}
                                message={currentErrors?.firstName}
                                onChange={(event) => {
                                    setCurrentErrors((prevState: any) => {
                                        const { firstName, ...errors } =
                                            prevState ?? {};
                                        return errors;
                                    });
                                    setParty((prevState: any) => ({
                                        ...prevState,
                                        firstName: event.target.value,
                                    }));
                                }}
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                                value={party?.firstName || ''}
                                maxLength={15}
                                variant={getVariant('firstName')}
                                required
                            />
                            <Field
                                label={t(`middleName`) as string}
                                onChange={(event) => {
                                    setParty((prevState: any) => ({
                                        ...prevState,
                                        middleName: event.target.value,
                                    }));
                                }}
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                                value={party?.middleName || ''}
                                maxLength={15}
                                variant={
                                    isReadOnly
                                        ? FieldVariant.Inactive
                                        : FieldVariant.Default
                                }
                            />
                            <Field
                                label={t(`lastName`) as string}
                                onChange={(event) => {
                                    setParty((prevState: any) => ({
                                        ...prevState,
                                        lastName: event.target.value,
                                    }));
                                }}
                                message={
                                    !isReadOnly && !party?.lastName?.trim()
                                        ? t('formValidations.last')
                                        : ''
                                }
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                                value={party?.lastName || ''}
                                maxLength={40}
                                variant={getVariant('lastName')}
                                required={true}
                            />
                            <SelectSimple
                                label={t('suffix') as string}
                                options={suffixOptions(t)}
                                onChange={(value) =>
                                    setParty((prevState: any) => ({
                                        ...prevState,
                                        suffix: value,
                                    }))
                                }
                                size={FieldSize.Small}
                                value={party?.suffix || ''}
                                variant={
                                    isReadOnly
                                        ? FieldVariant.Inactive
                                        : FieldVariant.Default
                                }
                                disabled={isReadOnly}
                            />
                        </div>
                    )}
                    {partyIdentification === PartyType.TRUST && (
                        <div className="my-4 grid w-full grid-cols-2">
                            <div className="flex flex-col gap-4">
                                <Field
                                    label={t(`trustName`) as string}
                                    message={currentErrors?.lastName}
                                    onChange={(event) => {
                                        setCurrentErrors((prevState: any) => {
                                            const { lastName, ...errors } =
                                                prevState ?? {};
                                            return errors;
                                        });
                                        setParty((prevState: any) => ({
                                            ...prevState,
                                            lastName: event.target.value,
                                        }));
                                    }}
                                    size={FieldSize.Small}
                                    type={FieldType.BaseActive}
                                    value={party?.lastName || ''}
                                    maxLength={40}
                                    variant={
                                        isReadOnly
                                            ? FieldVariant.Inactive
                                            : currentErrors?.lastName
                                            ? FieldVariant.Error
                                            : FieldVariant.Default
                                    }
                                    required
                                />
                                <SelectSimple
                                    label={t('trustType') as string}
                                    options={trustOption(t)}
                                    onChange={(value) =>
                                        setParty((prevState: any) => ({
                                            ...prevState,
                                            trustType: value,
                                        }))
                                    }
                                    size={FieldSize.Small}
                                    value={
                                        party.trustType ?? TrustType.Individual
                                    }
                                    variant={FieldVariant.Default}
                                    disabled={isReadOnly}
                                />
                            </div>
                        </div>
                    )}

                    {partyIdentification === PartyType.ORGANIZATION && (
                        <div className="my-4 grid w-full grid-cols-2">
                            <Field
                                label={t(`companyName`) as string}
                                message={currentErrors?.lastName}
                                onChange={(event) => {
                                    setCurrentErrors((prevState: any) => {
                                        const { lastName, ...errors } =
                                            prevState ?? {};
                                        return errors;
                                    });
                                    setParty((prevState: any) => ({
                                        ...prevState,
                                        lastName: event.target.value,
                                    }));
                                }}
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                                value={party?.lastName || ''}
                                maxLength={40}
                                variant={
                                    isReadOnly
                                        ? FieldVariant.Inactive
                                        : currentErrors?.lastName
                                        ? FieldVariant.Error
                                        : FieldVariant.Default
                                }
                                required
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className={containerClasses}>
                <div className={sectionClasses}>
                    <div className=" grid w-full grid-cols-4 gap-4">
                        <div>
                            <div className="mb-7">
                                <Field
                                    label={t('ssn') as string}
                                    onChange={(event) => {
                                        setParty((prevState: any) => ({
                                            ...prevState,
                                            ssn: event.target.value,
                                        }));
                                    }}
                                    formatOptions={{ format: '#########' }}
                                    size={FieldSize.Small}
                                    type={FieldType.BaseActive}
                                    value={party?.ssn || ''}
                                    maxLength={9}
                                    variant={
                                        isReadOnly
                                            ? FieldVariant.Inactive
                                            : FieldVariant.Default
                                    }
                                />
                            </div>
                            <div className="mb-7">
                                <Radio
                                    label={t('gender') as string}
                                    items={genderOption(t)}
                                    onChange={(event) => {
                                        setParty((prevState: any) => ({
                                            ...prevState,
                                            gender: event.target.value,
                                        }));
                                    }}
                                    disabled={isReadOnly}
                                    value={party?.gender || ''}
                                    variant={
                                        isReadOnly
                                            ? RadioVariant.Inactive
                                            : RadioVariant.Default
                                    }
                                    name={'gender' + Math.random()}
                                />
                            </div>
                            <div className="mb-7">
                                <FieldDateSelect
                                    label={t('dateOfBirth') as string}
                                    id="dateOfBirth"
                                    data-testid="dateOfBirth"
                                    isFutureDateDisabled={false}
                                    onChange={(e) => {
                                        setDateOfBirth(e.target.value);
                                    }}
                                    size={FieldSize.Small}
                                    type={FieldType.BaseActive}
                                    value={dateOfBirth}
                                    maxLength={10}
                                    disabled={isReadOnly}
                                    variant={
                                        isReadOnly
                                            ? FieldVariant.Inactive
                                            : FieldVariant.Default
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BeneficiaryIdentification;
