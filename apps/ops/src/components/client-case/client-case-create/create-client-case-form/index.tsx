import { isValidDate } from '@xd/utils/dist';
import {
    Button,
    ButtonGroup,
    FieldData,
    FieldSize,
    Label,
    Loader,
    Select,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DateTextInput from '@deps/components/date-text-input/date-text-input';
import { useAgencyOptions } from '@deps/components/illustrations/helpers/hooks/use-agency-options';
import { useUserIdentity } from '@deps/components/illustrations/helpers/hooks/user-user-identity';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { getStateCodesForSelectInput } from '@deps/helpers/states.helpers';
import { formatDateDescriptionList } from '@deps/helpers/string.helpers';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import {
    IllustrationAgentDetails,
    IllustrationInsuredDetails,
    IllustrationsClientCase,
} from '@deps/types/illustrations';

import styles from './create-client-case-form.module.css';
import { AgentSearch } from '../agent-search/agent-search';

interface CreateClientCaseFormProps {
    onCancel: () => void;
    onSubmit?: (clientCaseData: Partial<IllustrationsClientCase>) => void;
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
        state: '',
    },
};

function calculateIssueAge(dateOfBirth: Date | null): number {
    if (!dateOfBirth) return 0;

    const today = dayjs();
    return today.diff(dateOfBirth, 'year');
}

