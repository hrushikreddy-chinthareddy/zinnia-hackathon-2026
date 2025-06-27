import { Label } from '@zinnia/bloom/components';
import { TFunction } from 'i18next';

import { FieldDate } from '@deps/components/field/date/FieldDate';
import { TranslationFiles } from '@deps/config/translations';

import { UpdatedBeneficiaryRecord } from './claims.type';
import styles from '../../../../../components/dynamic-form/components/text-field/text-field.module.css';
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
                <Label labelFor="sourceOfInfo">{t('sourceOfInfo')}</Label>
                <input
                    type="text"
                    id="sourceOfInfo"
                    placeholder={t('sourceOfInfo') ?? 'Source of Information'}
                    className={`${styles.textField} w-full`}
                    value={beneficiary.beneDeathSourceOfInfo || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setBeneficiary({
                            ...beneficiary,
                            beneDeathSourceOfInfo: e.target.value,
                        });
                    }}
                />
            </div>
        </>
    );
}

export default BeneficiaryDeceased;
