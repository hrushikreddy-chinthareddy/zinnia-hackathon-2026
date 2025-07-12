import {
    Button,
    ButtonGroup,
    Checkbox,
    FieldData,
    FieldSize,
    Label,
    Select,
} from '@zinnia/bloom/components';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FieldDate } from '@deps/components/field/date/FieldDate';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { getStateCodesForSelectInput } from '@deps/helpers/states.helpers';
import { formatDateDescriptionList } from '@deps/helpers/string.helpers';
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
    title: '',
    caseManagementCaseId: '',
    eAppId: '',
    agentDetails: {
        // TODO: update the agent values. This is handled in another ticket.
        firstName: '--',
        lastName: '--',
        agencyId: '--',
        npn: '--',
        email: '--',
    },
    insuredDetails: {
        firstName: '',
        lastName: '',
        sexAtBirth: 'Male',
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

const CreateClientCaseForm: React.FC<CreateClientCaseFormProps> = ({
    onSubmit,
    onCancel,
    clientCase,
}: CreateClientCaseFormProps) => {
    const mergedCase = { ...clientCaseInitialState, ...clientCase };

    const { t } = useTranslation(TranslationFiles.COMMON);
    const [clientCaseData, setClientCaseData] =
        useState<Partial<IllustrationsClientCase>>(mergedCase);
    const [currentAge, setCurrentAge] = useState(0);
    const insuredDetailsClassname = clsx(
        styles.formSection,
        styles.insuredDetails
    );
    const usStatesSelectList = getStateCodesForSelectInput();
    const [somethingChanged, setSomethingChanged] = useState(false);

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
                'npn',
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

        return !(
            somethingChanged &&
            title &&
            insuredDetails?.sexAtBirth &&
            insuredDetails?.dateOfBirth &&
            insuredDetails?.state
        );
    };

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
                    label={
                        <Typography variant={TypographyVariant.FieldLabel}>
                            {t('clientCase.createClientCaseForm.titleLabel')}
                        </Typography>
                    }
                    maxLength={60}
                    value={clientCaseData.title}
                />
                <AgentSearch
                    currentAgentData={
                        clientCaseData?.agentDetails ||
                        ({} as IllustrationAgentDetails)
                    }
                    onSelectAgent={updateClientCaseData}
                />
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
                        <Typography variant={TypographyVariant.FieldLabel}>
                            {t(
                                'clientCase.createClientCaseForm.firstNameLabel'
                            )}
                        </Typography>
                    }
                    defaultValue={clientCaseData.insuredDetails?.firstName}
                />
                <FieldData
                    className={styles.inputItem}
                    fieldSize={FieldSize.Small}
                    name="lastName"
                    onChange={getDataToUpdate}
                    label={
                        <Typography variant={TypographyVariant.FieldLabel}>
                            {t('clientCase.createClientCaseForm.lastNameLabel')}
                        </Typography>
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
                        <Label labelFor="buttonGroupTest">
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
                        <FieldDate
                            name="dateOfBirth"
                            onDateSelect={(v) => {
                                if (v) {
                                    calculateCurrentAge(v);
                                }
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
                            <Typography variant={TypographyVariant.FieldLabel}>
                                {t(
                                    'clientCase.createClientCaseForm.stateLabel'
                                )}
                            </Typography>
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
                <Button onClick={onCancelForm} mode="link">
                    {t('clientCase.createClientCaseForm.cancelButton')}
                </Button>
            </div>
        </form>
    );
};

export default CreateClientCaseForm;
