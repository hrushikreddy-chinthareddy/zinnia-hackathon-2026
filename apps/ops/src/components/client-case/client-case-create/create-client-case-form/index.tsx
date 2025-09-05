import { useQuery } from '@tanstack/react-query';
import {
    AliasModel,
    PartyReferenceDataModel,
} from '@xd/api-types/dist/generated-types/partyreference';
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
import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DateTextInput from '@deps/components/date-text-input/date-text-input';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { getStateCodesForSelectInput } from '@deps/helpers/states.helpers';
import { formatDateDescriptionList } from '@deps/helpers/string.helpers';
import { getUserHierarchyListBySellingCode } from '@deps/queries/tanstack/producerQueries/producerQueries';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';
import {
    IllustrationAgentDetails,
    IllustrationInsuredDetails,
    IllustrationsClientCase,
} from '@deps/types/illustrations';
import { MAIN_AGENCY_ROLE } from '@deps/types/producers';

import {
    AgencyOption,
    getAgentAgenciesForSelectOptions,
} from './create-client-case-form.helpers';
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

const SELLING_CODE = 'SELLING_CODE';

function calculateIssueAge(dateOfBirth: Date | null): number {
    if (!dateOfBirth) return 0;

    const today = dayjs();
    return today.diff(dateOfBirth, 'year');
}

export function findAllAliasesWithSellingCode(
    party: PartyReferenceDataModel | undefined
): AliasModel[] {
    if (!party) {
        return [];
    }
    return party.alias.filter((alias) =>
        alias.externalPartyIds?.some((id) => id.key === SELLING_CODE)
    );
}

export function getAllSellingCodes(
    party: PartyReferenceDataModel | undefined
): string[] {
    if (!party) {
        return [];
    }
    return party.alias.flatMap(
        (alias) =>
            alias.externalPartyIds
                ?.filter((id) => id.key === SELLING_CODE)
                .map((id) => id.value) || []
    );
}

function findSellingCodeFromAlias(alias: AliasModel): string {
    return alias.externalPartyIds?.find((id) => id.key === SELLING_CODE)?.value;
}

const getLoggedInAgentSellingCode = (aliases: AliasModel[]) => {
    const firstAlias = aliases[0];
    const loggedInAgentAlias = aliases.length > 0 ? firstAlias : null;
    return loggedInAgentAlias
        ? findSellingCodeFromAlias(loggedInAgentAlias)
        : '';
};

const useAgencyOptions = (
    clientCase: Partial<IllustrationsClientCase> | undefined,
    aliases: AliasModel[]
) => {
    const loggedInUserSellingCode = getLoggedInAgentSellingCode(aliases);
    const clientCaseAgentDetails = clientCase?.agentDetails;
    const firstAlias = aliases[0];

    const involvedAgents = [
        {
            sellingCode: loggedInUserSellingCode,
            fullName:
                firstAlias?.fullName ||
                `${firstAlias?.firstName} ${firstAlias?.lastName}`,
        },
        {
            sellingCode: clientCaseAgentDetails?.sellingCode,
            fullName: `${clientCaseAgentDetails?.firstName} ${clientCaseAgentDetails?.lastName}`,
        },
    ].filter((item) => item?.sellingCode) as {
        sellingCode: string;
        fullName: string;
    }[];

    const involvedAgentSellingCodes = involvedAgents.map(
        ({ sellingCode }) => sellingCode
    );

    const { data: agencyOptions } = useQuery({
        queryKey: ['agentHierarchy', ...involvedAgentSellingCodes],
        queryFn: () =>
            getUserHierarchyListBySellingCode(involvedAgentSellingCodes),
        enabled: !!involvedAgentSellingCodes.length,
        select: (response) => {
            const rootAgencyOptions = response
                .filter(({ role }) => role === MAIN_AGENCY_ROLE)
                .map(({ sellingCode }) => {
                    const agentData = involvedAgents.find(
                        (item) => item.sellingCode === sellingCode
                    )!;

                    return {
                        value: sellingCode,
                        textValue: agentData.fullName,
                    } as AgencyOption;
                });

            if (rootAgencyOptions.length) {
                return [rootAgencyOptions[0]];
            }

            return getAgentAgenciesForSelectOptions(response);
        },
    });

    return agencyOptions;
};

