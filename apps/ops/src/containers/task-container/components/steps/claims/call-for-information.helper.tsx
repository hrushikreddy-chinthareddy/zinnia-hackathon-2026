import { Phone } from '@xd/api-types/dist/generated-types/sor';
import { countries } from 'countries-list';
import { TFunction } from 'i18next';
import { useCallback } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { ClaimCommunicationTypes } from '@deps/containers/death-claim-container/death-claim.types';
import {
    validateEmail,
    validateFax,
} from '@deps/containers/death-claim-container/steps/notification-method/notification-method.helpers';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

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
}: CallForInformationProps) {
    const contactRoleOptions = [
        {
            value: ContactRole.AGENT,

            label: t('contactRoles.agent'),

            textValue: t('contactRoles.agent'),
            disabled: !task?.data?.details?.beneCall?.callLogs?.some(
                (log: CallLog) => log.partyRoleCategory === ContactRole.AGENT
            ),
        },
        {
            value: ContactRole.PRIMARYBENEFICIARY,

            label: t('contactRoles.beneficiary'),

            textValue: t('contactRoles.beneficiary'),
            disabled: !task?.data?.details?.beneCall?.callLogs?.some(
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
            callSummary
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
                    },
                ];
            });
        }
    }, [contactRole, name, phone, setCallEntries, callSummary]);

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

    function updateCallLogs(
        task: any,
        dynamicKey: string,
        callEntriesLength: number,
        contactRole: string,
        name: string,
        phone: Phone,
        country: keyof typeof countries,
        relationshipToOwner: string,
        callSummary: string
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

        if (isNullEmptyOrUndefined(beneficiary.changeRequire)) {
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
