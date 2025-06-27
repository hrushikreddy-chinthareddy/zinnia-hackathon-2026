import dayjs from 'dayjs';
import { useContext, useEffect, useState } from 'react';

import {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldDateSelect, {
    DATE_PICKER_FORMAT,
} from '@deps/components/fields/field-date-select/field-date-select';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import {
    Restriction,
    RestrictionOption,
} from '@deps/models/case/withdrawal/case';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

const getSeveranceDate = (
    restrictions: Restriction<RestrictionOption>[]
): string => {
    const sevDate = restrictions.find(
        (val) => val.text === RestrictionOption.Severance
    )?.selectionOptions?.SeveranceDate?.text;

    if (sevDate && dayjs(sevDate, ZAHARA_API_DATE_FORMAT).isValid()) {
        return dayjs(sevDate, ZAHARA_API_DATE_FORMAT).format(
            DATE_PICKER_FORMAT
        );
    }
    return '';
};

export function ReasonDate() {
    const { formRestriction, isFormStateReadOnly, setFormRestriction } =
        useContext(FormDataContext);

    const [severanceDate, setSeveranceDate] = useState(
        getSeveranceDate(formRestriction?.restrictions ?? [])
    );

    const isSeveranceOptionSelected =
        formRestriction.restrictions.some(
            (reason) => reason.text === RestrictionOption.Severance
        ) || null;

    useEffect(() => {
        setFormRestriction((ogFormRestriction) => {
            return {
                ...ogFormRestriction,
                restrictions: ogFormRestriction?.restrictions.map(
                    (restriction) => {
                        if (restriction.text === RestrictionOption.Severance) {
                            restriction.selectionOptions.SeveranceDate = {
                                text: dayjs(
                                    severanceDate,
                                    DATE_PICKER_FORMAT
                                ).format(ZAHARA_API_DATE_FORMAT),
                            };
                        }
                        return restriction;
                    }
                ),
            };
        });
    }, [setFormRestriction, severanceDate, isSeveranceOptionSelected]);

    return (
        <div className={`-mt-4 flex flex-row items-center gap-2`}>
            {formRestriction.restrictions.some(
                (reason) => reason.text === RestrictionOption.Severance
            ) && (
                <FieldDateSelect
                    id="severance-date"
                    isFutureDateDisabled={false}
                    onChange={(e) => {
                        setSeveranceDate(e.target.value);
                    }}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={severanceDate}
                    disabled={isFormStateReadOnly}
                    variant={
                        isFormStateReadOnly
                            ? FieldVariant.Inactive
                            : FieldVariant.Default
                    }
                />
            )}
        </div>
    );
}
