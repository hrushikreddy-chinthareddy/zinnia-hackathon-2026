import dayjs from 'dayjs';
import { TFunction, useTranslation } from 'next-i18next';
import xss from 'xss';

import Field, { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import FieldDateSelect, { DATE_PICKER_FORMAT } from '@deps/components/fields/field-date-select/field-date-select';
import { SSWProgram } from '@deps/components/otp-withdrawal-form/ssw-program/ssw-row';
import SelectSimple from '@deps/components/select/select';
import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { Frequency } from '@deps/models/case/withdrawal/case';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import { UpdatedProgram } from '../../ssw-edit-helper';

const frequencyOptions = (t: TFunction) => [
    {
        label: t('frequencyOptions.none'),
        value: Frequency.None,
    },
    {
        label: t('frequencyOptions.monthly'),
        value: Frequency.Monthly,
    },
    {
        label: t('frequencyOptions.quarterly'),
        value: Frequency.Quarterly,
    },
    {
        label: t('frequencyOptions.semiAnnually'),
        value: Frequency.SemiAnnually,
    },
    {
        label: t('frequencyOptions.annually'),
        value: Frequency.Annually,
    },
];

type AmountProps = {
    updateProgram: UpdatedProgram;
    onProgramUpdate: React.Dispatch<any>;
    isReadOnly: boolean;
};

const Amount = ({ updateProgram, onProgramUpdate, isReadOnly }: AmountProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'sswUpdate.tabs.amount' });
    const formNextDate = updateProgram?.nextDate ? dayjs(updateProgram?.nextDate, ZAHARA_API_DATE_FORMAT).format(DATE_PICKER_FORMAT) : '';
    const { goToNext } = useWorkflow();
    const setSSWData = <Type,>(val: Type, key: string) => {
        onProgramUpdate((fs: SSWProgram) => ({
            ...fs,
            [key]: val || '',
        }));
    };

    const handleNextDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onProgramUpdate((fs: SSWProgram) => ({
            ...fs,
            nextDate: formNextDate ? dayjs(e.target.value, DATE_PICKER_FORMAT).format(ZAHARA_API_DATE_FORMAT) : '',
        }));
    };

    return (
        <WorkflowCard
            title={t('tabTitle')}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-10"
                    disableContinue={false}
                    handleContinue={() => goToNext()}
                    parentPage={ParentPage.CreateCase}
                    leaveTransactionLink="/create-case"
                />
            }
        >
            <div className="grid grid-cols-4 gap-4">
                <div>
                    <Field
                        label={t(`programAmount`) as string}
                        onChange={e => {
                            setSSWData(xss(e?.target?.value), 'amount');
                        }}
                        value={updateProgram?.amount || ''}
                        size={FieldSize.Small}
                        leading={<div>$</div>}
                        type={FieldType.BaseActive}
                        variant={isReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
                        data-testid={`amount`}
                        formatOptions={{
                            format: '',
                            type: 'number',
                            decimalPlaces: 2,
                        }}
                        className="my-2"
                    />

                    <SelectSimple
                        disabled={isReadOnly}
                        className="max-w-lg my-2"
                        label={t('programFrequency') as string}
                        options={frequencyOptions(t)}
                        onChange={(val: string) => setSSWData(val as Frequency, 'frequency')}
                        size={FieldSize.Small}
                        value={updateProgram?.frequency}
                        name="frequency"
                        placeholder={t('selectOption') as string}
                    />

                    <Field
                        variant={isReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
                        label={t(`programDuration`) as string}
                        onChange={e => {
                            setSSWData(xss(e?.target?.value), 'duration');
                        }}
                        value={updateProgram?.duration || ''}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        data-testid={`duration`}
                        formatOptions={{
                            format: '',
                            type: 'number',
                            decimalPlaces: 2,
                        }}
                        className="my-2"
                    />

                    <FieldDateSelect
                        variant={isReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
                        label={t('programNextDate') as string}
                        id="nextDate"
                        isFutureDateDisabled={false}
                        onChange={e => handleNextDateChange(e)}
                        size={FieldSize.Small}
                        type={FieldType.BaseActive}
                        value={formNextDate}
                        className="my-2"
                    />
                </div>
            </div>
        </WorkflowCard>
    );
};

export default Amount;
