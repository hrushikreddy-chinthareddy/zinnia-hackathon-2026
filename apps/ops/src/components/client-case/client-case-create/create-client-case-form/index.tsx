import {
    AliasModel,
    PartyReferenceDataModel,
} from '@xd/api-types/dist/generated-types/partyreference';
import { isValidDate } from '@xd/utils/dist';
import { capitalize } from '@xd/utils/src/strings';
import {
    Button,
    ButtonGroup,
    Checkbox,
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
}

const clientCaseInitialState: Partial<IllustrationsClientCase> = {
    title: 'Untitled Client Case',
    caseManagementCaseId: '',
    eAppId: '',
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
    lastModified: '',
};

function calculateIssueAge(dateOfBirth: Date | null): number {
    if (!dateOfBirth) return 0;

    const today = dayjs();
    return today.diff(dateOfBirth, 'year');
}

const SELLING_CODE = 'SELLING_CODE';
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

export function findSellingCodeFromAlias(
    alias: AliasModel
): string | undefined {
    return alias.externalPartyIds?.find((id) => id.key === SELLING_CODE)?.value;
}

const CreateClientCaseForm: React.FC<CreateClientCaseFormProps> = ({
    onSubmit,
    onCancel,
    clientCase,
}: CreateClientCaseFormProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const { partyReferenceData } = usePermissionsContext();

    const aliases = findAllAliasesWithSellingCode(partyReferenceData);
    const sellingCodes = getAllSellingCodes(partyReferenceData);

    const isAgent = aliases.length > 0;

    const isEdit = !!clientCase;
    const mergedCase = {
        ...clientCaseInitialState,
        ...clientCase,
    };

    const [currentAgent, setCurrentAgent] =
        useState<IllustrationAgentDetails>();
    const [clientCaseData, setClientCaseData] =
        useState<Partial<IllustrationsClientCase>>(mergedCase);
    const [currentAge, setCurrentAge] = useState(0);
    const [somethingChanged, setSomethingChanged] = useState(false);

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
                'agencyId',
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
        const { title, insuredDetails } = clientCaseData;

        const parsedDate = dayjs(insuredDetails?.dateOfBirth);

        const formattedDate = parsedDate.isValid()
            ? parsedDate.format('MM/DD/YYYY')
            : null;

        const validDate = isValidDate(formattedDate);

        return !(
            isAgent &&
            currentAgent?.firstName &&
            currentAgent?.lastName &&
            somethingChanged &&
            title &&
            insuredDetails?.sexAtBirth &&
            insuredDetails?.dateOfBirth &&
            validDate &&
            insuredDetails?.state
        );
    };

    const onSubmitForm = () => {
        if (onSubmit) {
            onSubmit({
                ...clientCaseData,
                agentDetails: { ...currentAgent },
            });
        }
    };

    const onCancelForm = () => {
        if (onCancel) {
            onCancel();
        }
    };

    useEffect(() => {
        setCurrentAge(
            calculateIssueAge(mergedCase.insuredDetails?.dateOfBirth || null)
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // for Edit use clientCase data
        if (isEdit && clientCase?.agentDetails) {
            setCurrentAgent({
                firstName:
                    clientCase.agentDetails.firstName ?? DEFAULT_ERROR_STRING,
                lastName:
                    clientCase.agentDetails.lastName ?? DEFAULT_ERROR_STRING,
                email: clientCase.agentDetails.email ?? DEFAULT_ERROR_STRING,
                sellingCode: clientCase.agentDetails.sellingCode ?? '',
            });
        }

        // for New client-cases we pull the logged in user, who should be an agent, and use their data from the party reference service
        if (!isEdit && partyReferenceData) {
            const agentAlias = aliases.length > 0 ? aliases[0] : null;

            if (agentAlias) {
                setCurrentAgent({
                    firstName: agentAlias.firstName,
                    lastName: agentAlias.lastName,
                    email: agentAlias.email,
                    sellingCode: findSellingCodeFromAlias(agentAlias),
                });
            }

            // For Farmers, we can build the selling code by combining the AOR + UPN
            // confirm if we should take in consideration this case scenario
        }
    }, [isEdit, clientCase, partyReferenceData]);

    return (
        <form className={styles.formContainer}>
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

                {currentAgent ? (
                    <AgentSearch
                        currentAgentData={currentAgent}
                        onSelectAgent={updateClientCaseData}
                    />
                ) : (
                    <div className={styles.loaderContainer}>
                        <Loader />
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
                            value: 'Male',
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
                            value: 'Female',
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
                    defaultValue={capitalize(
                        clientCaseData.insuredDetails?.sexAtBirth
                    )}
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
                <Checkbox
                    id="nicotine-user"
                    name="nicotineUser"
                    onClick={(v) => {
                        updateClientCaseData({ nicotineUser: v });
                    }}
                    isCheckedByDefault={
                        clientCaseData.insuredDetails?.nicotineUser
                    }
                >
                    {t('clientCase.createClientCaseForm.nicotineUserLabel')}
                </Checkbox>
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
