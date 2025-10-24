import {
    Button,
    ButtonGroup,
    FieldData,
    FieldSize,
    FieldTypes,
    Label,
    Select,
} from '@zinnia/bloom/components';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { getStateCodesForSelectInput } from '@deps/helpers/states.helpers';

import styles from './results-form.module.css';
import { useQuickQuoteResultsForm } from './use-results-form-context';

export const QuickQuoteResultsPageForm = () => {
    const {
        register,
        control,
        formState: { errors, isValid },
    } = useQuickQuoteResultsForm();
    const { t } = useTranslation(TranslationFiles.COMMON, {});

    const usStateSelectList = getStateCodesForSelectInput();
    const sexAtBirthButtonItems = [
        {
            id: 'male',
            value: 'M',
            children: <span>{t('clientCase.quickQuoteForm.maleButton')}</span>,
        },
        {
            id: 'female',
            value: 'F',
            children: (
                <span>{t('clientCase.quickQuoteForm.femaleButton')}</span>
            ),
        },
    ];
    const nicotineButtonItems = [
        {
            id: 'nicotineYes',
            value: 'true',
            children: <span>{t('clientCase.quickQuoteForm.nicotineYes')}</span>,
        },
        {
            id: 'nicotineNo',
            value: 'false',
            children: <span>{t('clientCase.quickQuoteForm.nicotineNo')}</span>,
        },
    ];

    return (
        <div className={styles.quickQuoteFormContainer}>
            <div className={styles.ageInput}>
                <FieldData
                    id="insuredAge"
                    label={<Label>Age</Label>}
                    fieldType={FieldTypes.Number}
                    fieldSize={FieldSize.Small}
                    {...register('insuredAge', {
                        required: t(
                            'clientCase.quickQuoteForm.ageRequired'
                        ) as string,
                        valueAsNumber: true,
                        min: {
                            value: 1,
                            message: t(
                                'clientCase.quickQuoteForm.mustBePositive'
                            ),
                        },
                    })}
                />
                {errors.insuredAge && (
                    <p className={styles.errorMsg}>
                        {errors.insuredAge.message}
                    </p>
                )}
            </div>
            <div className={styles.buttonGroup}>
                <Controller
                    control={control}
                    name="sexAtBirth"
                    rules={{
                        required: t(
                            'clientCase.quickQuoteForm.selectAnOption'
                        ) as string,
                    }}
                    render={({ field }) => (
                        <ButtonGroup
                            id="sexAtBirth"
                            items={sexAtBirthButtonItems}
                            defaultValue={field.value}
                            onClick={(v) => field.onChange(v)}
                            label={
                                <Label labelFor="sexAtBirth">
                                    {t('clientCase.quickQuoteForm.sexAtBirth')}
                                </Label>
                            }
                        />
                    )}
                />
                {errors.sexAtBirth && (
                    <p className={styles.errorMsg}>
                        {errors.sexAtBirth.message}
                    </p>
                )}
            </div>
            <div className={styles.buttonGroup}>
                <Controller
                    control={control}
                    name="nicotineUser"
                    render={({ field }) => (
                        <ButtonGroup
                            id="nicotineUser"
                            items={nicotineButtonItems}
                            defaultValue={`${field.value}`}
                            onClick={(v) => field.onChange(v === 'true')}
                            label={
                                <Label labelFor="nicotineUse">
                                    {t('clientCase.quickQuoteForm.nicotineUse')}
                                </Label>
                            }
                        />
                    )}
                />
                {errors.nicotineUser && (
                    <p className={styles.errorMsg}>
                        {errors.nicotineUser.message}
                    </p>
                )}
            </div>
            <div className={styles.stateInput}>
                <Controller
                    control={control}
                    name="state"
                    render={({ field }) => (
                        <Select
                            id="state"
                            options={usStateSelectList}
                            fieldSize={FieldSize.Small}
                            defaultValue={field.value}
                            onValueChange={(v) => {
                                field.onChange(v);
                            }}
                            label={
                                <Label>
                                    {t(
                                        'clientCase.createClientCaseForm.stateLabel'
                                    )}
                                </Label>
                            }
                        />
                    )}
                />
            </div>
            <div className={styles.faceAmountInput}>
                <FieldData
                    id="faceAmount"
                    label={
                        <Label>
                            {t('clientCase.quickQuoteForm.faceAmount')}
                        </Label>
                    }
                    fieldSize={FieldSize.Small}
                    fieldType={FieldTypes.Value}
                    {...register('faceAmount')}
                />
            </div>
            <Button
                size="small"
                className={styles.updateQuoteButton}
                type="submit"
                disabled={!isValid}
            >
                <span className="button-sm">Update quote</span>
            </Button>
        </div>
    );
};
