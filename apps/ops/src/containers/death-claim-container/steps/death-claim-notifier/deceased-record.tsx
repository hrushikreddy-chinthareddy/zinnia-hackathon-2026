import { Checkbox } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import { FieldSize, FieldType } from '@deps/components/fields/field';
import FieldDateSelect from '@deps/components/fields/field-date-select/field-date-select';
import Radio from '@deps/components/radio/radio';
import { TranslationFiles } from '@deps/config/translations';
import { convertToChipText } from '@deps/containers/people-sub-page/people-sub-page.helpers';
import {
    stringifyTrueFalseNull,
    toTitleCase,
} from '@deps/helpers/string.helpers';

import { DeceasedParty } from '../../death-claim.types';

interface DeceasedRecordProps {
    owner: DeceasedParty;
    handleDeceased: (data: DeceasedParty, index: number) => void;
    index: number;
    isDisabled: boolean;
}

export const DeceasedRecord = ({
    owner,
    handleDeceased,
    index,
    isDisabled,
}: DeceasedRecordProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'deathClaims.deceasedDetails',
    });
    const { t: gen } = useTranslation();
    const [currentDeceased, setCurrentDeceased] = useState(owner || {});

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

    const onDateOfDeathChange = (date: string) => {
        setCurrentDeceased((prevState) => ({
            ...prevState,
            dateOfDeath: date,
        }));
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
                            label={t(`labels.dateOfDeath`) as string}
                            onChange={(e) =>
                                onDateOfDeathChange(e.target.value)
                            }
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={currentDeceased?.dateOfDeath ?? ''}
                            name={
                                `date-of-death-${owner?.party.partyId}-` +
                                Math.random()
                            }
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
