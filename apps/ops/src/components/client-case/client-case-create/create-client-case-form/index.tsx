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
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
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
    IllustrationInsuredDetails,
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
        reset,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
    } = useForm<IllustrationsClientCase>({
        mode: 'onChange',
        defaultValues: clientCaseInitialState,
    });
    useEffect(() => console.log({ ...getValues() }), [getValues]);
    useEffect(() => {
        if (clientCase) {
            reset(clientCase);
        }
    }, [clientCase, reset]);

    const canEditInsuredDetails =
        clientCase?.transactionType !== TransactionType.CONVERSION;

    const firstAgencyKey = 0;

    const mergedCase = {
        ...clientCaseInitialState,
        ...clientCase,
    };

    const [clientCaseData, setClientCaseData] =
        useState<Partial<IllustrationsClientCase>>(mergedCase);

    // const { dateOfBirth } = clientCaseData?.insuredDetails ?? {};
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

    const [somethingChanged, setSomethingChanged] = useState(false);
    const [isSubmiting, setIsSubmiting] = useState(false);

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

    //This could be in a hook
    const updateClientCaseData = (
        dataToUpdate:
            | Partial<IllustrationInsuredDetails>
            | Partial<IllustrationsClientCase>
            | Partial<IllustrationAgentDetails>
    ) => {
        setSomethingChanged(true);

        setClientCaseData((prev) => {
            const insuredFields = [
                'firstName',
                'lastName',
                'sexAtBirth',
                'dateOfBirth',
                'nicotineUser',
                'state',
                'illustrateAtOlderAge',
                'issueAge',
            ] satisfies (keyof IllustrationInsuredDetails)[];

            const agentFields = [
                'firstName',
                'lastName',
                'sellingCode',
                'email',
            ] satisfies (keyof IllustrationAgentDetails)[];

            const updateKeys = Object.keys(dataToUpdate);
            const isInsuredUpdate = updateKeys.every((key) =>
                (insuredFields as string[]).includes(key)
            );
            const isAgentUpdate = updateKeys.every((key) =>
                (agentFields as string[]).includes(key)
            );

            if (isInsuredUpdate) {
                return {
                    ...prev,
                    insuredDetails: {
                        ...prev.insuredDetails,
                        ...dataToUpdate,
                    },
                };
            }

            if (isAgentUpdate) {
                return {
                    ...prev,
                    agentDetails: {
                        ...prev.agentDetails,
                        ...dataToUpdate,
                    },
                };
            }

            return {
                ...prev,
                ...dataToUpdate,
            };
        });
    };

    const updateClientCaseField = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        updateClientCaseData({ [name]: value });
    };

    const handleDateChange = (birthDate: Date) => {
        updateClientCaseData({ dateOfBirth: birthDate });
        setValue('insuredDetails.dateOfBirth', birthDate);
    };

    const canSubmitForm = () => {
        // const { title, insuredDetails, agentDetails, agencyId } =
        //     clientCaseData;

        const { title, insuredDetails, agentDetails, agencyId } = getValues();

        const parsedDate = dayjs(insuredDetails?.dateOfBirth);

        const formattedDate = parsedDate.isValid()
            ? parsedDate.format('MM/DD/YYYY')
            : null;

        const validDate = isValidDate(formattedDate);

        const hasErrors = Object.keys(errors).length > 0;
        console.log(errors);

        return !!(
            !isSubmiting &&
            !isFetchingAgencies &&
            agentDetails?.sellingCode &&
            agencyId &&
            // (!isEdit || somethingChanged) &&
            title &&
            insuredDetails?.sexAtBirth &&
            insuredDetails?.dateOfBirth &&
            validDate &&
            insuredDetails?.state &&
            !hasErrors
        );
    };

    const selectedAgencyOption = useMemo(
        () =>
            agencyOptions?.find(
                (agencyOption) => agencyOption.value === clientCaseData.agencyId
            ),
        [agencyOptions, clientCaseData.agencyId]
    );

    // Show the dropdown only after a default value for the agencyId was selected
    const displayAgencyDropdown =
        agencyOptions && selectedAgencyOption && agencyOptions.length > 1;

    const sendAnalytics = () => {
        const { title } = clientCaseData;
        const { title: initialTitle } = mergedCase;
        sendAgencySelection(agencyOptions ?? []);
        sendClientCaseTitleInput(title !== initialTitle);
        if (isEdit) {
            sendClientCaseEdited();
        } else {
            sendNewClientCaseCreated();
        }
    };

    const onSubmitForm = async () => {
        setIsSubmiting(true);
        sendAnalytics();

        try {
            console.log(getValues());
            await onSubmit?.(getValues());
        } finally {
            setIsSubmiting(false);
        }
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

            if (!isEqual(newAgentDetails, clientCaseData?.agentDetails)) {
                updateClientCaseData({
                    agentDetails: newAgentDetails,
                    ...(!isCurrentAgencyIdValid ? { agencyId: undefined } : {}),
                });

                setValue('agentDetails', newAgentDetails);
                // setValue('agencyId', !isCurrentAgencyIdValid ? { agencyId: undefined } : {})
            }
        },
        [
            selectedAgencyOption,
            clientCaseData?.agentDetails,
            selectedAgentOption,
        ]
    );

    //
    //  Sync agentDetails after an agency is selected
    //
    useEffect(() => {
        const agentSellingCode = clientCaseData.agentDetails?.sellingCode;
        const hasAgencyOptions = !!agencyOptions?.length;

        if (!hasAgencyOptions) {
            // Do nothing if we don't have agency options to select
            return;
        }

        if (!selectedAgencyOption) {
            // Select any of available agencies by default
            const agencyOption = first(agencyOptions)!;
            const { value: agencyId, agentSellingCode } = agencyOption;

            updateClientCaseData({
                agencyId,
                agentDetails: {
                    ...omit(selectedAgentOption, ['sellingCodes', 'lookupId']),
                    sellingCode: agentSellingCode,
                },
            });

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

                return updateClientCaseData({
                    agentDetails: {
                        ...omit(selectedAgentOption, [
                            'sellingCodes',
                            'lookupId',
                        ]),
                        sellingCode: selectedAgencyOption.agentSellingCode,
                    },
                });
            }

            // Do nothing if AgencyId is valid
            return;
        }
    }, [
        agencyOptions,
        selectedAgencyOption,
        selectedAgentOption,
        clientCaseData.agencyId,
        clientCaseData.agentDetails?.sellingCode,
        isEdit,
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
            onSubmit={handleSubmit((data) => {
                console.log(data);
            })}
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
                        required: 'Title is required',
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
                    !clientCaseData?.agencyId &&
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
                                updateClientCaseData({ agencyId });

                                const newSelectedAgencyOption =
                                    agencyOptions.find(
                                        (agencyOption) =>
                                            agencyOption.value ===
                                            clientCaseData.agencyId
                                    );

                                const newAgentSellingcode =
                                    newSelectedAgencyOption?.agentSellingCode;

                                if (newAgentSellingcode) {
                                    updateClientCaseData({
                                        sellingCode: newAgentSellingcode,
                                    });
                                }
                            }}
                            defaultValue={
                                isEdit
                                    ? clientCaseData.agencyId
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
                        required: t(
                            'clientCase.quickQuoteForm.selectAnOption'
                        ) as string,
                    }}
                    render={({ field }) => (
                        <ButtonGroup
                            id="sexAtBirth"
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
                            defaultValue={
                                field.value === 'MALE' ? 'MALE' : 'FEMALE'
                            }
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
                        {/* TODO: Refactor to handle logic at this level instead
                        of in the same component */}
                        <DateTextInput
                            onChange={(newDate) => {
                                handleDateChange(newDate);
                            }}
                            {...(clientCaseData.insuredDetails?.dateOfBirth && {
                                defaultDate: formatUTCDate(
                                    new Date(
                                        clientCaseData.insuredDetails.dateOfBirth
                                    )
                                ),
                            })}
                            errorMessage={t(
                                'clientCase.createClientCaseForm.dateErrorMessage'
                            )}
                            disabled={!canEditInsuredDetails}
                        />
                    </div>
                    {clientCaseData.insuredDetails?.dateOfBirth !== null && (
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
                            required: 'State is required',
                            validate: (v) =>
                                (v && v.length > 0) || 'State is required',
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
                    onClick={onSubmitForm}
                    size="small"
                    disabled={!canSubmitForm()}
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
