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
import React, { useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';

import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { getStateCodesForSelectInput } from '@deps/helpers/states.helpers';
import { QuickQuoteFormState, QuickQuoteParams } from '@deps/types/quickQuote';

import { buildQuickQuoteParams } from './helpers';
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

interface QuickQuoteFormProps {
    onCancel: () => void;
    onSubmit: (quickQuote: QuickQuoteParams) => Promise<unknown> | void;
}

export const QuickQuoteForm: React.FC<QuickQuoteFormProps> = ({
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
    } = useForm<QuickQuoteFormState>({
        mode: 'onChange',
        defaultValues: {
            sexAtBirth: 'M',
            nicotineUser: false,
            riders: {
                accidentalDeathBenefit: {
                    type: 'WITH_FACE_AMOUNT',
                    enabled: false,
                    faceAmount: undefined,
                },
                childrensTerm: {
                    type: 'WITH_FACE_AMOUNT',
                    enabled: false,
                    faceAmount: undefined,
                },
                waiverOfPremium: {
                    type: 'NO_PARAMS',
                    enabled: false,
                },
            },
            premiumFreeRiders: {
                acceleratedDeathBenefitForTerminalIllness: false,
                acceleratedDeathBenefitForChronicIllness: false,
                charitableGiving: false,
            },
        },
    });

    const accidentalOn = useWatch({
        control,
        name: 'riders.accidentalDeathBenefit.enabled',
    });
    const childrenOn = useWatch({
        control,
        name: 'riders.childrensTerm.enabled',
    });

    useEffect(() => {
        if (!accidentalOn) {
            setValue('riders.accidentalDeathBenefit.faceAmount', undefined, {
                shouldValidate: true,
                shouldDirty: true,
            });
        }
    }, [accidentalOn, setValue]);

    useEffect(() => {
        if (!childrenOn) {
            setValue('riders.childrensTerm.faceAmount', undefined, {
                shouldValidate: true,
                shouldDirty: true,
            });
        }
    }, [childrenOn, setValue]);

    const submit = async (data: QuickQuoteFormState) => {
        const params = buildQuickQuoteParams(data);

        await onSubmit(params);
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
                            name="insuredAge"
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
                                    id="insuredAge"
                                    fieldType={FieldTypes.Number}
                                    className={styles.ageInput}
                                    fieldSize={FieldSize.Small}
                                    {...(errors.insuredAge && {
                                        fieldStatus: FieldStatus.ERROR,
                                        errorMessage: errors.insuredAge.message,
                                    })}
                                    label={
                                        <Label>
                                            {t('clientCase.quickQuoteForm.age')}
                                        </Label>
                                    }
                                    value={field.value ?? ''}
                                    onChange={(e) => {
                                        const next = !e.target.value
                                            ? undefined
                                            : Number(e.target.value);
                                        field.onChange(
                                            Number.isFinite(next)
                                                ? next
                                                : undefined
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
                                defaultValue={String(field.value ?? false)}
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
                            validate: (value) => {
                                return (
                                    (isFinite(value) && value > 0) ||
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
                                onChange={(event) => {
                                    field.onChange(
                                        toNumber(event.target.value)
                                    );
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
                            name="riders.accidentalDeathBenefit.enabled"
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
                            name="riders.accidentalDeathBenefit.faceAmount"
                            rules={{
                                validate: (value) => {
                                    const on = getValues(
                                        'riders.accidentalDeathBenefit.enabled'
                                    );
                                    if (!on) return true;
                                    return (
                                        (value != null &&
                                            isFinite(value) &&
                                            value > 0) ||
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
                                    {...(errors.riders?.accidentalDeathBenefit
                                        ?.faceAmount && {
                                        fieldStatus: FieldStatus.ERROR,
                                        errorMessage:
                                            errors.riders
                                                ?.accidentalDeathBenefit
                                                ?.faceAmount.message,
                                    })}
                                    id="faceAmountAccidentalDeath"
                                    value={field.value ?? ''}
                                    onChange={(val: any) => {
                                        field.onChange(
                                            toNumber(val.target.value)
                                        );
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
                            name="riders.childrensTerm.enabled"
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
                            name="riders.childrensTerm.faceAmount"
                            rules={{
                                validate: (value) => {
                                    const on = getValues(
                                        'riders.childrensTerm.enabled'
                                    );
                                    if (!on) return true;
                                    return (
                                        (value != null &&
                                            isFinite(value) &&
                                            value > 0) ||
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
                                    {...(errors.riders?.childrensTerm
                                        ?.faceAmount && {
                                        fieldStatus: FieldStatus.ERROR,
                                        errorMessage:
                                            errors.riders?.childrensTerm
                                                ?.faceAmount.message,
                                    })}
                                    id="faceAmountChildrensTermInsuranceRider"
                                    value={field.value ?? ''}
                                    onChange={(e) => {
                                        field.onChange(
                                            toNumber(e.target.value)
                                        );
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
                            name="riders.waiverOfPremium.enabled"
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
                            name="premiumFreeRiders.acceleratedDeathBenefitForTerminalIllness"
                            render={({ field }) => (
                                <Checkbox
                                    id="acceleratedDeathBenefitForTerminalIllness"
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
                            name="premiumFreeRiders.acceleratedDeathBenefitForChronicIllness"
                            render={({ field }) => (
                                <Checkbox
                                    id="acceleratedDeathBenefitForChronicIllness"
                                    name={field.name}
                                    isCheckedByDefault={!!field.value}
                                    onClick={(value?: boolean) =>
                                        field.onChange(!!value)
                                    }
                                >
                                    {t(
                                        'clientCase.quickQuoteForm.acceleratedDeathBenefitForChronicIllness'
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
                            name="premiumFreeRiders.charitableGiving"
                            render={({ field }) => (
                                <Checkbox
                                    id="charitableGiving"
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
                    disabled={!isValid || isSubmitting}
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
