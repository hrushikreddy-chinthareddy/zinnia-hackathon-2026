import {
    Label,
    AssistiveText,
    AssistiveTextVariant,
} from '@zinnia/bloom/components';
import { countries } from 'countries-list';
import { TFunction } from 'i18next';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Button, {
    ButtonSize,
    ButtonType,
    ButtonVariant,
} from '@deps/components/button/button';
import Content, { ContentVariant } from '@deps/components/content/content';
import TextField from '@deps/components/dynamic-form/components/text-field/text-field';
import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import Radio from '@deps/components/radio/radio';
import SelectComponent from '@deps/components/select/select';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import PhoneNumber from '@deps/containers/address-change-container/components/contact-details/phone-number';
import {
    NotifierParty,
    RoleType,
} from '@deps/containers/death-claim-container/death-claim.types';
import { updateTask } from '@deps/containers/task-container/task.helpers';
import { TaskActions } from '@deps/contexts/UpdateNotificationMethodContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { getCaseIdentifierValue } from '@deps/helpers/case-management';
import {
    formatPhone,
    formatPhoneWithAreacode,
    isNullEmptyOrUndefined,
} from '@deps/helpers/string.helpers';
import { CaseIdentifier } from '@deps/models/case/case';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { NOOP } from '@deps/types/constants';
import { DEFAULT_ERROR_STRING, toTitleCase } from '@deps/utils/strings';
import { Phone } from '@zinnia/api-types/types/sor';

import BeneficiaryDeceased from './beneficiary-deceased';
import BeneficiaryNotificationChange from './beneficiary-notification-change';
import {
    CallForInformationFunctions,
    getAction,
} from './call-for-information.helper';
import {
    CallEntry,
    CallLog,
    ContactRole,
    UpdatedBeneficiaryRecord,
    DynamicKey,
    ChangeTypeEnum,
} from './claims.type';
import { DisplayCompletedCalls } from './display-completed-calls';

function NotifierDetails({ notifier }: { notifier: NotifierParty }) {
    const { t: defaultT } = useTranslation();
    const notifierRole =
        notifier.notifierRole === RoleType.Beneficiary &&
        isNullEmptyOrUndefined(notifier.party?.partyId)
            ? RoleType.Other
            : notifier.notifierRole;

    return (
        <div className="flex flex-col w-full mb-2">
            <label className="font-primary text-lg mt-2 mb-4">
                {defaultT('allFields.notifierDetails')}
            </label>
            <div className="grid grid-cols-5 gap-2 text-md align-center mb-4">
                <div className="col-span-1 text-[--color-base-text-secondary]">
                    {defaultT('allFields.notifierName')}
                </div>
                <Typography
                    variant={TypographyVariant.BodySm}
                    className="col-span-4"
                >
                    <PiiWrapper>
                        {notifier.party?.fullName || DEFAULT_ERROR_STRING}
                    </PiiWrapper>
                </Typography>
                <div className="col-span-1 text-[--color-base-text-secondary]">
                    {defaultT('allFields.notifierRole')}
                </div>
                <Typography
                    variant={TypographyVariant.BodySm}
                    className="col-span-4"
                >
                    {toTitleCase(notifierRole) || DEFAULT_ERROR_STRING}
                </Typography>
                <div className="col-span-1 text-[--color-base-text-secondary]">
                    {defaultT('allFields.notifierPhoneNumber')}
                </div>
                <Typography
                    variant={TypographyVariant.BodySm}
                    className="col-span-4"
                >
                    <PiiWrapper>
                        {notifier.party?.phone?.dialNumber
                            ? formatPhoneWithAreacode(notifier?.party?.phone)
                            : DEFAULT_ERROR_STRING}
                    </PiiWrapper>
                </Typography>
                {notifier.notifierRole === RoleType.Other && (
                    <>
                        <div className="col-span-1 text-[--color-base-text-secondary]">
                            {defaultT('allFields.relationshipToInsured')}
                        </div>
                        <Typography
                            variant={TypographyVariant.BodySm}
                            className="col-span-4"
                        >
                            {notifier.party?.relationshipToInsured ||
                                DEFAULT_ERROR_STRING}
                        </Typography>
                    </>
                )}
            </div>
        </div>
    );
}

