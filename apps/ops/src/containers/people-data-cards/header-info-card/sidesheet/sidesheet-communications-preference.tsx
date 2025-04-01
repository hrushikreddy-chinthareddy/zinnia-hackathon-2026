import * as RadioGroup from '@radix-ui/react-radio-group';
import { UpdateEDeliveryPreferenceModel } from '@zinnia/api-types/types/preferences';
import { Label } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useContext, useMemo, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import CaseDocumentSelect, {
    CaseDocumentOption,
    PROCESS_WITHOUT_CASE_DOCUMENT,
    SetStateCaseId,
} from '@deps/components/case-document-select/case-document-select';
import AlertState from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/alert-state';
import ApiErrorState from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/api-error-state';
import BpmErrorState from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/bpm-error-state';
import LoadingState from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/loading-state';
import {
    ViewState,
    handleResponse,
} from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/states.helpers';
import SuccessState from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/success-state';
import WarnState from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/warn-state';
import { NonFinancialTransactionIdKeys } from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/types';
import TransactionCta from '@deps/components/transaction-cta/transaction-cta';
import { TranslationFiles } from '@deps/config/translations';
import { AddressDetails } from '@deps/containers/people-data-cards/address-card/side-sheet/side-sheet-address.helpers';
import { EmailDetails } from '@deps/containers/people-data-cards/email-card/side-sheet/side-sheet-email.helpers';
import {
    Errors,
    getFormErrors,
    SideSheetCommnunicationPreferenceProps,
} from '@deps/containers/people-data-cards/header-info-card/sidesheet/sidesheet-communications-preference.helpers';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { Processes } from '@deps/models/case/case';
import { PreferredCommunicationType, Email, Address } from '@deps/models/policy/sor-policy';
import { ValidationResult } from '@deps/queries/api/bpm';
import { NonFinancialTransactionActions, NonFinancialTransactionBody, NonFinancialTransactions } from '@deps/queries/api/bpm-non-financial';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

interface CommunicationPreferenceOption {
    contactType?: PreferredCommunicationType;
    contactInfo?: Email | Address;
}