const CreateClientCaseForm: React.FC<CreateClientCaseFormProps> = ({
    onSubmit,
    onCancel,
    clientCase,
    isEdit,
}: CreateClientCaseFormProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const { partyReferenceData } = usePermissionsContext();
    const { findAllAliasesWithSellingCode, getMainIdentyfiers } =
        useUserIdentity();
    const aliasesWithSellingCodes =
        findAllAliasesWithSellingCode(partyReferenceData);
    const {
        mainAlias: loggedInUserMainAlias,
        mainSellingCode: loggedInUserMainSellingCode,
    } = getMainIdentyfiers(aliasesWithSellingCodes);
    const isAgent = !!loggedInUserMainSellingCode;
    const firstAgencyKey = 0;

    const mergedCase = {
        ...clientCaseInitialState,
        ...clientCase,
    };

    const [clientCaseData, setClientCaseData] =
        useState<Partial<IllustrationsClientCase>>(mergedCase);

    const { dateOfBirth } = clientCaseData?.insuredDetails ?? {};
    const currentAge = useMemo(
        () => calculateIssueAge(dateOfBirth ?? null) ?? 0,
        [dateOfBirth]
    );

    const [somethingChanged, setSomethingChanged] = useState(false);
    const [
        initialSearchAgencySellingCodes,
        setInitialSearchAgencySellingCodes,
    ] = useState<string[]>([]);

    //this needs a better name like agencysAvailableAgencies o agencies to search
    const agencyOptions = useAgencyOptions(
        clientCaseData,
        aliasesWithSellingCodes
    );
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
    };

    const canSubmitForm = () => {
        const { title, insuredDetails, agentDetails } = clientCaseData;

        const parsedDate = dayjs(insuredDetails?.dateOfBirth);

        const formattedDate = parsedDate.isValid()
            ? parsedDate.format('MM/DD/YYYY')
            : null;

        const validDate = isValidDate(formattedDate);

        // TODO: in the future all the client cases should inlcude an agencyId and agent selling code
        return !(
            isAgent &&
            agentDetails?.firstName &&
            agentDetails?.lastName &&
            (!isEdit || somethingChanged) &&
            title &&
            insuredDetails?.sexAtBirth &&
            insuredDetails?.dateOfBirth &&
            validDate &&
            insuredDetails?.state
        );
    };

    const displayAgencyDropdown = agencyOptions && agencyOptions.length > 1;

    const onSubmitForm = () => {
        onSubmit?.(clientCaseData);
    };

    const onCancelForm = useCallback(() => {
        onCancel?.();
    }, [onCancel]);

    const selectedAgencyOption = useMemo(
        () =>
            agencyOptions?.find(
                (agencyOption) => agencyOption.value === clientCaseData.agencyId
            ),
        [agencyOptions, clientCaseData.agencyId]
    );

    useEffect(() => {
        const agentSellingCode = clientCaseData.agentDetails?.sellingCode;
        const hasAgencyOptions = !!agencyOptions?.length;
        const hasInitialSearchAgencySellingcodes =
            !!initialSearchAgencySellingCodes.length;

        if (!hasAgencyOptions) {
            // Do nothing if we don't have agency options to select
            return;
        }

        if (!hasInitialSearchAgencySellingcodes) {
            // Set an initial state to search across all agencies
            const agenciesIds = agencyOptions.map((option) => option.value);
            setInitialSearchAgencySellingCodes(agenciesIds);
        }

        if (selectedAgencyOption) {
            const selectedAgencyAgentSellingCode =
                selectedAgencyOption?.agentSellingCode;
            if (
                selectedAgencyAgentSellingCode &&
                selectedAgencyAgentSellingCode != agentSellingCode
            ) {
                return updateClientCaseData({
                    sellingCode: selectedAgencyAgentSellingCode,
                });
            }

            // Do nothing if AgencyId is valid
            return;
        }

        // Select any of available agencies by default
        updateClientCaseData({
            agencyId: agencyOptions[firstAgencyKey].value,
        });
    }, [
        agencyOptions,
        selectedAgencyOption,
        initialSearchAgencySellingCodes.length,
        clientCaseData.agencyId,
        clientCaseData.agentDetails?.sellingCode,
        isEdit,
    ]);

    useEffect(() => {
        const selectedAgentSellingCode =
            clientCaseData?.agentDetails?.sellingCode;

        if (selectedAgentSellingCode) {
            // Only do something if we don't have an agent selected
            return;
        }

        // for Edit, always use agent details from the client case
        if (isEdit) {
            // -------
            // Edition
            // -------
            if (!clientCase?.agentDetails) {
                return;
            }
            return updateClientCaseData({
                agentDetails: {
                    firstName:
                        clientCase.agentDetails.firstName ??
                        DEFAULT_ERROR_STRING,
                    lastName:
                        clientCase.agentDetails.lastName ??
                        DEFAULT_ERROR_STRING,
                    email:
                        clientCase.agentDetails.email ?? DEFAULT_ERROR_STRING,
                    sellingCode: clientCase.agentDetails.sellingCode ?? '',
                },
            });
        }

        // ------------
        // Creation
        // ------------

        // If we have agentDetails (sureify flow). Use these
        if (clientCase?.agentDetails) {
            return updateClientCaseData({
                agentDetails: {
                    firstName:
                        clientCase.agentDetails.firstName ??
                        DEFAULT_ERROR_STRING,
                    lastName:
                        clientCase.agentDetails.lastName ??
                        DEFAULT_ERROR_STRING,
                    email:
                        clientCase.agentDetails.email ?? DEFAULT_ERROR_STRING,
                    sellingCode: clientCase.agentDetails.sellingCode ?? '',
                },
            });
        }

        // If we don't have agentDetails (anonymous flow), use the authenticated
        // user data (from party reference service) if available
        updateClientCaseData({
            agentDetails: {
                firstName:
                    loggedInUserMainAlias?.firstName ??
                    partyReferenceData?.firstName,
                lastName:
                    loggedInUserMainAlias?.lastName ??
                    partyReferenceData?.lastName,
                email:
                    loggedInUserMainAlias?.email ?? partyReferenceData?.email,
                sellingCode: loggedInUserMainSellingCode,
            },
        });
    }, [
        isEdit,
        partyReferenceData,
        clientCase?.agentDetails,
        loggedInUserMainAlias,
        loggedInUserMainSellingCode,
        clientCaseData?.agentDetails?.sellingCode,
    ]);

    return (
        <form
            className={styles.formContainer}
            onSubmit={(e) => {
                e.preventDefault();
            }}
        >
            <section className={styles.formSection}>
                <Typography
                    variant={TypographyVariant.H3}
                    className={styles.sectionTitle}
                >
                    {t('clientCase.createClientCaseForm.clientCaseSection')}
                </Typography>
                <FieldData
                    fieldSize={FieldSize.Small}
                    name="title"
                    onChange={updateClientCaseField}
                    id="client-case-title"
                    label={
                        <Label>
                            {t('clientCase.createClientCaseForm.titleLabel')}
                        </Label>
                    }
                    maxLength={60}
                    value={clientCaseData.title}
                />

                {clientCaseData.agentDetails?.sellingCode ? (
                    <AgentSearch
                        currentAgentData={clientCaseData.agentDetails}
                        onSelectAgent={updateClientCaseData}
                        shouldShowEdit
                        agencyIdArray={initialSearchAgencySellingCodes}
                    />
                ) : (
                    <div className={styles.loaderContainer}>
                        <Loader />
                    </div>
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
                                    agencyOptions?.find(
                                        (agencyOption) =>
                                            agencyOption.value ===
                                            clientCaseData.agencyId
                                    )!;

                                const newAgentSellingcode =
                                    newSelectedAgencyOption.agentSellingCode;

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
                <FieldData
                    className={styles.inputItem}
                    fieldSize={FieldSize.Small}
                    name="firstName"
                    onChange={updateClientCaseField}
                    label={
                        <Label>
                            {t(
                                'clientCase.createClientCaseForm.firstNameLabel'
                            )}
                        </Label>
                    }
                    defaultValue={clientCaseData.insuredDetails?.firstName}
                />
                <FieldData
                    className={styles.inputItem}
                    fieldSize={FieldSize.Small}
                    name="lastName"
                    onChange={updateClientCaseField}
                    label={
                        <Label>
                            {t('clientCase.createClientCaseForm.lastNameLabel')}
                        </Label>
                    }
                    defaultValue={clientCaseData.insuredDetails?.lastName}
                />
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
                    onClick={(v) => {
                        updateClientCaseData({ sexAtBirth: v as string });
                    }}
                    label={
                        <Label labelFor="sexAtBirth">
                            {t(
                                'clientCase.createClientCaseForm.sexAssignedLabel'
                            )}
                        </Label>
                    }
                    defaultValue={clientCaseData.insuredDetails?.sexAtBirth}
                />
                <div className={styles.datePickerContainer}>
                    <div className={styles.datePicker}>
                        <Typography variant={TypographyVariant.FieldLabel}>
                            {t('clientCase.createClientCaseForm.dateLabel')}
                        </Typography>
                        <DateTextInput
                            onChange={(newDate) => {
                                handleDateChange(newDate);
                            }}
                            {...(clientCaseData.insuredDetails?.dateOfBirth && {
                                defaultDate: formatDateDescriptionList(
                                    new Date(
                                        clientCaseData.insuredDetails.dateOfBirth
                                    )
                                ),
                            })}
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
                {currentAge >= 18 && (
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
                        onClick={(v) => {
                            updateClientCaseData({
                                nicotineUser: v === 'Nicotine',
                            });
                        }}
                        label={
                            <Label labelFor="nicotine-user">
                                {t(
                                    'clientCase.createClientCaseForm.nicotineUserLabel'
                                )}
                            </Label>
                        }
                        defaultValue={
                            clientCaseData.insuredDetails?.nicotineUser
                                ? 'Nicotine'
                                : 'Non-Nicotine'
                        }
                    />
                )}
                <div className={styles.clientState}>
                    <Select
                        options={usStatesSelectList}
                        label={
                            <Label>
                                {t(
                                    'clientCase.createClientCaseForm.stateLabel'
                                )}
                            </Label>
                        }
                        onValueChange={(v) => {
                            updateClientCaseData({ state: v });
                        }}
                        value={clientCaseData.insuredDetails?.state}
                        defaultValue={clientCaseData.insuredDetails?.state}
                    />
                </div>
            </section>
            <div className={styles.actionButtons}>
                <Button
                    onClick={onSubmitForm}
                    size="small"
                    disabled={canSubmitForm()}
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
