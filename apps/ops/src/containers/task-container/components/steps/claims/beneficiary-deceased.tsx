import { Label } from '@zinnia/bloom/components';
import { TFunction } from 'i18next';

import TextField from '@deps/components/dynamic-form/components/text-field/text-field';
import { FieldDate } from '@deps/components/field/date/FieldDate';
import { TranslationFiles } from '@deps/config/translations';

import { UpdatedBeneficiaryRecord } from './claims.type';

interface BeneficiaryDeceasedProps {
    beneficiary: UpdatedBeneficiaryRecord;
    setBeneficiary: React.Dispatch<
        React.SetStateAction<UpdatedBeneficiaryRecord>
    >;
    t: TFunction<TranslationFiles.COMMON, { keyPrefix: string }>;
}
function BeneficiaryDeceased({
    beneficiary,
    setBeneficiary,
    t,
}: BeneficiaryDeceasedProps) {
    return (
        <>
            <div className="col-span-1 mt-4">
                <FieldDate
                    disableAfterDate={new Date()}
                    label={
                        <Label labelFor="dateOfDeath">{t('dateOfDeath')}</Label>
                    }
                    name="dateOfDeath"
                    value={beneficiary.beneDeathDate || undefined}
                    onDateSelect={(val: Date | undefined) => {
                        setBeneficiary({
                            ...beneficiary,
                            beneDeathDate: val?.toLocaleDateString() || null,
                        });
                    }}
                />
            </div>

            <div className="col-span-1 mt-4">
                <TextField
                    label={t('sourceOfInfo') as string}
                    id="sourceOfInfo"
                    onChange={(value: string) => {
                        setBeneficiary({
                            ...beneficiary,
                            beneDeathSourceOfInfo: value,
                        });
                    }}
                    value={beneficiary.beneDeathSourceOfInfo || ''}
                    className="w-full"
                />
            </div>
        </>
    );
}

export default BeneficiaryDeceased;
