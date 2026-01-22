import {
    Label,
    AssistiveText,
    AssistiveTextVariant,
} from '@zinnia/bloom/components';
import { countries } from 'countries-list';
import { TFunction } from 'i18next';
import { useState, useEffect } from 'react';

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
import Radio from '@deps/components/radio/radio';
import SelectComponent from '@deps/components/select/select';
import { TranslationFiles } from '@deps/config/translations';
import PhoneNumber from '@deps/containers/address-change-container/components/contact-details/phone-number';
import { ClaimActionTypes } from '@deps/containers/death-claim-container/death-claim.types';
import { updateTask } from '@deps/containers/task-container/task.helpers';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { getCaseIdentifierValue } from '@deps/helpers/case-management';
import {
    deStringifyTrueFalseNull,
    formatPhone,
} from '@deps/helpers/string.helpers';
import { CaseIdentifier } from '@deps/models/case/case';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { NOOP } from '@deps/types/constants';
import { Phone } from '@zinnia/api-types/types/sor';

import BeneficiaryDeceased from './beneficiary-deceased';
import BeneficiaryNotificationChange from './beneficiary-notification-change';
import { CallForInformationFunctions } from './call-for-information.helper';
import {
    CallEntry,
    CallLog,
    ContactRole,
    UpdatedBeneficiaryRecord,
    DynamicKey,
    ChangeTypeEnum,
} from './claims.type';
import { DisplayCompletedCalls } from './display-completed-calls';

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
    t,
}: {
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
}) {
    const [callEntries, setCallEntries] = useState<CallEntry[]>([
        {
            id: 1,
            contactRole: '',
            name: '',
            phone: {} as Phone,
            callSummary: '',
            contactEstablished: '',
        },
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
    const [contactEstablished, setContactEstablished] = useState<string>('');

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
        contactEstablished,
        setContactEstablished,
    });

    const contractNumber =
        getCaseIdentifierValue(
            task.identifiers,
            CaseIdentifier.contractNumber
        ) || '';

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
                contactEstablished
            );

            if (dynamicKey === DynamicKey.BENE_FINAL_CONTACT_ATTEMPT) {
                updatedTask.data.details[
                    dynamicKey
                ].subTaskBeneCallChangeRequire =
                    task?.data?.details?.benefinalcontactattempt?.callLogs?.some(
                        (log: CallLog) => log.contactEstablished === true
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
        contactEstablished,
    ]);

    useEffect(() => {
        if (
            name &&
            filteredCallLogs.length > 0 &&
            contactRole !== ContactRole.OTHER
        ) {
            const selectedLog = filteredCallLogs.find(
                (log) => log.fullName + log.id === name
            );
            if (selectedLog?.phone) {
                setPhone(selectedLog.phone as Phone);
            } else {
                setPhone({} as Phone);
            }
        }
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
        contactEstablished,
        updateCurrentCallEntry,
    ]);

    useEffect(() => {
        if (!contactRole || !task?.data?.details?.[dynamicKey]?.callLogs)
            return;
        const callLogs = task.data.details[dynamicKey].callLogs;
        const updatedCallLogs = callLogs.map((log: CallLog, index: number) => ({
            ...log,
            id: index,
        }));

        const filtered = updatedCallLogs.filter((log: CallLog) => {
            if (
                contactRole === ContactRole.AGENT &&
                log.partyRoleCategory === ContactRole.AGENT
            ) {
                return true;
            } else if (contactRole === log.partyRole) {
                return true;
            }
            return false;
        });

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
        contactEstablished,
    ]);

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
                                    { label: t('yes'), value: 'true' },
                                    {
                                        label: t('no'),
                                        value: 'false',
                                    },
                                ]}
                                readonly={readOnly}
                                disabled={readOnly}
                                value={contactEstablished}
                                onChange={(event) => {
                                    setContactEstablished(event.target.value);
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
                    contactEstablished === 'false') &&
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

                {(beneficiary.changeRequire &&
                    deStringifyTrueFalseNull(contactEstablished) &&
                    contactRole &&
                    name &&
                    phone.dialNumber &&
                    callSummary) ||
                (readOnly && beneficiary.changeRequire) ? (
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
                                                    action: isNotificationChange
                                                        ? ClaimActionTypes.NONE
                                                        : ClaimActionTypes.UPDATE,
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
