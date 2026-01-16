import { useTranslation } from 'next-i18next';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldDateSelect from '@deps/components/fields/field-date-select/field-date-select';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import {
    getFormattedDate,
    getFormattedZaharaDate,
} from '@deps/helpers/date.helpers';
import { Party } from '@deps/models/case/withdrawal/case';
import { SSN_FORMAT } from '@deps/types/constants';

interface GuaranteedWithdrawalBenefitsProps {
    glwbDetails: Party;
    setFormParty: React.Dispatch<React.SetStateAction<any>>;
    isFormStateReadOnly: boolean;
}

const GuaranteedWithdrawalBenefits = ({
    glwbDetails,
    setFormParty,
    isFormStateReadOnly,
}: GuaranteedWithdrawalBenefitsProps) => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.sswProgram',
    });
    const formDob = getFormattedDate(
        glwbDetails?.dob?.text,
        'GuaranteedWithdrawalBenefits::input DOB'
    );

    const onDataChange = (key: string, value: string | { text: string }) => {
        setFormParty((parties: Party) => {
            const partyArr = Object.values(structuredClone(parties));
            const updatedParty = partyArr[0]?.map((item: Party) => {
                if (item.partyRoleType !== glwbDetails.partyRoleType)
                    return item;
                return { ...item, [key]: value };
            });
            return { parties: updatedParty };
        });
    };

    return (
        <div className="my-5 w-full ">
            <div>
                <Typography variant={TypographyVariant.H3} className="my-2">
                    {t(glwbDetails.partyRoleType)}
                </Typography>
            </div>
            <div className="grid grid-cols-5 gap-2 my-4">
                <Field
                    label={t(`firstName`) as string}
                    onChange={(e) => onDataChange('firstName', e.target.value)}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={glwbDetails?.firstName}
                    variant={
                        isFormStateReadOnly
                            ? FieldVariant.Inactive
                            : FieldVariant.Default
                    }
                />
                <Field
                    label={t(`middleName`) as string}
                    onChange={(e) => onDataChange('middleName', e.target.value)}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={glwbDetails?.middleName}
                    variant={
                        isFormStateReadOnly
                            ? FieldVariant.Inactive
                            : FieldVariant.Default
                    }
                />
                <Field
                    label={t(`lastName`) as string}
                    onChange={(e) => onDataChange('lastName', e.target.value)}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={glwbDetails?.lastName}
                    variant={
                        isFormStateReadOnly
                            ? FieldVariant.Inactive
                            : FieldVariant.Default
                    }
                />
            </div>
            <div className="grid grid-cols-5 gap-2 my-1">
                <Field
                    className="max-w-lg"
                    formatOptions={SSN_FORMAT}
                    label={t(`ssn`) as string}
                    onChange={(e) => onDataChange('taxId', e.target.value)}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={glwbDetails?.taxId}
                    variant={
                        isFormStateReadOnly
                            ? FieldVariant.Inactive
                            : FieldVariant.Default
                    }
                />

                <FieldDateSelect
                    label={t(`dob`) as string}
                    onChange={(e) =>
                        onDataChange('dob', {
                            text:
                                getFormattedZaharaDate(
                                    e.target.value,
                                    'GuaranteedWithdrawalBenefits::output DOB'
                                ) || '',
                        })
                    }
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={formDob}
                    disabled={isFormStateReadOnly}
                    variant={
                        isFormStateReadOnly
                            ? FieldVariant.Inactive
                            : FieldVariant.Default
                    }
                />
            </div>
        </div>
    );
};

export default GuaranteedWithdrawalBenefits;
