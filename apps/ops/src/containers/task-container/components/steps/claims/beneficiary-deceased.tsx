import { Label } from '@zinnia/bloom/components';
import { TFunction } from 'i18next';

import { FieldDate } from '@deps/components/field/date/FieldDate';
import { TranslationFiles } from '@deps/config/translations';

import { UpdatedBeneficiaryRecord } from './claims.type';

interface BeneficiaryDeceasedProps {
    beneficiary: UpdatedBeneficiaryRecord;
    setBeneficiary: React.Dispatch<
        React.SetStateAction<UpdatedBeneficiaryRecord>
    >;
    t: TFunction<TranslationFiles.COMMON, { keyPrefix: string }>;
    readOnly?: boolean;
}
function BeneficiaryDeceased({
    beneficiary,
    setBeneficiary,
    t,
    readOnly,
}: BeneficiaryDeceasedProps) {
    const handleDateSelect = (date: Date | undefined) => {
        if (date && date.toString() === 'Invalid Date') {
            setBeneficiary({
                ...beneficiary,
                beneDeathDate: null,
            });
        } else {
            setBeneficiary({
                ...beneficiary,
                beneDeathDate: date?.toLocaleDateString() || null,
            });
        }
    };

    return (
        <div className="col-span-1 mt-4">
            <FieldDate
                isDisabled={readOnly}
                disableAfterDate={new Date()}
                label={<Label labelFor="dateOfDeath">{t('dateOfDeath')}</Label>}
                name="dateOfDeath"
                value={beneficiary.beneDeathDate || undefined}
                onDateSelect={handleDateSelect}
                disabled={readOnly}
            />
        </div>
    );
}

export default BeneficiaryDeceased;
