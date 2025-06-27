import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';
import xss from 'xss';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import {
    Restriction,
    EmergencyOption,
} from '@deps/models/case/withdrawal/case';
const getDescription = (
    restrictions: Restriction<EmergencyOption>[]
): string => {
    const beyondControlRestriction = restrictions.find(
        (restriction) => restriction.text === EmergencyOption.BeyondControl
    );
    return (
        beyondControlRestriction?.selectionOptions?.DistribUnforseenDesc
            ?.text || ''
    );
};

export function Description() {
    const { formRestriction, isFormStateReadOnly, setFormRestriction } =
        useContext(FormDataContext);
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.distributionReason',
    });
    const [description, setDescription] = useState(
        getDescription(formRestriction?.emergency ?? [])
    );

    const isBeyondControlOptionSelected =
        formRestriction.emergency.some(
            (reason) => reason.text === EmergencyOption.BeyondControl
        ) || null;

    useEffect(() => {
        setFormRestriction((ogFormRestriction) => {
            return {
                ...ogFormRestriction,
                emergency: ogFormRestriction?.emergency.map((restriction) => {
                    if (restriction.text === EmergencyOption.BeyondControl) {
                        restriction.selectionOptions.DistribUnforseenDesc = {
                            text: description,
                        };
                    }
                    return restriction;
                }),
            };
        });
    }, [setFormRestriction, description, isBeyondControlOptionSelected]);

    return (
        <>
            {formRestriction?.emergency?.some(
                (emergency) => emergency.text === EmergencyOption.BeyondControl
            ) && (
                <div className="ml-8">
                    <div className="mb-2">
                        <Typography variant={TypographyVariant.Label}>
                            {t('detailedDescription')}
                        </Typography>
                    </div>
                    <div
                        className={`rounded-lg border-2 border-gray-200 [&:has(:focus-visible)]:outline [&:has(:focus-visible)]:outline-2 [&:has(:focus-visible)]:outline-offset-[6px] [&:has(:focus-visible)]:outline-semantic-focus`}
                    >
                        <textarea
                            data-testid="data-testid-detailed-description"
                            className="mt-1 w-full resize-none border-none text-md !outline-none !ring-0"
                            onChange={(e) => {
                                setDescription(xss(e?.target?.value));
                            }}
                            value={description}
                            disabled={isFormStateReadOnly}
                        ></textarea>
                    </div>
                </div>
            )}
        </>
    );
}