export const SidesheetCommunicationsPreference = ({
    onCancel,
    party,
    planCode,
    policyNumber,
    setPreferredCommunication,
    emails,
    addresses,
}: SideSheetCommnunicationPreferenceProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'people.sideSheet.communicationpreference' });
    const { t: defaultT } = useTranslation();

    const { policyDetails } = useContext(PolicyData);
    const currentParty = policyDetails.parties?.getPartyById(party?.partyId ?? '');

    const INITIAL_BODY: NonFinancialTransactionBody = {
        correlationId: uuidV4(),
        effectiveDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
        reverseInitiator: false,
    };

    const [body, setBody] = useState(INITIAL_BODY);
    const [newCaseId, setNewCaseId] = useState<string | undefined>(undefined);
    const [caseDocumentOptions, setCaseDocumentOptions] = useState<CaseDocumentOption[]>([]);
    const [currentErrors, setCurrentErrors] = useState<Errors>();
    const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
    const [viewState, setViewState] = useState(ViewState.Default);
    const [selectedOption, setSelectedOption] = useState<CommunicationPreferenceOption | undefined>({
        contactType: currentParty?.preferredCommunicationType,
        contactInfo: currentParty?.preferredCommunication,
    });
    const { caseId } = body;
    const partyId = currentParty?.partyId ? (currentParty.partyId as string) : '';

    const partyFullName = party?.fullName ?? '';

    const stopLoading = currentErrors === undefined ? true : !!Object.entries(currentErrors).length;

    const mainCtaText = t('mainCta.update');

    const deliveryOption = selectedOption?.contactType;
    const selectedContactInfo = selectedOption?.contactInfo;

    const selectedRadioOption = useMemo(() => {
        if (!selectedContactInfo) return;
        if ('addressId' in selectedContactInfo) {
            return `addressId-${selectedContactInfo.addressId}`;
        }
        if ('emailId' in selectedContactInfo) {
            return `emailId-${selectedContactInfo.emailId}`;
        }
    }, [selectedContactInfo]);

    const handleChange = (value: string) => {
        if (value.includes('addressId')) {
            const addressId = value.split('-')[1];
            const address = addresses.find(address => address.addressId === addressId);
            const newOption = {
                contactType: PreferredCommunicationType.REGULARMAIL,
                contactInfo: address,
            };

            setSelectedOption(newOption);
        }
        if (value.includes('emailId')) {
            const emailId = value.split('-')[1];
            const email = emails.find(email => email.emailId === emailId);
            const newOption = {
                contactType: PreferredCommunicationType.REGULARMAIL,
                contactInfo: email,
            };
            setSelectedOption(newOption);
        }
    };

    const handleSubmit = async () => {
        if (!caseId && caseId !== PROCESS_WITHOUT_CASE_DOCUMENT) {
            setBody(prevBody => ({
                ...INITIAL_BODY,
                ...prevBody,
                caseId: PROCESS_WITHOUT_CASE_DOCUMENT,
            }));
            return;
        }

        const errors = getFormErrors({ preferredCommunication: selectedContactInfo, caseId: caseId ?? '', isDelete: false, t: defaultT });
        setCurrentErrors(errors);
        if (Object.keys(errors).length > 0 || !selectedContactInfo) return;

        if (!planCode || !policyNumber || !partyId) {
            return;
        }

        // const response = await updateEDeliveryPreferenceByPlanCode({
        //     planCode,
        //     policyNumber,
        //     partyId,
        //     newPreferencesData: {
        //         ...body,
        //         deliveryOption,
        //     },
        // });
        const response = {
            data: {
                caseId: '12345',
            },
        };

        handleResponse({
            response,
            setViewState,
            setValidationResults,
            setNewCaseId: () => {
                if (response?.data?.caseId) {
                    setNewCaseId(response.data.caseId);
                    setPreferredCommunication(selectedContactInfo);
                }
            },
        });
    };

    const emailRadioOptions = emails.map(role => ({
        label: role.emailAddress,
        value: role.emailId,
        type: NonFinancialTransactionIdKeys.Email,
        children: <EmailDetails email={role} />,
    }));

    const addressRadioOptions = addresses.map(role => ({
        label: role.addressType,
        value: role.addressId,
        type: NonFinancialTransactionIdKeys.Address,
        children: <AddressDetails address={role} />,
    }));

    switch (viewState) {
        case ViewState.Loading:
            return <LoadingState />;
        case ViewState.Alert:
            return <AlertState ctaAction={() => setViewState(ViewState.Default)} />;
        case ViewState.BpmError:
            return (
                <BpmErrorState
                    onCancel={onCancel}
                    onContinue={handleSubmit}
                    setViewState={setViewState}
                    transaction={NonFinancialTransactions.CommunicationPreference}
                    validationResults={validationResults}
                >
                    {selectedContactInfo && (
                        <>
                            {deliveryOption === UpdateEDeliveryPreferenceModel.deliveryOption.EMAIL && (
                                <EmailDetails email={selectedOption.contactInfo as Email} />
                            )}
                            {deliveryOption === PreferredCommunicationType.REGULARMAIL && (
                                <AddressDetails address={selectedOption.contactInfo as Address} />
                            )}
                        </>
                    )}
                </BpmErrorState>
            );
        case ViewState.ApiError:
            return (
                <ApiErrorState
                    action={NonFinancialTransactionActions.Edit}
                    name={partyFullName}
                    onCancel={onCancel}
                    onContinue={handleSubmit}
                    transaction={NonFinancialTransactions.CommunicationPreference}
                />
            );
        case ViewState.Warn:
            return (
                <WarnState
                    name={partyFullName}
                    onCancel={onCancel}
                    onContinue={() => {
                        setViewState(ViewState.Loading);
                        handleSubmit();
                    }}
                    transaction={NonFinancialTransactions.CommunicationPreference}
                />
            );
        case ViewState.Success:
            return (
                <SuccessState
                    action={NonFinancialTransactionActions.Edit}
                    isNigo={!!validationResults?.length}
                    name={partyFullName}
                    onCancel={onCancel}
                    transaction={NonFinancialTransactions.CommunicationPreference}
                    caseId={newCaseId}
                />
            );
        case ViewState.Default:
        default:
            return (
                <div className="flex flex-col gap-6 p-10">
                    <CaseDocumentSelect
                        caseDocumentOptions={caseDocumentOptions}
                        caseId={caseId}
                        currentErrors={currentErrors}
                        policyNumber={policyNumber}
                        processType={Processes.PolicyUpdate}
                        setBody={setBody as SetStateCaseId}
                        setCaseDocumentOptions={setCaseDocumentOptions}
                        setCurrentErrors={setCurrentErrors}
                        setViewState={setViewState}
                    />
                    <RadioGroup.Root
                        id="email-pref"
                        className="flex flex-col gap-2"
                        value={selectedRadioOption}
                        onValueChange={handleChange}
                    >
                        <Label size="lg" labelFor="email-pref">
                            <span className="typography-desktop-headline-4-d">Email</span>
                        </Label>
                        {emailRadioOptions.map(role => (
                            <RadioGroup.Item
                                className="hover:gray-300 border-2 text-start rounded p-4 border-border-light hover:border-border-hover data-[state=checked]:border-border-selected overflow-auto"
                                key={`people-chip-${role.label}`}
                                value={`emailId-${role.value}`}
                            >
                                {role.children}
                            </RadioGroup.Item>
                        ))}
                        <Label size="lg" labelFor="email-pref">
                            <span className="typography-desktop-headline-4-d">Address</span>
                        </Label>
                        {addressRadioOptions?.map(role => (
                            <RadioGroup.Item
                                className="hover:gray-300 border-2 text-start rounded p-4 border-border-light hover:border-border-hover data-[state=checked]:border-border-selected overflow-auto"
                                key={`people-chip-${role.label}`}
                                value={`addressId-${role.value}`}
                            >
                                {role.children}
                            </RadioGroup.Item>
                        ))}
                        {!!currentErrors?.address && <AssistiveText variant={AssistiveTextVariant.Error} text={currentErrors.address} />}
                        {!!currentErrors?.emailAddress && (
                            <AssistiveText variant={AssistiveTextVariant.Error} text={currentErrors.emailAddress} />
                        )}
                    </RadioGroup.Root>
                    {!!currentErrors?.communicationPreference && (
                        <AssistiveText variant={AssistiveTextVariant.Error} text={currentErrors.communicationPreference} />
                    )}
                    <TransactionCta
                        className="mt-4"
                        mainCta={{
                            onClick: handleSubmit,
                            text: mainCtaText,
                        }}
                        secondaryCta={{
                            onClick: onCancel,
                            text: t('general.cancel'),
                        }}
                        stopLoading={stopLoading}
                    />
                </div>
            );
    }
};
