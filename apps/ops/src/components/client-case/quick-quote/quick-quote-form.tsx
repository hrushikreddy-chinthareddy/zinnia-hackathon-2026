import {
    Button,
    ButtonGroup,
    Checkbox,
    FieldData,
    FieldSize,
    FieldStatus,
    FieldTypes,
    Label,
    Select,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import React, { ChangeEvent, useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { getStateCodesForSelectInput } from '@deps/helpers/states.helpers';
import { QuickQuoteFormData } from '@deps/types/quickQuote';

import styles from './quick-quote-form.module.css';

const toNumber = (v: unknown) => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string') {
        const norm = v.replace(/[^\d.-]/g, '');
        if (norm.trim() === '') return NaN;
        const n = Number(norm);
        return Number.isFinite(n) ? n : NaN;
    }
    return NaN;
};

interface CreateQuickQuoteFormProps {
    onCancel: () => void;
    onSubmit?: (
        quickQuote: Partial<QuickQuoteFormData>
    ) => Promise<unknown> | void;
}

const CreateQuickQuoteForm: React.FC<CreateQuickQuoteFormProps> = ({
    onCancel,
    onSubmit,
}) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const usStatesSelectList = getStateCodesForSelectInput();

    const {
        control,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors, isSubmitting, isValid },
    } = useForm<QuickQuoteFormData>({
        mode: 'onChange',
        defaultValues: {
            Riders: {
                accidentalDeathBenefitRider: false,
                accidentalDeathBenefitRiderAmount: undefined,
                childrensTermInsuranceRider: false,
                childrensTermInsuranceRiderAmount: undefined,
                waiverOfPremium: false,
                acceleratedDeathBenefitRiderForTerminalIllness: false,
                charitableGivingRider: false,
            },
        },
    });

    const accidentalOn = useWatch({
        control,
        name: 'Riders.accidentalDeathBenefitRider',
    });
    const childrenOn = useWatch({
        control,
        name: 'Riders.childrensTermInsuranceRider',
    });

    useEffect(() => {
        if (!accidentalOn) {
            setValue('Riders.accidentalDeathBenefitRiderAmount', undefined, {
                shouldValidate: true,
                shouldDirty: true,
            });
        }
    }, [accidentalOn, setValue]);

    useEffect(() => {
        if (!childrenOn) {
            setValue('Riders.childrensTermInsuranceRiderAmount', undefined, {
                shouldValidate: true,
                shouldDirty: true,
            });
        }
    }, [childrenOn, setValue]);

    const submit = async (data: QuickQuoteFormData) => {
        await onSubmit?.(data);
    };

    return (
        <form className={styles.formContainer} onSubmit={handleSubmit(submit)}>
            <section className={styles.topSection}>
                <Typography
                    variant={TypographyVariant.H3}
                    className={styles.sectionTitle}
                >
                    {t('clientCase.quickQuoteForm.details')}
                </Typography>

                <Typography
                    variant={TypographyVariant.BodySm}
                    className={styles.sectionSubtitle}
                >
                    {t('clientCase.quickQuoteForm.subtitle')}
                </Typography>
                <div className={styles.inputRow}>
                    <div className={styles.ageInput}>
                        <Controller
                            control={control}
                            name="age"
                            rules={{
                                required: t(
                                    'clientCase.quickQuoteForm.ageRequired'
                                ) as string,
                                validate: (v) =>
                                    (typeof v === 'number' && v > 0) ||
                                    (t(
                                        'clientCase.quickQuoteForm.mustBePositive'
                                    ) as string),
                            }}
                            render={({ field }) => (
                                <FieldData
                                    id="age"
                                    fieldType={FieldTypes.Number}
                                    className={styles.ageInput}
                                    fieldSize={FieldSize.Small}
                                    {...(errors.age && {
                                        fieldStatus: FieldStatus.ERROR,
                                        errorMessage: errors.age.message,
                                    })}
                                    label={
                                        <Label>
                                            {t('clientCase.quickQuoteForm.age')}
                                        </Label>
                                    }
                                    value={field.value ?? ''}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>
                                    ) => {
                                        const next =
                                            e.target.value === ''
                                                ? ''
                                                : Number(e.target.value);
                                        field.onChange(
                                            Number.isFinite(next)
                                                ? next
                                                : e.target.value
                                        );
                                    }}
                                    name={field.name}
                                />
                            )}
                        />
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
                                    items={[
                                        {
                                            children: (
                                                <span>
                                                    {t(
                                                        'clientCase.quickQuoteForm.maleButton'
                                                    )}
                                                </span>
                                            ),
                                            id: 'male',
                                            value: 'M',
                                        },
                                        {
                                            children: (
                                                <span>
                                                    {t(
                                                        'clientCase.quickQuoteForm.femaleButton'
                                                    )}
                                                </span>
                                            ),
                                            id: 'female',
                                            value: 'F',
                                        },
                                    ]}
                                    label={
                                        <Label labelFor="sexAtBirth">
                                            {t(
                                                'clientCase.quickQuoteForm.sexAtBirth'
                                            )}
                                        </Label>
                                    }
                                    defaultValue={field.value ?? 'M'}
                                    onClick={(v) => field.onChange(v)}
                                />
                            )}
                        />
                        {errors.sexAtBirth && (
                            <p className={styles.errorMsg}>
                                {errors.sexAtBirth.message}
                            </p>
                        )}
                    </div>
                </div>
                <div>
                    <Controller
                        control={control}
                        name="nicotineUser"
                        rules={{
                            required: t(
                                'clientCase.quickQuoteForm.selectAnOption'
                            ) as string,
                        }}
                        render={({ field }) => (
                            <ButtonGroup
                                id="nicotineUse"
                                items={[
                                    {
                                        children: (
                                            <span>
                                                {t(
                                                    'clientCase.quickQuoteForm.nicotineYes'
                                                )}
                                            </span>
                                        ),
                                        id: 'nicotineYes',
                                        value: 'true',
                                    },
                                    {
                                        children: (
                                            <span>
                                                {t(
                                                    'clientCase.quickQuoteForm.nicotineNo'
                                                )}
                                            </span>
                                        ),
                                        id: 'nicotineNo',
                                        value: 'false',
                                    },
                                ]}
                                label={
                                    <Label labelFor="nicotineUse">
                                        {t(
                                            'clientCase.quickQuoteForm.nicotineUse'
                                        )}
                                    </Label>
                                }
                                defaultValue={
                                    field.value === undefined
                                        ? 'true'
                                        : String(field.value)
                                }
                                onClick={(v) => field.onChange(v === 'true')}
                            />
                        )}
                    />
                    {errors.nicotineUser && (
                        <p className={styles.errorMsg}>
                            {errors.nicotineUser.message}
                        </p>
                    )}
                </div>
                <div className={styles.clientState}>
                    <Controller
                        control={control}
                        name="state"
                        rules={{
                            required: t(
                                'clientCase.quickQuoteForm.selectAnState'
                            ) as string,
                            validate: (v) =>
                                (v && v.length > 0) ||
                                (t(
                                    'clientCase.quickQuoteForm.selectAnState'
                                ) as string),
                        }}
                        render={({ field }) => (
                            <Select
                                id="state"
                                contentClassName={styles.clientStateOptions}
                                options={usStatesSelectList}
                                defaultValue={field.value ?? ''}
                                onValueChange={(v: string) => field.onChange(v)}
                                {...(errors.state && {
                                    fieldStatus: FieldStatus.ERROR,
                                    errorMessage: errors.state.message,
                                })}
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
                <div className={styles.faceAmount}>
                    <Controller
                        control={control}
                        name="faceAmount"
                        rules={{
                            required: t(
                                'clientCase.quickQuoteForm.provideFaceAmount'
                            ) as string,
                            validate: (raw) => {
                                const n = toNumber(raw as any);
                                return (
                                    (typeof n === 'number' &&
                                        isFinite(n) &&
                                        n > 0) ||
                                    (t(
                                        'clientCase.quickQuoteForm.provideValidAmount'
                                    ) as string)
                                );
                            },
                        }}
                        render={({ field }) => (
                            <FieldData
                                label={
                                    <Label labelFor="faceAmount">
                                        {t(
                                            'clientCase.quickQuoteForm.faceAmount'
                                        )}
                                    </Label>
                                }
                                {...(errors.faceAmount && {
                                    fieldStatus: FieldStatus.ERROR,
                                    errorMessage: errors.faceAmount.message,
                                })}
                                fieldSize={FieldSize.Small}
                                fieldType={FieldTypes.Value}
                                id="faceAmount"
                                value={field.value ?? ''}
                                onChange={(
                                    event: ChangeEvent<HTMLInputElement>
                                ) => {
                                    field.onChange(event.target.value);
                                }}
                                name={field.name}
                            />
                        )}
                    />
                </div>
            </section>
            <section className={styles.bottomSection}>
                <div className={styles.row}>
                    <div className={styles.leftCol}>
                        <Label>{t('clientCase.quickQuoteForm.riders')}</Label>
                    </div>
                    <div className={styles.rightCol}>
                        <Label>
                            {t('clientCase.quickQuoteForm.faceAmount')}
                        </Label>
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.leftCol}>
                        <Controller
                            control={control}
                            name="Riders.accidentalDeathBenefitRider"
                            render={({ field }) => (
                                <Checkbox
                                    id="accidentalDeathBenefitRider"
                                    name={field.name}
                                    isCheckedByDefault={!!field.value}
                                    onClick={(value?: boolean) =>
                                        field.onChange(!!value)
                                    }
                                >
                                    {t(
                                        'clientCase.quickQuoteForm.accidentalDeath'
                                    )}
                                </Checkbox>
                            )}
                        />
                    </div>
                    <div className={styles.rightCol}>
                        <Controller
                            control={control}
                            name="Riders.accidentalDeathBenefitRiderAmount"
                            rules={{
                                validate: (raw) => {
                                    const on = getValues(
                                        'Riders.accidentalDeathBenefitRider'
                                    );
                                    if (!on) return true;
                                    const n = toNumber(raw as any);
                                    return (
                                        (typeof n === 'number' &&
                                            isFinite(n) &&
                                            n > 0) ||
                                        (t(
                                            'clientCase.quickQuoteForm.faceAmountError'
                                        ) as string)
                                    );
                                },
                            }}
                            render={({ field }) => (
                                <FieldData
                                    disabled={!accidentalOn}
                                    className={styles.faceAmount}
                                    fieldSize={FieldSize.Small}
                                    fieldType={FieldTypes.Value}
                                    {...(errors.Riders
                                        ?.accidentalDeathBenefitRiderAmount && {
                                        fieldStatus: FieldStatus.ERROR,
                                        errorMessage:
                                            errors.Riders
                                                ?.accidentalDeathBenefitRiderAmount
                                                .message,
                                    })}
                                    id="faceAmountAccidentalDeath"
                                    value={field.value ?? ''}
                                    onChange={(val: any) => {
                                        const next = val?.target
                                            ? val.target.value
                                            : val;
                                        field.onChange(next);
                                    }}
                                    name={field.name}
                                />
                            )}
                        />
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.leftCol}>
                        <Controller
                            control={control}
                            name="Riders.childrensTermInsuranceRider"
                            render={({ field }) => (
                                <Checkbox
                                    id="childrensTermInsuranceRider"
                                    name={field.name}
                                    isCheckedByDefault={!!field.value}
                                    onClick={(value?: boolean) =>
                                        field.onChange(!!value)
                                    }
                                >
                                    {t(
                                        'clientCase.quickQuoteForm.childrensTerm'
                                    )}
                                </Checkbox>
                            )}
                        />
                    </div>
                    <div className={styles.rightCol}>
                        <Controller
                            control={control}
                            name="Riders.childrensTermInsuranceRiderAmount"
                            rules={{
                                validate: (raw) => {
                                    const on = getValues(
                                        'Riders.childrensTermInsuranceRider'
                                    );
                                    if (!on) return true;
                                    const n = toNumber(raw as any);
                                    return (
                                        (typeof n === 'number' &&
                                            isFinite(n) &&
                                            n > 0) ||
                                        (t(
                                            'clientCase.quickQuoteForm.faceAmountError'
                                        ) as string)
                                    );
                                },
                            }}
                            render={({ field }) => (
                                <FieldData
                                    disabled={!childrenOn}
                                    className={styles.faceAmount}
                                    fieldSize={FieldSize.Small}
                                    fieldType={FieldTypes.Value}
                                    {...(errors.Riders
                                        ?.childrensTermInsuranceRiderAmount && {
                                        fieldStatus: FieldStatus.ERROR,
                                        errorMessage:
                                            errors.Riders
                                                ?.childrensTermInsuranceRiderAmount
                                                .message,
                                    })}
                                    id="faceAmountChildrensTermInsuranceRider"
                                    value={field.value ?? ''}
                                    onChange={(val: any) => {
                                        const next = val?.target
                                            ? val.target.value
                                            : val;
                                        field.onChange(next);
                                    }}
                                    name={field.name}
                                />
                            )}
                        />
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.leftCol}>
                        <Controller
                            control={control}
                            name="Riders.waiverOfPremium"
                            render={({ field }) => (
                                <Checkbox
                                    id="waiverOfPremium"
                                    name={field.name}
                                    isCheckedByDefault={!!field.value}
                                    onClick={(value?: boolean) =>
                                        field.onChange(!!value)
                                    }
                                >
                                    {t(
                                        'clientCase.quickQuoteForm.waiverOfPremium'
                                    )}
                                </Checkbox>
                            )}
                        />
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.leftCol}>
                        <Label>
                            {t('clientCase.quickQuoteForm.premiumfreeRiders')}
                        </Label>
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.leftCol}>
                        <Controller
                            control={control}
                            name="Riders.acceleratedDeathBenefitRiderForTerminalIllness"
                            render={({ field }) => (
                                <Checkbox
                                    id="acceleratedDeathBenefitRiderForTerminalIllness"
                                    name={field.name}
                                    isCheckedByDefault={!!field.value}
                                    onClick={(value?: boolean) =>
                                        field.onChange(!!value)
                                    }
                                >
                                    {t(
                                        'clientCase.quickQuoteForm.acceleratedDeathBenefit'
                                    )}
                                </Checkbox>
                            )}
                        />
                    </div>
                </div>
                <div className={styles.row}>
                    <div className={styles.leftCol}>
                        <Controller
                            control={control}
                            name="Riders.charitableGivingRider"
                            render={({ field }) => (
                                <Checkbox
                                    id="charitableGivingRider"
                                    name={field.name}
                                    isCheckedByDefault={!!field.value}
                                    onClick={(value?: boolean) =>
                                        field.onChange(!!value)
                                    }
                                >
                                    {t(
                                        'clientCase.quickQuoteForm.charitableGiving'
                                    )}
                                </Checkbox>
                            )}
                        />
                    </div>
                </div>
            </section>
            <div className={styles.actionButtons}>
                <Button
                    size="small"
                    type="submit"
                    disabled={isValid || isSubmitting}
                >
                    {t('clientCase.createClientCaseForm.continueButton')}
                </Button>
                <Button
                    mode="link"
                    size="small"
                    type="button"
                    onClick={onCancel}
                >
                    {t('clientCase.createClientCaseForm.cancelButton')}
                </Button>
            </div>
        </form>
    );
};

export default CreateQuickQuoteForm;
