import { Phone } from '@xd/api-types/dist/generated-types/sor';
import { countries } from 'countries-list';
import { TFunction } from 'i18next';
import { useState, useEffect } from 'react';

import Button, {
    ButtonSize,
    ButtonType,
    ButtonVariant,
} from '@deps/components/button/button';
import TextField from '@deps/components/dynamic-form/components/text-field/text-field';
import Radio from '@deps/components/radio/radio';
import SelectComponent from '@deps/components/select/select';
import { TranslationFiles } from '@deps/config/translations';
import PhoneNumber from '@deps/containers/address-change-container/components/contact-details/phone-number';
import { ClaimActionTypes } from '@deps/containers/death-claim-container/death-claim.types';
import { updateTask } from '@deps/containers/task-container/task.helpers';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { formatPhone } from '@deps/helpers/string.helpers';
import { TaskStatus } from '@deps/models/case/task-instance';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

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
    setFormErrors,
    beneficiary,
    setBeneficiary,
    t,
}: {
    task: any;
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
        },
    ]);

    const readOnly = task.status === TaskStatus.Completed;
    const dynamicKey = task?.data?.details?.beneCall
        ? DynamicKey.BENE_CALL
        : DynamicKey.BENE_FINAL_CONTACT_ATTEMPT;
    const [contactRole, setContactRole] = useState('');
    const [filteredCallLogs, setFilteredCallLogs] = useState<CallLog[]>([]);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState<Phone>({} as Phone);
    const [country, setCountry] = useState<keyof typeof countries>('US');
    const [relationshipToOwner, setRelationshipToOwner] = useState('');
    const [addressSelected, setAddressSelected] = useState(false);

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
    });

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
                relationshipToOwner
            );
            if (dynamicKey === DynamicKey.BENE_FINAL_CONTACT_ATTEMPT) {
                updatedTask.data.details[
                    dynamicKey
                ].subTaskBeneCallChangeRequire = beneficiary.changeRequire
                    ? true
                    : false;
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
        correlationId,
        setSubmitFailed,
        goToNext,
        country,
        dynamicKey,
    ]);

    useEffect(() => {
        if (
            name &&
            filteredCallLogs.length > 0 &&
            contactRole !== ContactRole.OTHER
        ) {
            const selectedLog = filteredCallLogs.find(
                (log) => log.fullName === name
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
    }, [contactRole, name, phone, updateCurrentCallEntry]);

    useEffect(() => {
        if (!contactRole || !task?.data?.details?.[dynamicKey]?.callLogs)
            return;
        const callLogs = task.data.details[dynamicKey].callLogs;
        const filtered = callLogs.filter((log: CallLog) => {
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
    }, [contactRole, phone, name, beneficiary, addressSelected]);

    return (
        <div>
            <DisplayCompletedCalls task={task} t={t} />

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
                    />
                )}
            </div>

            <div className="grid grid-cols-4 gap-4 mt-5">
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
                                                    log.fullName === newValue
                                            );
                                        if (selectedLog?.phone) {
                                            setPhone(
                                                selectedLog.phone as Phone
                                            );
                                        }
                                    }
                                }}
                                options={filteredCallLogs.map((log) => ({
                                    value: `${log.fullName}`,
                                    label: log.fullName,
                                    textValue: log.fullName,
                                }))}
                            />
                            <div>
                                <TextField
                                    id="phone"
                                    onChange={() => {}}
                                    placeholder={t('phone') as string}
                                    disabled={true}
                                    value={formatPhone(phone)}
                                    label={t('phone') as string}
                                    className="w-full"
                                />
                            </div>
                        </>
                    )}

                {contactRole === ContactRole.OTHER && (
                    <>
                        <div>
                            <TextField
                                id="name"
                                onChange={setName}
                                placeholder={t('name') as string}
                                value={name}
                                label={t('name') as string}
                                className="w-full"
                            />
                        </div>
                        <div className="mt-1">
                            <PhoneNumber
                                title={false}
                                label={t('phone') as string}
                                country={country}
                                phone={phone}
                                setCountry={setCountry}
                                setPhone={setPhone}
                            />
                        </div>

                        <div className="col-span-1 ml-10">
                            <TextField
                                id="relationshipToOwner"
                                onChange={setRelationshipToOwner}
                                placeholder={t('relationshipToOwner') as string}
                                value={relationshipToOwner}
                                label={t('relationshipToOwner') as string}
                                className="w-full"
                            />
                        </div>
                    </>
                )}

                {(shouldRenderChangeRequire() || readOnly) && (
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
                            value={
                                task.taskType === 'DAY_150_REVIEW' &&
                                task.status === TaskStatus.Completed
                                    ? task.data.details.benefinalcontactattempt
                                          .subTaskBeneCallChangeRequire
                                        ? beneficiary.changeRequire?.toString()
                                        : null
                                    : beneficiary.changeRequire?.toString()
                            }
                            onChange={(event) =>
                                setBeneficiary({
                                    ...beneficiary,
                                    changeRequire:
                                        event.target.value === 'true',
                                })
                            }
                        />
                    </div>
                )}

                {beneficiary.changeRequire === false && contactRole && name && (
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
                    contactRole &&
                    name &&
                    phone.dialNumber) ||
                readOnly ? (
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
                            />
                        )}
                    </>
                ) : null}
            </div>
        </div>
    );
}

export default CallForInformation;
