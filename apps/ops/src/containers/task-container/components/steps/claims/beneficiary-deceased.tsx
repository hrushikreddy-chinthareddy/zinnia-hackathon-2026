import { Label } from '@zinnia/bloom/components';
import { TFunction } from 'i18next';

import { FieldDate } from '@deps/components/field/date/FieldDate';
import { TranslationFiles } from '@deps/config/translations';
import { formatDate } from '@deps/utils/dates';

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
        if (date) {
            const formatted = formatDate(date);
            setBeneficiary({
                ...beneficiary,
                beneDeathDate: formatted || null,
            });
        } else {
            setBeneficiary({
                ...beneficiary,
                beneDeathDate: null,
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
