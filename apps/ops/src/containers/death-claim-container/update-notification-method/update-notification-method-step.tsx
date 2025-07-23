import { Policy } from '@zinnia/api-types/types/sor';
import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useCallback, useState, useEffect } from 'react';

import Radio from '@deps/components/radio/radio';
import {
    AddressNotificationMethod,
    NotificationsTransactionData,
} from '@deps/components/side-sheet/side-sheet-case-step-details/tabs/bene-notification-tab/bene-notification-tab.types';
import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { useUpdateNotificationMethod } from '@deps/contexts/UpdateNotificationMethodContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { updateNotificationMethod } from '@deps/queries/api/web-non-financial';

import AddressCard from './address-card';
import EmailCard from './email-card';
import FaxCard from './fax-card';
import { buildUpdateNotificationMethodPayload } from './update-notification-method-helper';
import { ClaimCommunicationTypes } from '../death-claim.types';
import {
    validateAddress,
    validateEmail,
    validateFax,
} from '../steps/notification-method/notification-method.helpers';

type UpdateNotificationMethodStepProps = {
    policy: Policy;
    transactionData: NotificationsTransactionData;
};

const UpdateNotificationMethodStep = ({
    policy,
    transactionData,
}: UpdateNotificationMethodStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'updateNotificationMethodForBeneficiary',
    });

    const notificationPrefs = transactionData?.entity?.notificationPreferences;
    const originalEmail = notificationPrefs?.email?.emailAddress || '';
    const originalFax = notificationPrefs?.fax?.faxNumber || '';
    const originalAddress = notificationPrefs?.address || {};

    const {
        emailData,
        setEmailData,
        faxData,
        setFaxData,
        addressData,
        setAddressData,
        setCaseId,
        setSubmitFailed,
        notificationMethodSelected,
        setNotificationMethodSelected,
    } = useUpdateNotificationMethod();
    const [address, setAddress] = useState<
        AddressNotificationMethod | undefined
    >(originalAddress);
    const [fax, setFax] = useState<string>(originalFax);
    const [email, setEmail] = useState<string>(originalEmail);
    const { goToNext } = useWorkflow();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<FormValidationErrors>();

    const partyData = { ...transactionData?.entity?.party };

    const validateForm = () => {
        switch (notificationMethodSelected) {
            case ClaimCommunicationTypes.Email: {
                const emailError = validateEmail(email);
                if (emailError) {
                    setErrors({
                        ...errors,
                        email: t(
                            `updateNotificationMethodStep.notificationMethods.${emailError}`
                        ),
                    });
                    return false;
                }
                return true;
            }
            case ClaimCommunicationTypes.Fax: {
                const faxError = validateFax(fax);
                if (faxError) {
                    setErrors({
                        ...errors,
                        fax: t(
                            `updateNotificationMethodStep.notificationMethods.${faxError}`
                        ),
                    });
                    return false;
                }
                return true;
            }
            case ClaimCommunicationTypes.Mail: {
                const addressError = validateAddress(address);
                if (addressError) {
                    setErrors({
                        ...errors,
                        address: t(
                            `updateNotificationMethodStep.notificationMethods.${addressError}`
                        ),
                    });
                    return false;
                }
                return true;
            }
        }
    };

    const submit = useCallback(async () => {
        setIsLoading(true);
        const payload = buildUpdateNotificationMethodPayload(
            policy,
            transactionData,
            emailData,
            faxData,
            addressData,
            notificationMethodSelected
        );

        const successfulSubmit = await updateNotificationMethod(payload);

        if (successfulSubmit && successfulSubmit?.zlCaseId) {
            setCaseId(successfulSubmit?.zlCaseId);
            setSubmitFailed(false);
        } else {
            setCaseId('');
            setSubmitFailed(true);
        }
        setIsLoading(false);
    }, [
        policy,
        transactionData,
        emailData,
        faxData,
        addressData,
        notificationMethodSelected,
        setCaseId,
        setSubmitFailed,
    ]);

    const handleStepContinue = async () => {
        const isValid = validateForm();
        if (isValid) {
            await submit();
            goToNext();
        } else {
            return;
        }
    };

    const handleChangeRadio = (e: any) => {
        setNotificationMethodSelected(e.target.value);
        setErrors({});
    };

    const handleChangeEmail = (newEmail: any) => {
        setEmail(newEmail);
        if (newEmail !== originalEmail && newEmail !== emailData.emailAddress) {
            setEmailData({
                ...emailData,
                emailAddress: newEmail,
            });
            setErrors({ ...errors, email: '' });
        }
    };

    const handleChangeFax = (newFax: any) => {
        setFax(newFax);
        if (newFax !== originalFax && newFax !== faxData.faxNumber) {
            setFaxData({
                ...faxData,
                faxNumber: newFax,
            });
            setErrors({ ...errors, fax: '' });
        }
    };

    const handleChangeAddress = (newAddress: any) => {
        setAddress(newAddress);
        const isSameOriginal =
            JSON.stringify(originalAddress) === JSON.stringify(newAddress);
        const isSameContext =
            JSON.stringify(addressData) === JSON.stringify(newAddress);
        if (!isSameOriginal && !isSameContext) {
            setAddressData({
                ...(newAddress as AddressNotificationMethod),
            });
            setErrors({ ...errors, address: '' });
        }
    };

    const radioOptions = [
        {
            label: t('updateNotificationMethodStep.notificationMethods.email'),
            value: ClaimCommunicationTypes.Email,
            disabled: false,
            subElement: (
                <div className="w-full">
                    <EmailCard
                        email={email || ''}
                        setEmail={handleChangeEmail}
                    />
                    {errors?.email && (
                        <AssistiveText
                            text={errors?.email}
                            variant={AssistiveTextVariant.Error}
                            className="mt-2"
                        />
                    )}
                </div>
            ),
        },
        {
            label: t('updateNotificationMethodStep.notificationMethods.fax'),
            value: ClaimCommunicationTypes.Fax,
            disabled: false,
            subElement: (
                <div className="w-full">
                    <FaxCard fax={fax || ''} setFax={handleChangeFax} />
                    {errors?.fax && (
                        <AssistiveText
                            text={errors?.fax}
                            variant={AssistiveTextVariant.Error}
                            className="mt-2"
                        />
                    )}
                </div>
            ),
        },
        {
            label: t(
                'updateNotificationMethodStep.notificationMethods.address'
            ),
            value: ClaimCommunicationTypes.Mail,
            disabled: false,
            subElement: (
                <div className="w-full">
                    <AddressCard
                        address={address || ({} as AddressNotificationMethod)}
                        setAddress={handleChangeAddress}
                        carrierId={policy?.carrierId ?? ''}
                        partyData={partyData}
                    />
                    {errors?.address && (
                        <AssistiveText
                            text={errors?.address}
                            variant={AssistiveTextVariant.Error}
                            className="mt-2"
                        />
                    )}
                </div>
            ),
        },
    ];

    useEffect(() => {
        if (transactionData?.entity?.notificationPreferences?.email) {
            setEmailData(
                transactionData?.entity?.notificationPreferences?.email
            );
        }
        if (transactionData?.entity?.notificationPreferences?.fax) {
            setFaxData(transactionData?.entity?.notificationPreferences?.fax);
        }
        if (transactionData?.entity?.notificationPreferences?.address) {
            setAddressData(
                transactionData?.entity?.notificationPreferences?.address
            );
        }
        if (
            transactionData?.entity?.notificationPreferences?.notificationMethod
                ?.method
        ) {
            setNotificationMethodSelected(
                transactionData?.entity?.notificationPreferences
                    ?.notificationMethod?.method
            );
        }
    }, [
        transactionData,
        setEmailData,
        setFaxData,
        setAddressData,
        setNotificationMethodSelected,
    ]);

    return (
        <WorkflowCard
            title={t('updateNotificationMethodStep.title')}
            subtitle={t('updateNotificationMethodStep.subtitle') as string}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-4"
                    handleContinue={handleStepContinue}
                    planCode={policy?.product?.planCode}
                    policyNumber={policy?.policyNumber}
                    parentPage={ParentPage.None}
                />
            }
        >
            <div>
                <Typography variant={TypographyVariant.H3}>
                    {transactionData?.entity?.party?.fullName}
                </Typography>
                <div className="mt-4">
                    <Radio
                        items={radioOptions}
                        value={notificationMethodSelected}
                        disabled={false}
                        defaultValue={notificationMethodSelected}
                        onChange={handleChangeRadio}
                        className="text-sm"
                        alignItems="items-stretch"
                    />
                </div>
            </div>
        </WorkflowCard>
    );
};

export default UpdateNotificationMethodStep;
