import { Checkbox } from '@zinnia/bloom/components';
import dayjs, { Dayjs } from 'dayjs';
import { useTranslation } from 'next-i18next';
import { ChangeEvent, useEffect, useState } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldDateSelect from '@deps/components/fields/field-date-select/field-date-select';
import Radio from '@deps/components/radio/radio';
import { TranslationFiles } from '@deps/config/translations';
import { convertToChipText } from '@deps/containers/people-sub-page/people-sub-page.helpers';
import {
    stringifyTrueFalseNull,
    toTitleCase,
} from '@deps/helpers/string.helpers';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { NUMERIC_DATE_FORMAT } from '@deps/types/constants';

import { DeceasedParty } from '../../death-claim.types';

interface DeceasedRecordProps {
    owner: DeceasedParty;
    handleDeceased: (data: DeceasedParty, index: number) => void;
    index: number;
    isDisabled: boolean;
    setFormErrors: React.Dispatch<React.SetStateAction<FormValidationErrors>>;
}

export const DeceasedRecord = ({
    owner,
    handleDeceased,
    index,
    isDisabled,
    setFormErrors,
}: DeceasedRecordProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'deathClaims.deceasedDetails',
    });
    const { t: gen } = useTranslation();
    const [currentDeceased, setCurrentDeceased] = useState(owner || {});
    const [dateError, setDateError] = useState<boolean>(false);
    const [dateErrorMsg, setDateErrorMsg] = useState<string>('');

    const sectionOptions = [
        {
            label: t('labels.selectionOptions.yes'),
            value: 'true',
        },
        {
            label: t('labels.selectionOptions.no'),
            value: 'false',
        },
    ];

    useEffect(() => {
        handleDeceased(currentDeceased, index);
    }, [currentDeceased, handleDeceased, index]);

    useEffect(() => {
        if (isDisabled) {
            onPartySelection(false);
        }
    }, [isDisabled]);

    const onPartySelection = (isDeceased: boolean) => {
        if (isDeceased) {
            setCurrentDeceased((prevState) => ({
                ...prevState,
                isDeceased: isDeceased,
            }));
        } else {
            setCurrentDeceased((prevState) => ({
                ...prevState,
                isDeceased: isDeceased,
                dateOfDeath: null,
                isDiedInForeignCountry: null,
            }));
        }
    };

    const onOptionSelection = (value: string) => {
        setCurrentDeceased((prevState) => ({
            ...prevState,
            isDiedInForeignCountry: value === 'true',
        }));
    };

    const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        const numberRegex = /^\d+$/;
        if (!numberRegex.test(e.target.value)) {
            return;
        }
        const errors: FormValidationErrors = {};
        const day = dayjs(e.target.value, NUMERIC_DATE_FORMAT);

        if (day.isValid()) {
            if (isDateAllowed(day)) {
                errors[`deceased_date_${index}`] = '';
                setDateErrorMsg('');
                setCurrentDeceased((prevState) => ({
                    ...prevState,
                    dateOfDeath: e.target.value,
                }));
                setDateError(false);
                setFormErrors((prevState) => ({
                    ...prevState,
                    ...errors,
                }));
            } else {
                errors[`deceased_date_${index}`] = t('formErrors.futureDate');
                setDateErrorMsg(t('formErrors.futureDate') as string);
                setCurrentDeceased((prevState) => ({
                    ...prevState,
                    dateOfDeath: e.target.value,
                }));
                setDateError(true);
                setFormErrors((prevState) => ({
                    ...prevState,
                    ...errors,
                }));
            }
        } else {
            errors[`deceased_date_${index}`] = t('formErrors.invalidDate');
            setDateErrorMsg(t('formErrors.invalidDate') as string);
            setCurrentDeceased((prevState) => ({
                ...prevState,
                dateOfDeath: e.target.value,
            }));
            setDateError(true);
            setFormErrors((prevState) => ({
                ...prevState,
                ...errors,
            }));
        }
    };

    const isDateAllowed = (date: Dayjs) => {
        const currentDate = dayjs();
        return date.isBefore(currentDate) || date.isSame(currentDate);
    };

    const labelTxt = toTitleCase(
        [owner.party.firstName, owner.party.lastName].filter(Boolean).join(' ')
    );
    const roleTxt = convertToChipText(owner.party?.partyRole, gen) ?? '';

    return (
        <div className="my-3">
            <div className="my-2">
                <Checkbox
                    isCheckedByDefault={currentDeceased.isDeceased}
                    onClick={(e) =>
                        onPartySelection(!currentDeceased?.isDeceased)
                    }
                    id={`is-deceased-${owner?.party.partyId}`}
                    isDisabled={isDisabled}
                >
                    <Content
                        contentClassName="min-w-max"
                        variant={ContentVariant.BodySm}
                        details={labelTxt + ' (' + roleTxt + ')'}
                        pii={true}
                    />
                </Checkbox>
            </div>
            {currentDeceased.isDeceased && (
                <>
                    <div className="my-3">
                        <FieldDateSelect
                            isFutureDateDisabled={true}
                            className="max-w-xs"
                            label={t('labels.dateOfDeath') as string}
                            onChange={handleDateChange}
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={currentDeceased?.dateOfDeath ?? ''}
                            name={
                                `date-of-death-${owner?.party.partyId}-` +
                                Math.random()
                            }
                            message={dateError ? dateErrorMsg : ''}
                            variant={
                                dateError
                                    ? FieldVariant.Error
                                    : FieldVariant.Default
                            }
                            isDateAllowed={isDateAllowed}
                        />
                    </div>
                    <div className="my-3">
                        <Radio
                            items={sectionOptions}
                            label={
                                t(
                                    'labels.insuredDiedInForeignCountry'
                                ) as string
                            }
                            aria-label={
                                t(
                                    'labels.insuredDiedInForeignCountry'
                                ) as string
                            }
                            onChange={(event) =>
                                onOptionSelection(event.target.value)
                            }
                            value={stringifyTrueFalseNull(
                                currentDeceased?.isDiedInForeignCountry
                            )}
                            name={
                                `insured-died-in-foreign-country-${owner?.party.partyId}-` +
                                Math.random()
                            }
                        />
                    </div>
                </>
            )}
        </div>
    );
};
