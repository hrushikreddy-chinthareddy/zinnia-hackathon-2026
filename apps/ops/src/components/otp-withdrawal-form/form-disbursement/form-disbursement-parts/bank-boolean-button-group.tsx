import { useTranslation } from 'next-i18next';
import React from 'react';

import ButtonGrp from '@deps/components/button-group/button-group';
import { deStringifyTrueFalseNull, stringifyTrueFalseNull } from '@deps/helpers/string.helper';
import { DisbursementInformation } from '@deps/models/case/withdrawal/disbursement-types';

const BankBooleanButtonGroup = ({
    fieldLabel,
    fieldName,
    isFormStateReadOnly,
    disbursementInformation,
    classNames,
    onDataChange,
}: DisbursementInformation) => {
    const { t } = useTranslation();
    const stringifyDoesCheckMeetSecurityRequirements = stringifyTrueFalseNull(
        disbursementInformation?.[fieldName] as boolean | null | undefined
    );

    const checkMeetsRequirementsOptions = [
        { label: t('affirmation.yes'), value: stringifyTrueFalseNull(true) },
        { label: t('affirmation.no'), value: stringifyTrueFalseNull(false) },
    ];

    const setDataChange = (val: string) => {
        onDataChange(ogData => ({
            ...ogData,
            [fieldName]: deStringifyTrueFalseNull(val) as boolean,
        }));
    };

    return (
        <div className={classNames}>
            <ButtonGrp
                activeValue={stringifyDoesCheckMeetSecurityRequirements}
                groupLabel={fieldLabel}
                toggle={setDataChange}
                labels={checkMeetsRequirementsOptions}
                disabled={isFormStateReadOnly}
                key={fieldName}
            />
        </div>
    );
};

export default BankBooleanButtonGroup;
