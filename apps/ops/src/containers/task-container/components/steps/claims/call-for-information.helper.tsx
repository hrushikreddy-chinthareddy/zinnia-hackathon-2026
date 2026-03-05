import { countries } from 'countries-list';
import { TFunction } from 'i18next';
import { useCallback } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import {
    ClaimActionTypes,
    ClaimCommunicationTypes,
} from '@deps/containers/death-claim-container/death-claim.types';
import {
    validateEmail,
    validateFax,
} from '@deps/containers/death-claim-container/steps/notification-method/notification-method.helpers';
import { lowerCaseJson } from '@deps/containers/death-claim-container/update-notification-method/update-notification-method-helper';
import { TaskActions } from '@deps/contexts/UpdateNotificationMethodContext';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { TaskStatus } from '@deps/models/case/task-instance';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { Phone } from '@zinnia/api-types/types/sor';

import {
    CallEntry,
    CallLog,
    ChangeTypeEnum,
    ContactRole,
    UpdatedBeneficiaryRecord,
} from './claims.type';

interface CallForInformationProps {
    task: any;
    country: keyof typeof countries;
    contactRole: string;
    name: string;
    phone: Phone;
    callSummary: string;
    setTask: React.Dispatch<React.SetStateAction<any>>;
    setName: React.Dispatch<React.SetStateAction<string>>;
    setPhone: React.Dispatch<React.SetStateAction<Phone>>;
    setContactRole: React.Dispatch<React.SetStateAction<string>>;
    setCallSummary: React.Dispatch<React.SetStateAction<string>>;
    relationshipToOwner: string;
    t: TFunction<TranslationFiles.COMMON, { keyPrefix: string }>;
    dynamicKey: string;
    setCallEntries: React.Dispatch<React.SetStateAction<CallEntry[]>>;
    callEntries: CallEntry[];
    setBeneficiary: React.Dispatch<
        React.SetStateAction<UpdatedBeneficiaryRecord>
    >;
    beneficiary: UpdatedBeneficiaryRecord;
    setFormErrors: (errors: FormValidationErrors) => void;
    addressSelected: boolean;
    taskActions: TaskActions[];
    setTaskActions(actions: TaskActions[]): void;
}