const CreateClientCaseForm: React.FC<CreateClientCaseFormProps> = ({
    onSubmit,
    onCancel,
    clientCase,
    isEdit,
}: CreateClientCaseFormProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const { partyReferenceData } = usePermissionsContext();

    const aliases = findAllAliasesWithSellingCode(partyReferenceData);
    const loggedInUserSellingCode = getLoggedInAgentSellingCode(aliases);
    const isAgent = aliases.length > 0;
    const firstAgencyKey = 0;

    const mergedCase = {
        ...clientCaseInitialState,
        ...clientCase,
    };

    const [clientCaseData, setClientCaseData] =
        useState<Partial<IllustrationsClientCase>>(mergedCase);
    const [currentAge, setCurrentAge] = useState(0);
    const [somethingChanged, setSomethingChanged] = useState(false);
    const [
        initialSearchAgencySellingCodes,
        setInitialSearchAgencySellingCodes,
    ] = useState<string[]>([]);
    const agencyOptions = useAgencyOptions(clientCaseData, aliases);
    const usStatesSelectList = getStateCodesForSelectInput();
    const insuredDetailsClassname = clsx(
        styles.formSection,
        styles.insuredDetails
    );

    const updateClientCaseData = (
        dataToUpdate:
            | Partial<IllustrationInsuredDetails>
            | Partial<IllustrationsClientCase>
    ) => {
        setSomethingChanged(true);

        setClientCaseData((prev) => {
            const insuredFields: (keyof IllustrationInsuredDetails)[] = [
                'firstName',
                'lastName',
                'sexAtBirth',
                'dateOfBirth',
                'nicotineUser',
                'state',
                'illustrateAtOlderAge',
                'issueAge',
            ];

            const agentFields: (keyof IllustrationAgentDetails)[] = [
                'firstName',
                'lastName',
                'sellingCode',
                'email',
            ];

            const updateKeys = Object.keys(dataToUpdate);
            const isInsuredUpdate = updateKeys.every((key) =>
                insuredFields.includes(key as keyof IllustrationInsuredDetails)
            );
            const isAgentUpdate = updateKeys.every((key) =>
                agentFields.includes(key as keyof IllustrationAgentDetails)
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

    const getDataToUpdate = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        updateClientCaseData({ [name]: value });
    };

    const calculateCurrentAge = (birthDate: Date) => {
        setCurrentAge(calculateIssueAge(birthDate));
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
        if (onSubmit) {
            onSubmit(clientCaseData);
        }
    };

    const onCancelForm = () => {
        if (onCancel) {
            onCancel();
        }
    };

    useEffect(() => {
        const matchedAgencies = agencyOptions?.find(
            (agencyOption) => agencyOption.value === clientCaseData.agencyId
        );
        if (agencyOptions?.length && !matchedAgencies) {
            // update the agencyId of the client case
            updateClientCaseData({
                agencyId: agencyOptions[firstAgencyKey].value,
            });
        }

        if (agencyOptions?.length && !initialSearchAgencySellingCodes.length) {
            // Set an innitial state to search across all agencies
            const agenciesIds = agencyOptions.map((option) => option.value);
            setInitialSearchAgencySellingCodes(agenciesIds);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [agencyOptions]);

    useEffect(() => {
        setCurrentAge(
            calculateIssueAge(mergedCase.insuredDetails?.dateOfBirth || null)
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        const agentAlias = aliases.length > 0 ? aliases[0] : null;

        updateClientCaseData({
            agentDetails: {
                firstName:
                    agentAlias?.firstName ?? partyReferenceData?.firstName,
                lastName: agentAlias?.lastName ?? partyReferenceData?.lastName,
                email: agentAlias?.email ?? partyReferenceData?.email,
                sellingCode: loggedInUserSellingCode,
            },
        });
    }, [
        isEdit,
        partyReferenceData,
        loggedInUserSellingCode,
        clientCase?.agentDetails,
        clientCaseData?.agentDetails?.sellingCode,
        aliases,
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
                    onChange={getDataToUpdate}
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
                            onValueChange={(v) => {
                                updateClientCaseData({ agencyId: v });
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
                    onChange={getDataToUpdate}
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
                    onChange={getDataToUpdate}
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
                            onChange={(v) => {
                                calculateCurrentAge(v);
                                updateClientCaseData({ dateOfBirth: v });
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
