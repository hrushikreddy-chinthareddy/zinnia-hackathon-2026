import { Label } from '@zinnia/bloom/components';
import { TFunction } from 'i18next';

import { FieldDate } from '@deps/components/field/date/FieldDate';
import Field, { FieldVariant } from '@deps/components/fields/field';
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
    return (
        <>
            <div className="col-span-1 mt-4">
                <FieldDate
                    isDisabled={readOnly}
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
                    disabled={readOnly}
                />
            </div>

            <div className="col-span-1 mt-4">
                <Field
                    label={t('sourceOfInfo') as string}
                    id="sourceOfInfo"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setBeneficiary({
                            ...beneficiary,
                            beneDeathSourceOfInfo: e.target.value,
                        });
                    }}
                    value={beneficiary.beneDeathSourceOfInfo || ''}
                    className="w-full h-10 p-2"
                    disabled={readOnly}
                    variant={
                        readOnly ? FieldVariant.Inactive : FieldVariant.Default
                    }
                />
            </div>
        </>
    );
}

export default BeneficiaryDeceased;