export function CallForInformationFunctions({
    task,
    setTask,
    contactRole,
    name,
    setName,
    phone,
    callSummary,
    setPhone,
    setContactRole,
    relationshipToOwner,
    country,
    setBeneficiary,
    t,
    setCallEntries,
    callEntries,
    beneficiary,
    setFormErrors,
    dynamicKey,
    addressSelected,
    setCallSummary,
    taskActions,
    setTaskActions,
}: CallForInformationProps) {
    const contactRoleOptions = [
        {
            value: ContactRole.AGENT,
            label: t('contactRoles.agent'),
            textValue: t('contactRoles.agent'),
            disabled: !task?.data?.details?.[dynamicKey]?.callLogs?.some(
                (log: CallLog) => log.partyRoleCategory === ContactRole.AGENT
            ),
        },
        {
            value: ContactRole.PRIMARYBENEFICIARY,
            label: t('contactRoles.beneficiary'),
            textValue: t('contactRoles.beneficiary'),
            disabled: !task?.data?.details?.[dynamicKey]?.callLogs?.some(
                (log: CallLog) =>
                    log.partyRole === ContactRole.PRIMARYBENEFICIARY
            ),
        },
        {
            value: ContactRole.OTHER,
            label: t('contactRoles.other'),
            textValue: t('contactRoles.other'),
            disabled: false,
        },
    ];

    const changeTypeOptions = [
        {
            value: ChangeTypeEnum.BENEFICIARY_NOTIFICATION_CHANGE,
            label: t('changeTypes.beneficiaryNotificationChange'),
            textValue: t('changeTypes.beneficiaryNotificationChange'),
        },
        {
            value: ChangeTypeEnum.BENEFICIARY_DECEASED,
            label: t('changeTypes.beneficiaryDeceased'),
            textValue: t('changeTypes.beneficiaryDeceased'),
        },
    ];

    const addNewCallEntry = () => {
        const updatedTask = updateCallLogs(
            task,
            dynamicKey,
            callEntries.length,
            contactRole,
            name,
            phone,
            country,
            relationshipToOwner,
            callSummary,
            taskActions
        );
        setTask(updatedTask);
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
                callSummary: '',
                taskActions: [],
            },
        ]);
        setBeneficiary((prev: UpdatedBeneficiaryRecord) => ({
            ...prev,
            changeRequire: null,
        }));
        setContactRole('');
        setName('');
        setPhone({} as Phone);
        setCallSummary('');
        setTaskActions([]);
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
                        callSummary,
                        taskActions,
                    },
                ];
            });
        }
    }, [contactRole, name, phone, setCallEntries, callSummary, taskActions]);

    const getMaxCallSequenceObject = (arr: CallLog[]) =>
        arr
            .filter((obj: CallLog) => typeof obj.callSequence === 'number')
            .reduce((maxObj: CallLog | null, curr: CallLog) => {
                if (!maxObj) return curr;
                return curr.callSequence > maxObj?.callSequence ? curr : maxObj;
            }, null);

    const shouldRenderChangeRequire = () => {
        if (task.status === TaskStatus.Completed) {
            const latestCallLog = getMaxCallSequenceObject(
                task.data?.details?.[dynamicKey]?.callLogs
            );
            // Check if this is a legacy task created before the 'contactEstablished' was introduced
            return latestCallLog?.taskActions?.includes(
                TaskActions.CONTACT_ESTABLISHED
            );
        }

        const showChangeRequireField =
            name &&
            phone.dialNumber &&
            contactRole &&
            callSummary &&
            taskActions.includes(TaskActions.CONTACT_ESTABLISHED);
        switch (contactRole === ContactRole.OTHER) {
            case true: {
                return showChangeRequireField && relationshipToOwner;
            }
            case false: {
                return showChangeRequireField;
            }
        }
    };

    function updateCallLogs(
        task: any,
        dynamicKey: string,
        callEntriesLength: number,
        contactRole: string,
        name: string,
        phone: Phone,
        country: keyof typeof countries,
        relationshipToOwner: string,
        callSummary: string,
        taskActions: TaskActions[]
    ) {
        const updatedTask = { ...task };

        if (!updatedTask.data.details[dynamicKey].callLogs) {
            updatedTask.data.details[dynamicKey].callLogs = [];
        }

        const callLogs = updatedTask.data.details[dynamicKey].callLogs;

        const logIndex = callLogs.findIndex(
            (log: CallLog, index: number) =>
                log.fullName + index === name &&
                (contactRole === ContactRole.AGENT
                    ? log.partyRoleCategory === ContactRole.AGENT
                    : log.partyRole === contactRole)
        );

        if (logIndex !== -1 && contactRole !== ContactRole.OTHER) {
            callLogs[logIndex] = {
                ...callLogs[logIndex],
                callSequence: callEntriesLength,
                callSummary: callSummary,
                callDone: true,
                taskActions: taskActions,
            };
        } else {
            if (contactRole === ContactRole.OTHER) {
                callLogs.push({
                    fullName: name,
                    partyRole: contactRole,
                    callSequence: callEntriesLength,
                    phone: { ...phone, countryCode: countries[country].phone },
                    partyRoleCategory: contactRole,
                    relationshipToInsured: relationshipToOwner,
                    callSummary: callSummary,
                    taskActions: taskActions,
                    callDone: true,
                });
            }
        }

        return updatedTask;
    }

    const validateForm = () => {
        const errors: FormValidationErrors = {};

        if (!contactRole) {
            errors['contractRoleRequired'] = t(
                'errors.contractRoleRequired'
            ) as string;
            setFormErrors(errors);
            return Object.keys(errors).length === 0;
        }

        if (isNullEmptyOrUndefined(name.trim())) {
            errors['nameRequired'] = t('errors.nameRequired') as string;
        } else {
            errors['nameRequired'] = '';
        }

        if (isNullEmptyOrUndefined(phone.dialNumber)) {
            errors['phoneRequired'] = t('errors.phoneRequired') as string;
        } else {
            errors['phoneRequired'] = '';
        }

        if (
            contactRole === ContactRole.OTHER &&
            isNullEmptyOrUndefined(relationshipToOwner.trim())
        ) {
            errors['relationshipToOwnerRequired'] = t(
                'errors.relationshipToOwner'
            ) as string;
        } else {
            errors['relationshipToOwnerRequired'] = '';
        }

        if (isNullEmptyOrUndefined(callSummary.trim())) {
            errors['callSummaryRequired'] = t(
                'errors.callSummaryRequired'
            ) as string;
        } else {
            errors['callSummaryRequired'] = '';
        }

        if (
            taskActions.includes(TaskActions.CONTACT_ESTABLISHED) &&
            isNullEmptyOrUndefined(beneficiary.changeRequire)
        ) {
            errors['changeRequireRequired'] = t(
                'errors.changeRequireRequired'
            ) as string;
        } else {
            errors['changeRequireRequired'] = '';
            errors['changeTypeRequired'] = '';
            errors['submit'] = '';
        }

        if (beneficiary.changeRequire && !beneficiary.changeType) {
            errors['changeTypeRequired'] = t(
                'errors.changeTypeRequired'
            ) as string;
        } else {
            errors['changeTypeRequired'] = '';
            errors['submit'] = '';
        }

        if (beneficiary.changeRequire === false) {
            errors['changeTypeRequired'] = '';
            errors['submit'] = '';
        }

        if (
            beneficiary.changeRequire &&
            beneficiary.changeType ===
                ChangeTypeEnum.BENEFICIARY_NOTIFICATION_CHANGE
        ) {
            if (
                beneficiary.notificationPreferences.notificationMethod
                    .method === ClaimCommunicationTypes.Mail &&
                !addressSelected
            ) {
                errors['submit'] = t('errors.addressIsRequired') as string;
            }

            if (
                beneficiary.notificationPreferences.notificationMethod
                    .method === ClaimCommunicationTypes.Email
            ) {
                const emailError = validateEmail(
                    beneficiary.notificationPreferences.email?.emailAddress
                );
                if (emailError) {
                    errors['submit'] = t(emailError) as string;
                }
            }

            if (
                beneficiary.notificationPreferences.notificationMethod
                    .method === ClaimCommunicationTypes.Fax
            ) {
                const faxError = validateFax(
                    beneficiary.notificationPreferences.fax?.faxNumber
                );
                if (faxError) {
                    errors['submit'] = t(faxError) as string;
                }
            }
        } else {
            errors['submit'] = '';
        }

        const asArray = Object.entries(errors);
        const filterCb = asArray.filter(([_, value]) => value !== '');
        const filteredErrors = Object.fromEntries(filterCb);
        setFormErrors(filteredErrors);
        return Object.keys(errors).length === 0;
    };

    const applyBeneficiaryChanges = () => {
        const beneficiaryChangeDetail =
            task?.data?.details?.[dynamicKey]?.beneficiaryChangeDetail;
        if (beneficiaryChangeDetail) {
            setBeneficiary((prev) => ({
                ...prev,
                ...beneficiaryChangeDetail,
                notificationPreferences: {
                    ...prev.notificationPreferences,
                    ...beneficiaryChangeDetail.notificationPreferences,
                    notificationMethod: {
                        ...prev.notificationPreferences?.notificationMethod,
                        ...beneficiaryChangeDetail.notificationPreferences
                            ?.notificationMethod,
                    },
                    email: {
                        ...prev.notificationPreferences?.email,
                        ...beneficiaryChangeDetail.notificationPreferences
                            ?.email,
                    },
                    address: {
                        ...prev.notificationPreferences?.address,
                        ...beneficiaryChangeDetail.notificationPreferences
                            ?.address,
                    },
                },
            }));
        }
    };

    return {
        updateCurrentCallEntry,
        contactRoleOptions,
        changeTypeOptions,
        addNewCallEntry,
        updateCallLogs,
        shouldRenderChangeRequire,
        validateForm,
        applyBeneficiaryChanges,
    };
}

