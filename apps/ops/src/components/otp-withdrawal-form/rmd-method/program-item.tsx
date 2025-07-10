import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';

import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import FieldDateSelect, {
    DATE_PICKER_FORMAT,
} from '@deps/components/fields/field-date-select/field-date-select';
import { RMDProgramType } from '@deps/models/case/withdrawal/case';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export interface Program {
    programType: string;
    startDate: string;
    nextDate: string;
    nextProgramDate?: string;
    amount: string;
    frequency: string;
    duration: string;
    status: RMDProgramType;
    allocationId: number;
}
export interface ProgramProps {
    program: Program;
    isFormStateReadOnly: boolean;
    isLC?: boolean;
}
export function Program({
    program,
    isFormStateReadOnly,
    isLC = true,
}: ProgramProps) {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request.rmdMethod',
    });
    const dateLabel = isLC
        ? t('transactions.nextDate')
        : t('transactions.endDate');

    return (
        <div className="readonly pointer-events-none grid grid-cols-auto-4 gap-2">
            <FieldDateSelect
                label={t('startDate') as string}
                id="startDate"
                isFutureDateDisabled={false}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                variant={
                    isFormStateReadOnly
                        ? FieldVariant.Inactive
                        : FieldVariant.Default
                }
                onChange={noop}
                value={
                    program.startDate
                        ? dayjs(
                              program.startDate,
                              ZAHARA_API_DATE_FORMAT
                          ).format(DATE_PICKER_FORMAT)
                        : ''
                }
                disabled={isFormStateReadOnly}
            />

            <FieldDateSelect
                label={dateLabel as string}
                id="nextDate"
                isFutureDateDisabled={false}
                size={FieldSize.Small}
                type={FieldType.BaseActive}
                variant={
                    isFormStateReadOnly
                        ? FieldVariant.Inactive
                        : FieldVariant.Default
                }
                onChange={noop}
                value={
                    program.nextDate
                        ? dayjs(
                              program.nextDate,
                              ZAHARA_API_DATE_FORMAT
                          ).format(DATE_PICKER_FORMAT)
                        : ''
                }
                disabled={isFormStateReadOnly}
            />

            {isLC && (
                <Field
                    label={t(`duration`) as string}
                    value={program.duration}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    variant={
                        isFormStateReadOnly
                            ? FieldVariant.Inactive
                            : FieldVariant.Default
                    }
                    onChange={noop}
                />
            )}

            <Field
                label={t(`amount`) as string}
                value={program.amount}
                size={FieldSize.Small}
                leading={<div>$</div>}
                type={FieldType.BaseActive}
                variant={
                    isFormStateReadOnly
                        ? FieldVariant.Inactive
                        : FieldVariant.Default
                }
                onChange={noop}
            />
        </div>
    );
}
