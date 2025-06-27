import { Phone } from '@xd/api-types/dist/generated-types/sor';
import { Label } from '@zinnia/bloom/components';
import { countries } from 'countries-list';
import { TFunction } from 'i18next';
import { useState, useEffect, useCallback } from 'react';

import Button, {
    ButtonSize,
    ButtonType,
    ButtonVariant,
} from '@deps/components/button/button';
import Radio from '@deps/components/radio/radio';
import SelectComponent from '@deps/components/select/select';
import { TranslationFiles } from '@deps/config/translations';
import PhoneNumber from '@deps/containers/address-change-container/components/contact-details/phone-number';
import {
    ClaimActionTypes,
    ClaimCommunicationTypes,
} from '@deps/containers/death-claim-container/death-claim.types';
import { updateTask } from '@deps/containers/task-container/task.helpers';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { formatPhone } from '@deps/helpers/string.helpers';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

import BeneficiaryDeceased from './beneficiary-deceased';
import BeneficiaryNotificationChange from './beneficiary-notification-change';
import {
    CallEntry,
    CallLog,
    ChangeTypeEnum,
    ContactRole,
    UpdatedBeneficiaryRecord,
} from './claims.type';
import { DisplayCompletedCalls } from './display-completed-calls';
import styles from '../../../../../components/dynamic-form/components/text-field/text-field.module.css';

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

    const dynamicKey = task?.data?.details?.beneCall
        ? 'beneCall'
        : 'benefinalcontactattempt';
    const [contactRole, setContactRole] = useState('');
    const [filteredCallLogs, setFilteredCallLogs] = useState<CallLog[]>([]);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState<Phone>({} as Phone);
    const [country, setCountry] = useState<keyof typeof countries>('US');
    const [relationshipToOwner, setRelationshipToOwner] = useState('');
    const [addressSelected, setAddressSelected] = useState(false);

    const { goToNext } = useWorkflow();

    const contactRoleOptions = [
        {
            value: ContactRole.AGENT,
            label: ' Agent',
            textValue: t('contactRoles.agent'),
            disabled: !task?.data?.details?.beneCall?.callLogs?.some(
                (log: CallLog) => log.partyRoleCategory === ContactRole.AGENT
            ),
        },
        {
            value: ContactRole.PRIMARYBENEFICIARY,
            label: 'Beneficiary',
            textValue: t('contactRoles.beneficiary'),
            disabled: !task?.data?.details?.beneCall?.callLogs?.some(
                (log: CallLog) =>
                    log.partyRole === ContactRole.PRIMARYBENEFICIARY
            ),
        },
        {
            value: ContactRole.OTHER,
            label: 'Other',
            textValue: t('contactRoles.other'),
            disabled: false,
        },
    ];
    const changeTypeOptions = [
        {
            value: 'BENEFICIARY_NOTIFICATION_CHANGE',
            label: 'Beneficiary Notification Change',
            textValue: t('changeTypes.beneficiaryNotificationChange'),
        },
        {
            value: 'BENEFICIARY_DECEASED',
            label: 'Beneficiary Deceased',
            textValue: t('changeTypes.beneficiaryDeceased'),
        },
    ];

    useEffect(() => {
        const handleContinue = async () => {
            const updatedTask = { ...task };
            updatedTask.data.details[dynamicKey].beneficiaryChangeDetail = {
                ...beneficiary,
            };

            let maxCallSequence = 0;
            for (const log of task.data.details[dynamicKey].callLogs || []) {
                if (log.callSequence > maxCallSequence) {
                    maxCallSequence = log.callSequence;
                }
            }

            if (
                task?.data?.details?.[dynamicKey]?.callLogs &&
                task.data.details[dynamicKey].callLogs.length > 0
            ) {
                const logIndex = task.data.details[
                    dynamicKey
                ].callLogs.findIndex(
                    (log: CallLog) =>
                        log.fullName === name &&
                        (contactRole === ContactRole.AGENT
                            ? log.partyRoleCategory === ContactRole.AGENT
                            : log.partyRole === contactRole)
                );
                if (logIndex !== -1) {
                    updatedTask.data.details[dynamicKey].callLogs[logIndex] = {
                        ...updatedTask.data.details[dynamicKey].callLogs[
                            logIndex
                        ],
                        callSequence: maxCallSequence + 1,
                        callDone: true,
                    };
                } else {
                    contactRole === ContactRole.OTHER &&
                        updatedTask.data.details[dynamicKey].callLogs.push({
                            fullName: name,
                            partyRole: contactRole,
                            callSequence: maxCallSequence + 1,
                            phone: {
                                ...phone,
                                countryCode: countries[country].phone,
                            },
                            partyRoleCategory: contactRole,
                            relationshipToInsured: relationshipToOwner,
                            callDone: true,
                        });
                }
            } else {
                const updatedTask = { ...task };
                updatedTask.data.details[dynamicKey].callLogs = [];
                contactRole === ContactRole.OTHER &&
                    updatedTask.data.details[dynamicKey].callLogs.push({
                        fullName: name,
                        partyRole: contactRole,
                        callSequence: callEntries.length,
                        phone: {
                            ...phone,
                            countryCode: countries[country].phone,
                        },
                        partyRoleCategory: contactRole,
                        relationshipToInsured: relationshipToOwner,
                        callDone: true,
                    });
                setTask(updatedTask);
            }

            if (dynamicKey === 'benefinalcontactattempt') {
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

    const addNewCallEntry = () => {
        if (
            task?.data?.details?.[dynamicKey]?.callLogs &&
            task.data.details[dynamicKey].callLogs.length > 0
        ) {
            const logIndex = task.data.details[dynamicKey].callLogs.findIndex(
                (log: CallLog) =>
                    log.fullName === name &&
                    (contactRole === ContactRole.AGENT
                        ? log.partyRoleCategory === ContactRole.AGENT
                        : log.partyRole === contactRole)
            );

            if (logIndex !== -1) {
                const updatedTask = { ...task };
                updatedTask.data.details[dynamicKey].callLogs[logIndex] = {
                    ...updatedTask.data.details[dynamicKey].callLogs[logIndex],
                    callSequence: callEntries.length,
                    callDone: true,
                };

                setTask(updatedTask);
            } else {
                const updatedTask = { ...task };
                contactRole === ContactRole.OTHER &&
                    updatedTask.data.details[dynamicKey].callLogs.push({
                        fullName: name,
                        partyRole: contactRole,
                        callSequence: callEntries.length,
                        phone: {
                            ...phone,
                            countryCode: countries[country].phone,
                        },
                        partyRoleCategory: contactRole,
                        relationshipToInsured: relationshipToOwner,
                        callDone: true,
                    });

                setTask(updatedTask);
            }
        } else {
            const updatedTask = { ...task };
            updatedTask.data.details[dynamicKey].callLogs = [];
            contactRole === ContactRole.OTHER &&
                updatedTask.data.details[dynamicKey].callLogs.push({
                    fullName: name,
                    partyRole: contactRole,
                    callSequence: callEntries.length,
                    phone: { ...phone, countryCode: countries[country].phone },
                    partyRoleCategory: contactRole,
                    relationshipToInsured: relationshipToOwner,
                    callDone: true,
                });
            setTask(updatedTask);
        }

        // Save the completed call and add a new empty entry
        setCallEntries((prev) => [
            ...prev,
            {
                id:
                    prev.length > 0
                        ? Math.max(...prev.map((entry) => entry.id)) + 1
                        : 1,
                contactRole: '',
                name: '',
                phone: {} as Phone,
            },
        ]);
        setBeneficiary((prev: UpdatedBeneficiaryRecord) => ({
            ...prev,
            changeRequire: null,
        }));
        setContactRole('');
        setName('');
        setPhone({} as Phone);
    };

    const updateCurrentCallEntry = useCallback(() => {
        if (contactRole && name) {
            setCallEntries((prev) => {
                const lastEntry = prev[prev.length - 1];
                return [
                    ...prev.slice(0, prev.length - 1),
                    {
                        ...lastEntry,
                        contactRole,
                        name,
                        phone,
                    },
                ];
            });
        }
    }, [contactRole, name, phone]);

    useEffect(() => {
        if (name && filteredCallLogs.length > 0) {
            const selectedLog = filteredCallLogs.find(
                (log) => log.fullName === name
            );
            if (selectedLog?.phone) {
                setPhone(selectedLog.phone as Phone);
            } else {
                setPhone({} as Phone);
            }
        }
    }, [name, filteredCallLogs]);

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

    const validateAddress = () => {
        const errors: FormValidationErrors = {};

        if (dynamicKey !== 'benefinalcontactattempt') {
            if (!contactRole || !phone.dialNumber || !name) {
                errors['mandatoryField'] =
                    'Missing contactRole or phone or name or changeType ';
            }
        }
        if (contactRole) {
            if (
                !phone.dialNumber ||
                !name ||
                beneficiary.changeRequire === null
            ) {
                errors['mandatoryField'] = 'Missing phone or name';
            }
        }
        if (contactRole === ContactRole.OTHER && !relationshipToOwner) {
            errors['mandatoryField'] = 'Missing relationshipToOwner';
        }
        if (beneficiary.changeRequire && !beneficiary.changeType) {
            errors['mandatoryField'] = 'Missing changeType';
        }

        if (
            beneficiary.changeType ===
            ChangeTypeEnum.BENEFICIARY_NOTIFICATION_CHANGE
        ) {
            if (
                beneficiary.notificationPreferences.notificationMethod
                    .method === ClaimCommunicationTypes.Email &&
                !beneficiary.notificationPreferences.email?.emailAddress
            ) {
                errors['mandatoryField'] = 'Missing emailAddress';
            }
            if (
                beneficiary.notificationPreferences.notificationMethod
                    .method === ClaimCommunicationTypes.Fax &&
                !beneficiary.notificationPreferences.fax?.faxNumber
            ) {
                errors['mandatoryField'] = 'Missing faxNumber';
            }
            if (
                beneficiary.notificationPreferences.notificationMethod
                    .method === ClaimCommunicationTypes.Mail &&
                !addressSelected
            ) {
                errors['mandatoryField'] =
                    'Missing addressLine1 or city or state or zipCode';
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    useEffect(() => {
        if (
            filteredCallLogs.length === 1 &&
            contactRole !== ContactRole.OTHER
        ) {
            setName(filteredCallLogs[0].fullName);
        }
    }, [filteredCallLogs, contactRole]);

    useEffect(() => {
        validateAddress();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contactRole, phone, name, beneficiary, addressSelected]);

    const shouldRenderChangeRequire = () => {
        switch (contactRole === ContactRole.OTHER) {
            case true: {
                return (
                    name &&
                    phone.dialNumber &&
                    relationshipToOwner &&
                    contactRole
                );
            }
            case false: {
                return name && phone.dialNumber && contactRole;
            }
        }
    };
    return (
        <div>
            <DisplayCompletedCalls task={task} t={t} />

            {/* Current call entry form */}
            <div className="grid grid-cols-4 gap-4">
                <SelectComponent
                    value={contactRole}
                    label={t('contactRoleLabel') ?? 'Contact Role'}
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
            </div>

            {contactRole !== '' && (
                <div className="grid grid-cols-4 gap-4 mt-5">
                    {contactRole !== ContactRole.OTHER &&
                        filteredCallLogs.length > 0 && (
                            <>
                                <SelectComponent
                                    label={t('name') ?? 'Name'}
                                    className="my-1"
                                    value={name}
                                    onChange={(newValue) => {
                                        if (typeof newValue === 'string') {
                                            setName(newValue);
                                            const selectedLog =
                                                filteredCallLogs.find(
                                                    (log) =>
                                                        log.fullName ===
                                                        newValue
                                                );
                                            if (selectedLog?.phone) {
                                                setPhone(
                                                    selectedLog.phone as any
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
                                    <Label labelFor="phone">{t('phone')}</Label>

                                    <div className={styles.textField}>
                                        {formatPhone(phone)}
                                    </div>
                                </div>
                            </>
                        )}

                    {contactRole === ContactRole.OTHER && (
                        <>
                            <div>
                                <Label labelFor="name">
                                    {t('name') ?? 'Name'}
                                </Label>
                                <input
                                    type="text"
                                    key={`name-input-${callEntries.length}`}
                                    placeholder={t('name') ?? 'Name'}
                                    className={`${styles.textField} w-full`}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="mt-1">
                                <PhoneNumber
                                    title={false}
                                    label={t('phone') ?? 'Phone'}
                                    country={country}
                                    phone={phone}
                                    setCountry={setCountry}
                                    setPhone={setPhone}
                                />
                            </div>

                            <div className="col-span-1 ml-10">
                                <Label labelFor="relationshipToOwner">
                                    {t('relationshipToOwner')}
                                </Label>
                                <input
                                    type="text"
                                    id="relationshipToOwner"
                                    placeholder={
                                        t('relationshipToOwner') ??
                                        'Relationship to Owner'
                                    }
                                    className={`${styles.textField} w-full`}
                                    value={relationshipToOwner}
                                    onChange={(e) =>
                                        setRelationshipToOwner(e.target.value)
                                    }
                                />
                            </div>
                        </>
                    )}

                    {shouldRenderChangeRequire() && (
                        <div className="col-span-4 mt-4">
                            <Radio
                                label={
                                    t('didYouMakeAnyChanges') ??
                                    'Did you make any changes to the system of record?'
                                }
                                items={[
                                    { label: t('yes'), value: 'true' },
                                    {
                                        label: t('noChangesRequired'),
                                        value: 'false',
                                    },
                                ]}
                                value={beneficiary.changeRequire?.toString()}
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
                    {beneficiary.changeRequire === false &&
                        contactRole &&
                        name && (
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

                    {beneficiary.changeRequire &&
                        contactRole &&
                        name &&
                        phone.dialNumber && (
                            <>
                                <div className="mt-4 col-span-4">
                                    <SelectComponent
                                        label={
                                            t('newInformation') ??
                                            'New Information'
                                        }
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
                                                    beneDeceased:
                                                        isNotificationChange,
                                                    notificationPreferences: {
                                                        ...prev.notificationPreferences,
                                                        notificationMethod: {
                                                            method: task?.data
                                                                ?.details?.[
                                                                dynamicKey
                                                            ]?.beneficiary
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
                                    />
                                )}

                                {beneficiary.changeType ===
                                    ChangeTypeEnum.BENEFICIARY_NOTIFICATION_CHANGE && (
                                    <>
                                        <BeneficiaryNotificationChange
                                            t={t}
                                            beneficiary={beneficiary}
                                            setBeneficiary={setBeneficiary}
                                            task={task}
                                            setAddressSelected={
                                                setAddressSelected
                                            }
                                        />
                                    </>
                                )}
                            </>
                        )}
                </div>
            )}
        </div>
    );
}

export default CallForInformation;