const INITIAL_CALL_ENTRY: CallEntry = {
    id: 1,
    contactRole: '',
    name: '',
    phone: {} as Phone,
    callSummary: '',
    taskActions: [],
};

export interface CallForInformationProps {
    task: any;
    readOnly: boolean;
    setTask: React.Dispatch<React.SetStateAction<any>>;
    onContinueReady?: (fn: () => void) => void;
    correlationId: string;
    setSubmitFailed?: React.Dispatch<React.SetStateAction<boolean>>;
    formErrors: FormValidationErrors;
    setFormErrors: React.Dispatch<React.SetStateAction<FormValidationErrors>>;
    beneficiary: UpdatedBeneficiaryRecord;
    setBeneficiary: React.Dispatch<
        React.SetStateAction<UpdatedBeneficiaryRecord>
    >;
    t: TFunction<TranslationFiles.COMMON, { keyPrefix: string }>;
    prevBeneficiary?: UpdatedBeneficiaryRecord;
}

function CallForInformation({
    task,
    setTask,
    onContinueReady,
    correlationId,
    setSubmitFailed,
    formErrors,
    setFormErrors,
    beneficiary,
    setBeneficiary,
    readOnly,
    prevBeneficiary,
    t,
}: CallForInformationProps) {
    const [callEntries, setCallEntries] = useState<CallEntry[]>([
        { ...INITIAL_CALL_ENTRY },
    ]);

    const dynamicKey = task?.data?.details?.beneCall
        ? DynamicKey.BENE_CALL
        : DynamicKey.BENE_FINAL_CONTACT_ATTEMPT;
    const [contactRole, setContactRole] = useState('');
    const [filteredCallLogs, setFilteredCallLogs] = useState<
        (CallLog & { id: string })[]
    >([]);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState<Phone>({} as Phone);
    const [country, setCountry] = useState<keyof typeof countries>('US');
    const [relationshipToOwner, setRelationshipToOwner] = useState('');
    const [addressSelected, setAddressSelected] = useState(false);
    const [callSummary, setCallSummary] = useState('');
    const [taskActions, setTaskActions] = useState<TaskActions[]>([]);

    const { goToNext } = useWorkflow();

    const {
        contactRoleOptions,
        changeTypeOptions,
        addNewCallEntry,
        updateCurrentCallEntry,
        validateForm,
        updateCallLogs,
        shouldRenderChangeRequire,
        applyBeneficiaryChanges,
    } = CallForInformationFunctions({
        t,
        task,
        setTask,
        contactRole,
        name,
        setName,
        phone,
        setPhone,
        country,
        setContactRole,
        relationshipToOwner,
        setBeneficiary,
        dynamicKey,
        setCallEntries,
        callEntries,
        beneficiary,
        setFormErrors,
        addressSelected,
        callSummary,
        setCallSummary,
        taskActions,
        setTaskActions,
    });

    const contractNumber =
        getCaseIdentifierValue(
            task.identifiers,
            CaseIdentifier.contractNumber
        ) || '';

    const action = useMemo(
        () => getAction(prevBeneficiary, beneficiary),
        [prevBeneficiary, beneficiary]
    );

    useEffect(() => {
        setBeneficiary((prev) => ({
            ...prev,
            notificationPreferences: {
                ...prev.notificationPreferences,
                notificationMethod: {
                    ...prev.notificationPreferences.notificationMethod,
                    action,
                },
            },
        }));
    }, [action]);

    useEffect(() => {
        if (readOnly) {
            applyBeneficiaryChanges();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
        // we only need once when component mounts
    }, []);

    useEffect(() => {
        const handleContinue = async () => {
            let updatedTask = { ...task };
            updatedTask.data.details[dynamicKey].beneficiaryChangeDetail = {
                ...beneficiary,
            };

            let maxCallSequence = 0;
            for (const log of task.data.details[dynamicKey].callLogs || []) {
                if (log.callSequence > maxCallSequence) {
                    maxCallSequence = log.callSequence;
                }
            }
            updatedTask = updateCallLogs(
                updatedTask,
                dynamicKey,
                maxCallSequence + 1,
                contactRole,
                name,
                phone,
                country,
                relationshipToOwner,
                callSummary,
                taskActions
            );

            if (dynamicKey === DynamicKey.BENE_FINAL_CONTACT_ATTEMPT) {
                updatedTask.data.details[
                    dynamicKey
                ].subTaskBeneCallChangeRequire =
                    task?.data?.details?.benefinalcontactattempt?.callLogs?.some(
                        (log: CallLog) =>
                            log?.taskActions?.includes(
                                TaskActions.CONTACT_ESTABLISHED
                            )
                    );
            }
            setTask(updatedTask);
            const success = await updateTask(task, correlationId);
            setSubmitFailed && setSubmitFailed(!success);
            goToNext();
        };
        onContinueReady && onContinueReady(() => handleContinue);
    }, [
        onContinueReady,
        task,
        beneficiary,
        callEntries,
        contactRole,
        name,
        setTask,
        phone,
        relationshipToOwner,
        callSummary,
        correlationId,
        setSubmitFailed,
        goToNext,
        country,
        dynamicKey,
        taskActions,
    ]);

    useEffect(() => {
        if (
            !name ||
            filteredCallLogs.length === 0 ||
            contactRole === ContactRole.OTHER
        ) {
            return;
        }
        const selectedLog = filteredCallLogs.find(
            (log) => log.fullName + log.id === name
        );
        setPhone(
            selectedLog?.phone ? (selectedLog.phone as Phone) : ({} as Phone)
        );
    }, [name, filteredCallLogs, contactRole]);

    useEffect(() => {
        if (contactRole && name) {
            updateCurrentCallEntry();
        }
    }, [
        contactRole,
        name,
        phone,
        callSummary,
        taskActions,
        updateCurrentCallEntry,
    ]);

    useEffect(() => {
        if (!contactRole || !task?.data?.details?.[dynamicKey]?.callLogs) {
            return;
        }
        const callLogs = task.data.details[dynamicKey].callLogs as CallLog[];
        const updatedCallLogs = callLogs.map((log: CallLog, index: number) => {
            const taskActions =
                log?.contactEstablished === true
                    ? [TaskActions.CONTACT_ESTABLISHED]
                    : [];
            return { ...log, taskActions, id: String(index) };
        });

        const filtered = updatedCallLogs.filter(
            (log: CallLog & { id: string }) => {
                if (
                    contactRole === ContactRole.AGENT &&
                    log.partyRoleCategory === ContactRole.AGENT
                ) {
                    return true;
                }
                return contactRole === log.partyRole;
            }
        );

        setFilteredCallLogs(filtered);
    }, [contactRole, task, dynamicKey]);

    useEffect(() => {
        if (
            filteredCallLogs.length === 1 &&
            contactRole !== ContactRole.OTHER
        ) {
            setName(filteredCallLogs[0].fullName);
        }
    }, [filteredCallLogs, contactRole]);

    useEffect(() => {
        validateForm();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        contactRole,
        phone,
        name,
        beneficiary,
        addressSelected,
        relationshipToOwner,
        callSummary,
        taskActions,
    ]);

    const handleTaskActions = (value: string) => {
        if (isNullEmptyOrUndefined(value)) {
            setTaskActions([]);
        } else {
            setTaskActions([value as TaskActions]);
        }
    };

    const notifier = task.data.details[dynamicKey]?.notifiers ?? null;
    const showChangeTypeSection =
        (beneficiary.changeRequire &&
            taskActions.includes(TaskActions.CONTACT_ESTABLISHED) &&
            contactRole &&
            name &&
            phone.dialNumber &&
            callSummary) ||
        (readOnly && beneficiary.changeRequire);

    return (
        <div>
            <div className="my-2 mb-4 flex flex-row items-center space-x-3">
                <Label>{t('contractNumber')}:</Label>
                <Content
                    variant={ContentVariant.BodySm}
                    details={contractNumber}
                    pii={true}
                />
            </div>
            {notifier ? <NotifierDetails notifier={notifier} /> : null}
            <DisplayCompletedCalls
                task={task}
                t={t}
                changeRequire={beneficiary.changeRequire || false}
            />

            {/* Current call entry form */}
            <div className="grid grid-cols-4 gap-4">
                {!readOnly && (
                    <SelectComponent
                        value={contactRole}
                        label={t('contactRoleLabel') as string}
                        options={contactRoleOptions}
                        onChange={(newValue) => {
                            if (typeof newValue === 'string') {
                                setName('');
                                setPhone({} as Phone);
                                setContactRole(newValue);
                                setRelationshipToOwner('');
                            }
                        }}
                        required={true}
                        message={formErrors.contractRoleRequired}
                        variant={
                            formErrors.contractRoleRequired
                                ? FieldVariant.Error
                                : FieldVariant.Default
                        }
                    />
                )}
            </div>

            <div className="grid grid-cols-4 gap-4 mt-4">
                {contactRole !== ContactRole.OTHER &&
                    filteredCallLogs.length > 0 && (
                        <>
                            <SelectComponent
                                label={t('name') as string}
                                className="my-1"
                                value={name}
                                onChange={(newValue) => {
                                    if (typeof newValue === 'string') {
                                        setName(newValue);
                                        const selectedLog =
                                            filteredCallLogs.find(
                                                (log) =>
                                                    log.fullName + log.id ===
                                                    newValue
                                            );

                                        if (selectedLog?.phone) {
                                            setPhone(
                                                selectedLog.phone as Phone
                                            );
                                        }
                                    }
                                }}
                                options={filteredCallLogs.map((log) => ({
                                    id: log.id,
                                    value: `${log.fullName + log.id}`,
                                    label: log.fullName,
                                    textValue: log.fullName,
                                }))}
                                required={true}
                                message={formErrors.nameRequired}
                                variant={
                                    formErrors.nameRequired
                                        ? FieldVariant.Error
                                        : FieldVariant.Default
                                }
                            />
                            <div>
                                <TextField
                                    id="phone"
                                    onChange={NOOP}
                                    placeholder={t('phone') as string}
                                    disabled={true}
                                    value={formatPhone(phone)}
                                    label={t('phone') as string}
                                    className="w-full"
                                    required={true}
                                />
                            </div>
                        </>
                    )}

                {contactRole === ContactRole.OTHER && (
                    <>
                        <div>
                            <Field
                                label={t('name') as string}
                                message={formErrors?.nameRequired}
                                onChange={(e) => setName(e.target.value)}
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                                value={name}
                                variant={
                                    formErrors?.nameRequired
                                        ? FieldVariant.Error
                                        : FieldVariant.Default
                                }
                                required
                            />
                        </div>
                        <div>
                            <PhoneNumber
                                title={false}
                                label={t('phone') as string}
                                country={country}
                                phone={phone}
                                setCountry={setCountry}
                                setPhone={setPhone}
                            />
                            {formErrors?.phoneRequired && (
                                <div className="mt-4">
                                    <AssistiveText
                                        text={formErrors?.phoneRequired}
                                        variant={AssistiveTextVariant.Error}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="col-span-1 ml-10">
                            <Field
                                label={t('relationshipToOwner') as string}
                                message={
                                    formErrors?.relationshipToOwnerRequired
                                }
                                onChange={(e) =>
                                    setRelationshipToOwner(e.target.value)
                                }
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                                value={relationshipToOwner}
                                variant={
                                    formErrors?.relationshipToOwnerRequired
                                        ? FieldVariant.Error
                                        : FieldVariant.Default
                                }
                                required
                            />
                        </div>
                    </>
                )}

                {!readOnly && contactRole && (
                    <>
                        <div className="col-span-3 gap-4">
                            <Field
                                label={t('callSummary') as string}
                                message={formErrors?.callSummaryRequired}
                                onChange={(e) => setCallSummary(e.target.value)}
                                size={FieldSize.Small}
                                type={FieldType.BaseActive}
                                value={callSummary}
                                variant={
                                    formErrors?.callSummaryRequired
                                        ? FieldVariant.Error
                                        : FieldVariant.Default
                                }
                                required
                            />
                        </div>
                        <div className="col-span-4 mt-4">
                            <Radio
                                label={t('wasContactEstablished') as string}
                                items={[
                                    {
                                        label: t('yes'),
                                        value: TaskActions.CONTACT_ESTABLISHED,
                                    },
                                    {
                                        label: t('no'),
                                        value: '',
                                    },
                                ]}
                                readonly={readOnly}
                                disabled={readOnly}
                                value={taskActions?.[0] ?? ''}
                                onChange={(event) => {
                                    handleTaskActions(event.target.value);
                                }}
                                required={true}
                            />
                            {formErrors?.contactEstablishedRequired && (
                                <div className="mt-4">
                                    <AssistiveText
                                        text={
                                            formErrors?.contactEstablishedRequired
                                        }
                                        variant={AssistiveTextVariant.Error}
                                    />
                                </div>
                            )}
                        </div>
                    </>
                )}

                {shouldRenderChangeRequire() && (
                    <div className="col-span-4 mt-4">
                        <Radio
                            label={t('didYouMakeAnyChanges') as string}
                            items={[
                                { label: t('yes'), value: 'true' },
                                {
                                    label: t('noChangesRequired'),
                                    value: 'false',
                                },
                            ]}
                            readonly={readOnly}
                            disabled={readOnly}
                            value={beneficiary.changeRequire?.toString()}
                            onChange={(event) =>
                                setBeneficiary({
                                    ...beneficiary,
                                    changeRequire:
                                        event.target.value === 'true',
                                })
                            }
                            required={true}
                        />
                        {formErrors?.changeRequireRequired && (
                            <div className="mt-4">
                                <AssistiveText
                                    text={formErrors?.changeRequireRequired}
                                    variant={AssistiveTextVariant.Error}
                                />
                            </div>
                        )}
                    </div>
                )}

                {(beneficiary.changeRequire === false ||
                    !taskActions.includes(TaskActions.CONTACT_ESTABLISHED)) &&
                    contactRole &&
                    name &&
                    callSummary && (
                        <div className="col-span-1 mt-4">
                            <Button
                                variant={ButtonVariant.Default}
                                type={ButtonType.Secondary}
                                size={ButtonSize.Small}
                                onClick={addNewCallEntry}
                            >
                                {t('addAnotherCall')}
                            </Button>
                        </div>
                    )}

                {showChangeTypeSection ? (
                    <>
                        <div className="mt-4 col-span-4">
                            <SelectComponent
                                label={t('newInformation') as string}
                                disabled={readOnly}
                                className="my-1 max-w-[250px]"
                                value={beneficiary.changeType || ''}
                                onChange={(newValue) => {
                                    if (typeof newValue === 'string') {
                                        const isNotificationChange =
                                            newValue ===
                                            ChangeTypeEnum.BENEFICIARY_DECEASED;
                                        const newAction = getAction(
                                            prevBeneficiary,
                                            beneficiary
                                        );
                                        setBeneficiary((prev) => ({
                                            ...prev,
                                            changeType:
                                                newValue as ChangeTypeEnum,
                                            beneDeceased: isNotificationChange,
                                            notificationPreferences: {
                                                ...prev.notificationPreferences,
                                                notificationMethod: {
                                                    method: task?.data
                                                        ?.details?.[dynamicKey]
                                                        ?.beneficiary
                                                        ?.notificationPreferences
                                                        ?.notificationMethod
                                                        ?.method,
                                                    action: newAction,
                                                },
                                            },
                                        }));
                                    }
                                }}
                                options={changeTypeOptions}
                                required={true}
                                message={formErrors.changeTypeRequired}
                                variant={
                                    formErrors.changeTypeRequired
                                        ? FieldVariant.Error
                                        : FieldVariant.Default
                                }
                            />
                        </div>

                        {beneficiary.changeType ===
                            ChangeTypeEnum.BENEFICIARY_DECEASED && (
                            <BeneficiaryDeceased
                                t={t}
                                beneficiary={beneficiary}
                                setBeneficiary={setBeneficiary}
                                readOnly={readOnly}
                            />
                        )}

                        {beneficiary.changeType ===
                            ChangeTypeEnum.BENEFICIARY_NOTIFICATION_CHANGE && (
                            <BeneficiaryNotificationChange
                                t={t}
                                readOnly={readOnly}
                                beneficiary={beneficiary}
                                setBeneficiary={setBeneficiary}
                                task={task}
                                setAddressSelected={setAddressSelected}
                                dynamicKey={dynamicKey}
                            />
                        )}

                        {formErrors?.submit && (
                            <AssistiveText
                                text={formErrors?.submit}
                                variant={AssistiveTextVariant.Error}
                                className="mt-2"
                            />
                        )}
                    </>
                ) : null}
            </div>
        </div>
    );
}

export default CallForInformation;