export const getAction = (
    prevBeneficiary: UpdatedBeneficiaryRecord | undefined,
    currentBeneficiary: UpdatedBeneficiaryRecord
) => {
    const notificationPrefs = prevBeneficiary?.notificationPreferences;
    const originalEmail = (notificationPrefs?.email?.emailAddress || '').trim();
    const originalFax = (notificationPrefs?.fax?.faxNumber || '').trim();
    const originalAddress = notificationPrefs?.address || {};
    const prevMethod = notificationPrefs?.notificationMethod?.method;

    const currentNotificationPrefs = currentBeneficiary.notificationPreferences;
    const currentEmail = (
        currentNotificationPrefs?.email?.emailAddress || ''
    ).trim();
    const currentFax = (currentNotificationPrefs?.fax?.faxNumber || '').trim();
    const currentAddress = currentNotificationPrefs?.address || {};
    const method = currentNotificationPrefs.notificationMethod.method;

    let action = ClaimActionTypes.NONE;
    switch (method) {
        case ClaimCommunicationTypes.Fax:
            action =
                originalFax !== currentFax
                    ? ClaimActionTypes.UPDATE
                    : ClaimActionTypes.NONE;
            break;
        case ClaimCommunicationTypes.Email:
            action =
                originalEmail.toLowerCase() !== currentEmail.toLowerCase()
                    ? ClaimActionTypes.UPDATE
                    : ClaimActionTypes.NONE;
            break;
        case ClaimCommunicationTypes.Mail:
            action =
                lowerCaseJson(originalAddress) !== lowerCaseJson(currentAddress)
                    ? ClaimActionTypes.UPDATE
                    : ClaimActionTypes.NONE;
            break;
    }
    if (method !== prevMethod) {
        action = ClaimActionTypes.UPDATE;
    }
    return action;
};
