import { useIsFetching } from '@tanstack/react-query';
import {
    Button,
    ButtonGroup,
    FieldData,
    FieldSize,
    Label,
    Select,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { first, isEqual, omit } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import DateTextInput from '@deps/components/date-text-input/date-text-input';
import { POM_QUERY_PREFIXES } from '@deps/components/illustrations/helpers/hooks/pom';
import { useIllustrationAnalytics } from '@deps/components/illustrations/helpers/hooks/use-illustration-analytics';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { getStateCodesForSelectInput } from '@deps/helpers/states.helpers';
import { formatUTCDate } from '@deps/helpers/string.helpers';
import {
    IllustrationAgentDetails,
    IllustrationsClientCase,
    TransactionType,
} from '@deps/types/illustrations';
import { isValidDate } from '@deps/utils/dates';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import { AgentField } from 'components/client-case/client-case-create/agent-search/agent-field';
import { AgentOption } from 'components/client-case/client-case-create/agent-search/types';

import styles from './create-client-case-form.module.css';
import { useAvailableAgencies } from './use-available-agencies';
import { useDefaultAuthenticatedAgentOption } from './use-default-authenticated-agent-option';

interface CreateClientCaseFormProps {
    onCancel: () => void;
    onSubmit?: (
        clientCaseData: Partial<IllustrationsClientCase>
    ) => Promise<unknown> | void;
    clientCase?: IllustrationsClientCase;
    isEdit: boolean;
}

const clientCaseInitialState: Partial<IllustrationsClientCase> = {
    title: 'Untitled Client Case',
    caseManagementCaseId: '',
    eAppId: '',
    agencyId: '',
    agentDetails: {
        firstName: undefined,
        lastName: undefined,
        sellingCode: undefined,
        email: undefined,
        npn: undefined,
    },
    insuredDetails: {
        firstName: '',
        lastName: '',
        sexAtBirth: 'MALE',
        dateOfBirth: undefined,
        nicotineUser: false,
        state: undefined,
    },
};

function calculateIssueAge(dateOfBirth: Date | null): number {
    if (!dateOfBirth) return 0;

    const today = dayjs();
    return today.diff(dateOfBirth, 'year');
}

const buildAgentOptionFromAgentDetails = (
    agentDetails: IllustrationAgentDetails | undefined
) => {
    if (!agentDetails?.sellingCode) {
        return;
    }

    return {
        firstName: agentDetails?.firstName ?? DEFAULT_ERROR_STRING,
        lastName: agentDetails?.lastName ?? DEFAULT_ERROR_STRING,
        email: agentDetails?.email ?? DEFAULT_ERROR_STRING,
        sellingCodes: agentDetails?.sellingCode
            ? [agentDetails.sellingCode]
            : [],
        // TODO: Use the correct carrier code
        carrierShortName: 'FNWL',
        npn: agentDetails?.npn,
    };
};

const CreateClientCaseForm: React.FC<CreateClientCaseFormProps> = ({
    onSubmit,
    onCancel,
    clientCase,
    isEdit,
}: CreateClientCaseFormProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const { isSuperIllustrator } = usePermissionsContext();
    const {
        sendClientCaseTitleInput,
        sendAgencySelection,
        sendNewClientCaseCreated,
        sendClientCaseEdited,
    } = useIllustrationAnalytics();

    const {
        control,
        setValue,
        getValues,
        register,
        handleSubmit,
        formState: { isValid, isDirty, isSubmitting },
    } = useForm<IllustrationsClientCase>({
        mode: 'onChange',
        defaultValues: clientCase ?? clientCaseInitialState,
    });

    useEffect(() => {
        // Add validations to these fields as they're not part of the form but required to submit
        register('agentDetails.sellingCode', { required: true });
        register('agencyId', { required: true });
    }, [register]);

    const canEditInsuredDetails =
        clientCase?.transactionType !== TransactionType.CONVERSION;

    const firstAgencyKey = 0;

    const agencyId = useWatch({
        control,
        name: 'agencyId',
    });
    const agentDetails = useWatch({
        control,
        name: 'agentDetails',
    });
    const dateOfBirth = useWatch({
        control,
        name: 'insuredDetails.dateOfBirth',
    });

    const currentAge = useMemo(
        () => calculateIssueAge(dateOfBirth ?? null) ?? 0,
        [dateOfBirth]
    );

    const displayNicotineSection = currentAge >= 18;

    const isFetchingAgencies =
        useIsFetching({
            queryKey: POM_QUERY_PREFIXES.GET_HIERARCHY_BY_SELLING_CODE,
        }) +
        useIsFetching({
            queryKey: POM_QUERY_PREFIXES.GET_PRODUCER_BY_ID,
        });

    const defaultAuthenticatedAgentOption =
        useDefaultAuthenticatedAgentOption();

    const getInitialSelectedAgentOption = () => {
        if (isEdit) {
            // for Editting, always use agent details from the client case
            return buildAgentOptionFromAgentDetails(clientCase?.agentDetails);
        }

        // ------------
        // Creation (only works when the data is prefilled, ie. sureify flow)
        // ------------

        if (clientCase?.agentDetails) {
            return buildAgentOptionFromAgentDetails(clientCase.agentDetails);
        }

        // If we get there we don't have prefilled data, and we
        // need to wait for the partyReferenceData and permissions
        // to load
        return;
    };

    const [selectedAgentOption, setSelectedAgentOption] = useState<
        AgentOption | undefined
    >(getInitialSelectedAgentOption());

    const agencyOptions = useAvailableAgencies(selectedAgentOption);
    const usStatesSelectList = getStateCodesForSelectInput();
    const insuredDetailsClassname = clsx(
        styles.formSection,
        styles.insuredDetails
    );

    const selectedAgencyOption = useMemo(
        () =>
            agencyOptions?.find(
                (agencyOption) => agencyOption.value === agencyId
            ),
        [agencyOptions, agencyId]
    );

    // Show the dropdown only after a default value for the agencyId was selected
    const displayAgencyDropdown =
        agencyOptions && selectedAgencyOption && agencyOptions.length > 1;

    const sendAnalytics = () => {
        const title = getValues('title');
        const { title: initialTitle } = clientCase ?? {
            title: clientCaseInitialState.title,
        };
        sendAgencySelection(agencyOptions ?? []);
        sendClientCaseTitleInput(title !== initialTitle);
        if (isEdit) {
            sendClientCaseEdited();
        } else {
            sendNewClientCaseCreated();
        }
    };

    const onSubmitForm = async () => {
        sendAnalytics();

        await onSubmit?.(getValues());
    };

    const onCancelForm = useCallback(() => {
        onCancel?.();
    }, [onCancel]);

    const handleSelectAgentOption = useCallback(
        (agentOption: AgentOption) => {
            if (isEqual(agentOption, selectedAgentOption)) {
                return;
            }
            setSelectedAgentOption(agentOption);

            // Also update the clientCase data
            const newAgentDetails = {
                ...omit(agentOption, ['sellingCodes', 'lookupId']),
                sellingCode: agentOption?.sellingCodes[0],
            };
            const isCurrentAgencyIdValid =
                selectedAgencyOption &&
                agentOption?.sellingCodes?.includes(
                    selectedAgencyOption.agentSellingCode
                );

            if (!isEqual(newAgentDetails, agentDetails)) {
                setValue('agentDetails', newAgentDetails, {
                    shouldDirty: true,
                });
                if (!isCurrentAgencyIdValid)
                    setValue('agencyId', '', { shouldDirty: true });
            }
        },
        [selectedAgencyOption, agentDetails, selectedAgentOption, setValue]
    );

    //
    //  Sync agentDetails after an agency is selected
    //
    useEffect(() => {
        const agentSellingCode = agentDetails?.sellingCode;
        const hasAgencyOptions = !!agencyOptions?.length;

        if (!hasAgencyOptions) {
            // Do nothing if we don't have agency options to select
            return;
        }

        if (!selectedAgencyOption) {
            // Select any of available agencies by default
            const agencyOption = first(agencyOptions)!;
            const { value: agencyId, agentSellingCode } = agencyOption;

            setValue('agencyId', agencyId);
            setValue('agentDetails', {
                ...omit(selectedAgentOption, ['sellingCodes', 'lookupId']),
                sellingCode: agentSellingCode,
            });

            return;
        }

        if (selectedAgencyOption) {
            const selectedAgencyAgentSellingCode =
                selectedAgencyOption?.agentSellingCode;
            if (
                selectedAgencyAgentSellingCode &&
                selectedAgencyAgentSellingCode != agentSellingCode
            ) {
                setValue('agentDetails', {
                    ...omit(selectedAgentOption, ['sellingCodes', 'lookupId']),
                    sellingCode: selectedAgencyOption.agentSellingCode,
                });
            }

            // Do nothing if AgencyId is valid
            return;
        }
    }, [
        agencyOptions,
        selectedAgencyOption,
        selectedAgentOption,
        agencyId,
        agentDetails?.sellingCode,
        isEdit,
        setValue,
    ]);

    // Handle default value of the selected agent
    useEffect(() => {
        if (selectedAgentOption) {
            // Only do something if we don't have an agent selected
            return;
        }

        // for Edit, we already have this available on the first render
        if (isEdit) {
            console.error(
                'Client Case edition form does not have a selected agent'
            );
            return;
        }

        // ------------
        // Creation
        // ------------

        if (isSuperIllustrator) {
            // Do not select the authenticated agent by default if they are a
            // super illustrator
            return;
        }

        // We cannot set a default selected agent if we don't have an alias with a sellingCode
        if (!defaultAuthenticatedAgentOption) {
            return;
        }

        handleSelectAgentOption(defaultAuthenticatedAgentOption);
    }, [
        isEdit,
        selectedAgentOption,
        isSuperIllustrator,
        defaultAuthenticatedAgentOption,
        handleSelectAgentOption,
    ]);

    return (
        <form
            className={styles.formContainer}
            onSubmit={handleSubmit(onSubmitForm)}
        >
            <section className={styles.formSection}>
                <Typography
                    variant={TypographyVariant.H3}
                    className={styles.sectionTitle}
                >
                    {t('clientCase.createClientCaseForm.clientCaseSection')}
                </Typography>
                <Controller
                    control={control}
                    name="title"
                    rules={{
                        required: true,
                        maxLength: 60,
                    }}
                    render={({ field }) => (
                        <FieldData
                            fieldSize={FieldSize.Small}
                            name="title"
                            id="client-case-title"
                            label={
                                <Label>
                                    {t(
                                        'clientCase.createClientCaseForm.titleLabel'
                                    )}
                                </Label>
                            }
                            maxLength={60}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value)}
                        />
                    )}
                />

                <AgentField
                    value={selectedAgentOption}
                    onSelectAgent={handleSelectAgentOption}
                    editable
                />

                {selectedAgentOption &&
                    !agencyOptions?.length &&
                    !agencyId &&
                    !isFetchingAgencies && (
                        <Typography
                            variant={TypographyVariant.BodySm}
                            className={clsx(styles.errorMessage)}
                        >
                            {t(
                                'clientCase.createClientCaseForm.searchAgent.agentHasNoAgencies'
                            )}
                        </Typography>
                    )}

                {displayAgencyDropdown && (
                    <div className={styles.agencySelect}>
                        <Select
                            options={agencyOptions}
                            label={
                                <Label>
                                    {t(
                                        'clientCase.createClientCaseForm.agencyLabel'
                                    )}
                                </Label>
                            }
                            onValueChange={(agencyId: string) => {
                                setValue('agencyId', agencyId, {
                                    shouldDirty: true,
                                });

                                const newSelectedAgencyOption =
                                    agencyOptions.find(
                                        (agencyOption) =>
                                            agencyOption.value === agencyId
                                    );

                                const newAgentSellingcode =
                                    newSelectedAgencyOption?.agentSellingCode;

                                if (newAgentSellingcode) {
                                    setValue(
                                        'agentDetails.sellingCode',
                                        newAgentSellingcode,
                                        { shouldDirty: true }
                                    );
                                }
                            }}
                            defaultValue={
                                isEdit
                                    ? agencyId
                                    : agencyOptions[firstAgencyKey].value
                            }
                        />
                    </div>
                )}
            </section>
            <section className={insuredDetailsClassname}>
                <Typography
                    variant={TypographyVariant.H3}
                    className={styles.sectionTitle}
                >
                    {t('clientCase.createClientCaseForm.insuredDetailsSection')}
                </Typography>
                <Controller
                    control={control}
                    name="insuredDetails.firstName"
                    render={({ field }) => (
                        <FieldData
                            className={styles.inputItem}
                            fieldSize={FieldSize.Small}
                            name="firstName"
                            label={
                                <Label>
                                    {t(
                                        'clientCase.createClientCaseForm.firstNameLabel'
                                    )}
                                </Label>
                            }
                            defaultValue={field.value ?? ''}
                            disabled={!canEditInsuredDetails}
                            onChange={(e) => field.onChange(e.target.value)}
                        />
                    )}
                />
                <Controller
                    control={control}
                    name="insuredDetails.lastName"
                    render={({ field }) => (
                        <FieldData
                            className={styles.inputItem}
                            fieldSize={FieldSize.Small}
                            name="lastName"
                            label={
                                <Label>
                                    {t(
                                        'clientCase.createClientCaseForm.lastNameLabel'
                                    )}
                                </Label>
                            }
                            defaultValue={field.value ?? ''}
                            disabled={!canEditInsuredDetails}
                            onChange={(e) => field.onChange(e.target.value)}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="insuredDetails.sexAtBirth"
                    rules={{
                        required: true,
                    }}
                    render={({ field }) => (
                        <ButtonGroup
                            id="sex-at-birth"
                            className={styles.buttonGroup}
                            items={[
                                {
                                    children: (
                                        <span>
                                            {t(
                                                'clientCase.createClientCaseForm.maleButton'
                                            )}
                                        </span>
                                    ),
                                    id: 'male',
                                    value: 'MALE',
                                },
                                {
                                    children: (
                                        <span>
                                            {t(
                                                'clientCase.createClientCaseForm.femaleButton'
                                            )}
                                        </span>
                                    ),
                                    id: 'female',
                                    value: 'FEMALE',
                                },
                            ]}
                            label={
                                <Label labelFor="sexAtBirth">
                                    {t(
                                        'clientCase.createClientCaseForm.sexAssignedLabel'
                                    )}
                                </Label>
                            }
                            defaultValue={String(field.value)}
                            value={field.value} // Added to force selection on edit
                            onClick={(v) => {
                                field.onChange(v);
                            }}
                            inactive={!canEditInsuredDetails}
                        />
                    )}
                />

                <div className={styles.datePickerContainer}>
                    <div className={styles.datePicker}>
                        <Typography variant={TypographyVariant.FieldLabel}>
                            {t('clientCase.createClientCaseForm.dateLabel')}
                        </Typography>
                        <Controller
                            control={control}
                            name="insuredDetails.dateOfBirth"
                            rules={{
                                validate: (v) => {
                                    const parsedDate = dayjs(v);

                                    const formattedDate = parsedDate.isValid()
                                        ? parsedDate.format('MM/DD/YYYY')
                                        : null;

                                    return isValidDate(formattedDate);
                                },
                            }}
                            render={({ field }) => (
                                <DateTextInput
                                    {...(dateOfBirth && {
                                        defaultDate: formatUTCDate(
                                            new Date(String(dateOfBirth))
                                        ),
                                    })}
                                    errorMessage={t(
                                        'clientCase.createClientCaseForm.dateErrorMessage'
                                    )}
                                    onChange={(v) => {
                                        field.onChange(v);
                                    }}
                                    disabled={!canEditInsuredDetails}
                                />
                            )}
                        />
                    </div>
                    {dateOfBirth !== null && (
                        <div className={styles.ageLabel}>
                            <Typography variant={TypographyVariant.BodySm}>
                                Current age: {currentAge}
                            </Typography>
                        </div>
                    )}
                </div>
                {displayNicotineSection && (
                    <Controller
                        control={control}
                        name="insuredDetails.nicotineUser"
                        render={({ field }) => (
                            <ButtonGroup
                                id="nicotine-user"
                                className={styles.buttonGroup}
                                items={[
                                    {
                                        children: (
                                            <span>
                                                {t(
                                                    'clientCase.createClientCaseForm.nonNicotine'
                                                )}
                                            </span>
                                        ),
                                        id: 'Non-Nicotine',
                                        value: 'Non-Nicotine',
                                    },
                                    {
                                        children: (
                                            <span>
                                                {t(
                                                    'clientCase.createClientCaseForm.nicotine'
                                                )}
                                            </span>
                                        ),
                                        id: 'Nicotine',
                                        value: 'Nicotine',
                                    },
                                ]}
                                label={
                                    <Label labelFor="nicotine-user">
                                        {t(
                                            'clientCase.createClientCaseForm.nicotineUserLabel'
                                        )}
                                    </Label>
                                }
                                defaultValue={
                                    field.value ? 'Nicotine' : 'Non-Nicotine'
                                }
                                inactive={!canEditInsuredDetails}
                                onClick={(v) => {
                                    field.onChange(v === 'Nicotine');
                                }}
                            />
                        )}
                    />
                )}
                <div className={styles.clientState}>
                    <Controller
                        control={control}
                        name="insuredDetails.state"
                        rules={{
                            required: true,
                            validate: (v) => v && v.length > 0,
                        }}
                        render={({ field }) => (
                            <Select
                                contentClassName={styles.clientStateOptions}
                                options={usStatesSelectList}
                                label={
                                    <Label>
                                        {t(
                                            'clientCase.createClientCaseForm.stateLabel'
                                        )}
                                    </Label>
                                }
                                value={field.value}
                                defaultValue={field.value ?? undefined}
                                disabled={!canEditInsuredDetails}
                                onValueChange={(v) => {
                                    field.onChange(v);
                                }}
                            />
                        )}
                    />
                </div>
            </section>
            <div className={styles.actionButtons}>
                <Button
                    type="submit"
                    size="small"
                    disabled={!isValid || (isEdit && !isDirty) || isSubmitting}
                >
                    {t('clientCase.createClientCaseForm.continueButton')}
                </Button>
                <Button onClick={onCancelForm} mode="link" size="small">
                    {t('clientCase.createClientCaseForm.cancelButton')}
                </Button>
            </div>
        </form>
    );
};

export default CreateClientCaseForm;
